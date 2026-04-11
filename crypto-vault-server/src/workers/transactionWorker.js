const db = require('../utils/db');
const logger = require('../utils/logger');

// Cơ chế ngắt ngầm (Polling Worker)
class TransactionWorker {
  constructor() {
    this.intervalId = null;
    this.isPolling = false;
  }

  start(intervalMs = 5000) {
    if (this.intervalId) return;
    logger.info(`[WORKER] 🚀 Started Transaction Job Worker (Poll: ${intervalMs}ms)`);
    this.intervalId = setInterval(() => this.pollJobs(), intervalMs);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }

  async pollJobs() {
    if (this.isPolling) return;
    this.isPolling = true;

    const client = await db.pool.connect();
    try {
      // BẮT BUỘC SỬ DỤNG "FOR UPDATE SKIP LOCKED" TRONG POSTGRESQL ĐỂ SCALING WORKERS
      await client.query('BEGIN');
      const fetchJobRes = await client.query(`
        SELECT * FROM transaction_jobs
        WHERE status IN ('QUEUED', 'RETRYING') 
          AND next_retry_at <= NOW()
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 5;
      `);

      if (fetchJobRes.rows.length > 0) {
        logger.info(`[WORKER] 🛠 Found ${fetchJobRes.rows.length} pending jobs. Executing...`);
      }

      for (const job of fetchJobRes.rows) {
        // Cập nhật trạng thái sang RUNNING để chống chạy hai lần
        await client.query("UPDATE transaction_jobs SET status = 'RUNNING' WHERE id = $1", [job.id]);
        
        try {
          if (job.job_type === 'BROADCAST_WITHDRAWAL') {
            await this.handleWithdrawal(client, job.reference_id);
          }
          // Các loại job khác...

          // Nếu thành công, đánh dấu job SUCCESS
          await client.query("UPDATE transaction_jobs SET status = 'SUCCESS' WHERE id = $1", [job.id]);
        } catch (jobErr) {
          logger.error(`[WORKER] ❌ Job ${job.id} failed: ${jobErr.message}`);
          
          // Exponential backoff retry logic
          const newRetryCount = job.retry_count + 1;
          if (newRetryCount >= 3) {
            // Quá số lần thử -> FAILED vĩnh viễn (Phải rollback bằng tay hoặc revert system)
            await client.query("UPDATE transaction_jobs SET status = 'FAILED', error_log = $2 WHERE id = $1", [job.id, jobErr.message]);
            // Revert logic tuỳ thuộc bussiness nếu thấy cần thiết
          } else {
            // Tính toán retry time: delay 1p, 5p, 15p...
            const delayMinutes = Math.pow(5, newRetryCount);
            await client.query(`
              UPDATE transaction_jobs 
              SET status = 'RETRYING', retry_count = $2, error_log = $3, 
                  next_retry_at = NOW() + ($4 || ' minutes')::INTERVAL 
              WHERE id = $1
            `, [job.id, newRetryCount, jobErr.message, delayMinutes]);
          }
        }
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`[WORKER] 🚨 Polling error: ${error.message}`);
    } finally {
      client.release();
      this.isPolling = false;
    }
  }

  // --- LOGIC XỬ LÝ NHIỆM VỤ CỤ THỂ --- //

  async handleWithdrawal(client, withdrawalId) {
    // 1. Phân tích Dữ liệu 
    const wdRes = await client.query(`SELECT * FROM withdrawals WHERE id = $1`, [withdrawalId]);
    if (wdRes.rows.length === 0) throw new Error("Withdrawal record not found!");
    
    const withdrawal = wdRes.rows[0];
    const txId = withdrawal.transaction_id;

    logger.info(`[WORKER] -> Broadcasting On-Chain transaction for WdID: ${withdrawalId}...`);
    // ==============================================
    // [KHU VỰC TÍCH HỢP CODE SDK BLOCKCHAIN VÀ TẠO CHỮ KÝ GIAO DỊCH (WEB3/BITCORE)]
    // Lấy private_key của hệ thống, connect tới RPC, broadcast raw_tx
    // Giả lập delay broadcast
    await new Promise(r => setTimeout(r, 2000));
    const fakeTxHash = '0x' + require('crypto').randomBytes(32).toString('hex');
    // ==============================================

    // 2. Chẳng may Broadcast thành công nhưng sập server? tx_hash cứu mạng ở bước deposit matching.
    await client.query("UPDATE withdrawals SET tx_hash = $1, status = 'COMPLETED' WHERE id = $2", [fakeTxHash, withdrawalId]);
    
    // 3. Thanh toán kế toán (Trừ Locked_balance)
    const txRes = await client.query("SELECT user_id, token_id, amount FROM transactions WHERE id = $1", [txId]);
    const { user_id, token_id, amount } = txRes.rows[0];

    await client.query(`
      UPDATE balances 
      SET locked_balance = locked_balance - $1, updated_at = NOW() 
      WHERE user_id = $2 AND token_id = $3
    `, [amount, user_id, token_id]);

    // 4. Record giao dịch hoàn thiện
    await client.query("UPDATE transactions SET status = 'COMPLETED', updated_at = NOW() WHERE id = $1", [txId]);

    logger.info(`[WORKER] ✅ Transaction Broadcased! TX Hash: ${fakeTxHash}`);
  }
}

module.exports = new TransactionWorker();
