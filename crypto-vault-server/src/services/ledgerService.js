const db = require('../utils/db');
const logger = require('../utils/logger');

class LedgerService {
  /**
   * Tạo lệnh rút tiền với Row-Level Locking (SELECT FOR UPDATE) an toàn tuyệt đối 
   */
  async processWithdrawal(userId, tokenId, walletId, toAddress, amount, fee) {
    const totalDeduction = parseFloat(amount) + parseFloat(fee);
    
    // Khởi tạo một Giao dịch (Transaction) Postgres
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. KHOÁ DÒNG SỐ DƯ (ROW-LEVEL LOCK) ĐỂ TRÁNH DOUBLE SPEND
      const balanceRes = await client.query(`
        SELECT id, available_balance, locked_balance 
        FROM balances 
        WHERE user_id = $1 AND token_id = $2
        FOR UPDATE
      `, [userId, tokenId]);

      if (balanceRes.rows.length === 0) {
        throw new Error('Balance account not found.');
      }

      const balance = balanceRes.rows[0];
      if (parseFloat(balance.available_balance) < totalDeduction) {
        throw new Error('Insufficient available balance.');
      }

      // 2. CẬP NHẬT TRẠNG THÁI SỐ DƯ (Chuyển sang locked)
      await client.query(`
        UPDATE balances 
        SET 
          available_balance = available_balance - $1,
          locked_balance = locked_balance + $1,
          updated_at = NOW()
        WHERE id = $2
      `, [totalDeduction, balance.id]);

      // 3. TẠO LỊCH SỬ GIAO DỊCH (Transaction)
      const txRes = await client.query(`
        INSERT INTO transactions (user_id, token_id, type, status, amount)
        VALUES ($1, $2, 'WITHDRAWAL', 'PROCESSING', $3)
        RETURNING id
      `, [userId, tokenId, totalDeduction]);
      const txId = txRes.rows[0].id;

      // 4. LƯU VÀO SỔ CÁI (Double-Entry Ledger) - Tạm khoá số dư
      await client.query(`
        INSERT INTO ledger_entries (transaction_id, user_id, token_id, entry_type, amount)
        VALUES ($1, $2, $3, 'DEBIT', $4)
      `, [txId, userId, tokenId, totalDeduction]);

      // 5. TẠO HỒ SƠ RÚT TIỀN ON-CHAIN
      const withdrawRes = await client.query(`
        INSERT INTO withdrawals (transaction_id, wallet_id, to_address, fee_amount, status)
        VALUES ($1, $2, $3, $4, 'PENDING')
        RETURNING id
      `, [txId, walletId, toAddress, fee]);

      // 6. ĐƯA LỆNH VÀO CÔNG NHÂN HÀNG ĐỢI (Queue Job) 
      await client.query(`
        INSERT INTO transaction_jobs (reference_id, job_type, status)
        VALUES ($1, 'BROADCAST_WITHDRAWAL', 'QUEUED')
      `, [withdrawRes.rows[0].id]);

      await client.query('COMMIT');
      logger.info(`[LedgerService] ✅ Rút tiền thành công. Xếp hàng đợi Job. TX: ${txId}`);
      
      return { success: true, transactionId: txId };

    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`[LedgerService] ❌ Fail processWithdrawal: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new LedgerService();
