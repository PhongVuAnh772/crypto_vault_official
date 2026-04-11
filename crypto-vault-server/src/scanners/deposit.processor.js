const { Worker } = require('bullmq');
const db = require('../utils/db');
const logger = require('../utils/logger');
const { redisConnection } = require('./queue.setup');

const processDepositWorker = new Worker('process-deposit', async job => {
  const { userId, walletId, chainId, tokenId, txHash, amount, isConfirmed } = job.data;
  
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. TÍNH CHẤT TRỌNG YẾU: THUẬT TOÁN BẤT BIẾN (IDEMPOTENCY)
    // Ngăn chặn nạp tiền 2 lần (Cho dù Server Blockchain có bị Retry)
    const checkRes = await client.query('SELECT id FROM deposits WHERE tx_hash = $1 FOR UPDATE', [txHash]);
    if (checkRes.rows.length > 0) {
      logger.info(`[DEPOSIT] 🛑 TxHash ${txHash} đã được nạp từ trước. Bỏ qua để tránh bị Double-Spend.`);
      await client.query('ROLLBACK');
      return; 
    }

    const status = isConfirmed ? 'COMPLETED' : 'PENDING';

    // 2. KHOÁ Toàn Bộ Row Balance Để Chờ Cộng Tiền
    // Ngăn cản lỗi Race Condition (Vừa nạp tiền vừa rút tiền trong cùng 1 Mili-giây)
    await client.query('SELECT id FROM balances WHERE user_id=$1 AND token_id=$2 FOR UPDATE', [userId, tokenId]);

    // 3. Mở Record ở bảng Transaction (Giao dịch chạm tới người dùng)
    const txRes = await client.query(`
      INSERT INTO transactions (user_id, token_id, type, status, amount)
      VALUES ($1, $2, 'DEPOSIT', $3, $4)
      RETURNING id
    `, [userId, tokenId, status, amount]);
    const txId = txRes.rows[0].id;

    // 4. Lưu Vết Gửi (Lớp Bảo Vệ Deposit)
    await client.query(`
      INSERT INTO deposits (transaction_id, wallet_id, tx_hash, confirmations, status)
      VALUES ($1, $2, $3, 0, $4)
    `, [txId, walletId, txHash, status]);

    // 5. Nếu xác nhận qua được Threshold (> 6 Blocks an toàn) -> Ghi Tăng Tiền Mặt!
    if (isConfirmed) {
      await client.query(`
        INSERT INTO ledger_entries (transaction_id, user_id, token_id, entry_type, amount)
        VALUES ($1, $2, $3, 'CREDIT', $4)
      `, [txId, userId, tokenId, amount]);
      
      await client.query(`
        UPDATE balances SET available_balance = available_balance + $1, updated_at = NOW()
        WHERE user_id = $2 AND token_id = $3
      `, [amount, userId, tokenId]);

      logger.info(`[DEPOSIT] 💎 Nạp thành công ${amount} (Token: ${tokenId}) cho User ${userId}. TX: ${txHash}`);
    } else {
      logger.info(`[DEPOSIT] 🕒 Lệnh nạp treo (PENDING) chờ Check Confirmations. TX: ${txHash}`);
    }

    await client.query('COMMIT');

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(`[DEPOSIT] 👾 Lỗi Hệ Thống: ${error.message} - Sẽ được BullMQ Quăng Vào Retry Queue!`);
    throw error;
  } finally {
    client.release();
  }
}, { 
  connection: redisConnection,
  concurrency: 50 // Server có thể chịu 50 luồng chạy vô hướng cùng lúc vì Row Locking của Postgres lo
});

module.exports = { processDepositWorker };
