const db = require('../utils/db');
const logger = require('../utils/logger');

class AdminService {
  /**
   * Duyệt một lệnh Transaction Rút Tiền Đang Bị Giam
   */
  async approveWithdrawal(transactionId, adminId) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Lock the transaction to prevent race conditions
      const txRes = await client.query(`
        SELECT id, status, reference_id 
        FROM transactions 
        WHERE id = $1 AND type = 'WITHDRAWAL' AND status = 'PENDING'
        FOR UPDATE
      `, [transactionId]);

      if (txRes.rows.length === 0) throw new Error('Transaction not found or not in PENDING state');

      const tx = txRes.rows[0];

      // Đẩy Transaction sang PROCESSING
      await client.query("UPDATE transactions SET status = 'PROCESSING', updated_at = NOW() WHERE id = $1", [transactionId]);

      // Ném lệnh vào Hàng đợi cho Worker tự xử lý On-chain
      await client.query(`
        INSERT INTO transaction_jobs (reference_id, job_type, status)
        VALUES ($1, 'BROADCAST_WITHDRAWAL', 'QUEUED')
      `, [tx.reference_id]);

      // Ghi Audit
      await client.query(`
        INSERT INTO audit_logs (admin_id, action, resource, target_id, details)
        VALUES ($1, 'APPROVE_WITHDRAWAL', 'TRANSACTIONS', $2, '{"note": "Manual approval"}')
      `, [adminId, transactionId]);

      await client.query('COMMIT');
      return { success: true, message: "Withdrawal approved and queued for broadcast." };
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error(`[AdminService] Approve withdrawal failed: ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Từ chối Transaction rút tiền (Hoàn trả số dư đã khoá)
   */
  async rejectWithdrawal(transactionId, adminId, reason) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const txRes = await client.query(`
        SELECT id, status, amount, user_id, token_id 
        FROM transactions 
        WHERE id = $1 AND type = 'WITHDRAWAL' AND status = 'PENDING'
        FOR UPDATE
      `, [transactionId]);

      if (txRes.rows.length === 0) throw new Error('Transaction not pending');
      const tx = txRes.rows[0];

      // Gỡ khoá (Thêm lại vào available, trừ ở locked)
      await client.query(`
        UPDATE balances 
        SET available_balance = available_balance + $1, 
            locked_balance = locked_balance - $1, 
            updated_at = NOW() 
        WHERE user_id = $2 AND token_id = $3
      `, [tx.amount, tx.user_id, tx.token_id]);

      // Huỷ Transaction
      await client.query("UPDATE transactions SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1", [transactionId]);

      // Huỷ Ledger Debit liên quan
      await client.query(`
        INSERT INTO ledger_entries (transaction_id, user_id, token_id, entry_type, amount)
        VALUES ($1, $2, $3, 'CREDIT', $4)
      `, [transactionId, tx.user_id, tx.token_id, tx.amount]);

      // Ghi Audit
      await client.query(`
        INSERT INTO audit_logs (admin_id, action, resource, target_id, details)
        VALUES ($1, 'REJECT_WITHDRAWAL', 'TRANSACTIONS', $2, $3)
      `, [adminId, transactionId, JSON.stringify({ reason })]);

      await client.query('COMMIT');
      return { success: true, message: "Withdrawal rejected and funds unlocked." };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Xử lý Tranh chấp P2P bằng quyền sinh sát
   * resolution: FAVOR_BUYER | FAVOR_SELLER
   */
  async resolveP2PDispute(escrowId, resolution, adminId, reason) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Lock Escrow Record
      const escRes = await client.query(`
        SELECT id, order_id, seller_id, buyer_id, token_id, amount, status
        FROM p2p_escrows
        WHERE id = $1 AND status IN ('ESCROWED', 'DISPUTED')
        FOR UPDATE
      `, [escrowId]);

      if (escRes.rows.length === 0) throw new Error('Escrow not found or not disputable.');
      const escrow = escRes.rows[0];

      // Lock cả 2 cái Ví
      await client.query(`
        SELECT id FROM balances 
        WHERE token_id = $1 AND user_id IN ($2, $3)
        FOR UPDATE
      `, [escrow.token_id, escrow.seller_id, escrow.buyer_id]);

      // Ghi nhận transaction
      const txRes = await client.query(`
        INSERT INTO transactions (user_id, token_id, type, status, amount) 
        VALUES ($1, $2, 'P2P_RELEASE', 'COMPLETED', $3) RETURNING id
      `, [resolution === 'FAVOR_BUYER' ? escrow.buyer_id : escrow.seller_id, escrow.token_id, escrow.amount]);
      const txId = txRes.rows[0].id;

      if (resolution === 'FAVOR_BUYER') {
        // Trừ ở Locked seller, Giao cho BUYER Available
        await client.query("UPDATE balances SET locked_balance = locked_balance - $1 WHERE user_id = $2 AND token_id = $3", [escrow.amount, escrow.seller_id, escrow.token_id]);
        await client.query("UPDATE balances SET available_balance = available_balance + $1 WHERE user_id = $2 AND token_id = $3", [escrow.amount, escrow.buyer_id, escrow.token_id]);
        
        await client.query("INSERT INTO ledger_entries (transaction_id, user_id, token_id, entry_type, amount) VALUES ($1, $2, $3, 'DEBIT', $4), ($1, $5, $3, 'CREDIT', $4)", 
          [txId, escrow.seller_id, escrow.token_id, escrow.amount, escrow.buyer_id]);
      } else {
        // Trả lại Seller (Trừ Locked, tăng Available cho chính Seller)
        await client.query("UPDATE balances SET locked_balance = locked_balance - $1, available_balance = available_balance + $1 WHERE user_id = $2 AND token_id = $3", [escrow.amount, escrow.seller_id, escrow.token_id]);
        await client.query("INSERT INTO ledger_entries (transaction_id, user_id, token_id, entry_type, amount) VALUES ($1, $2, $3, 'CREDIT', $4)", 
          [txId, escrow.seller_id, escrow.token_id, escrow.amount]);
      }

      await client.query("UPDATE p2p_escrows SET status = 'COMPLETED' WHERE id = $1", [escrowId]);
      await client.query("UPDATE disputes SET status = 'RESOLVED', resolution_notes = $1 WHERE escrow_id = $2", [reason, escrowId]);

      await client.query(`
        INSERT INTO audit_logs (admin_id, action, resource, target_id, details)
        VALUES ($1, 'RESOLVE_DISPUTE', 'P2P_ESCROW', $2, $3)
      `, [adminId, escrowId, JSON.stringify({ resolution, reason })]);

      await client.query('COMMIT');
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new AdminService();
