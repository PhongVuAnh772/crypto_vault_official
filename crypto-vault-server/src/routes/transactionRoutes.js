const express = require('express');
const router = express.Router();
const ledgerService = require('../services/ledgerService');
const db = require('../utils/db');
// const { requireAuth } = require('../middlewares/authMiddleware'); 
// Ghi chú: Nếu hệ thống dùng Auth khác cho User thì sửa middleware tương ứng, ở đây tạm giả định middleware là tùy chọn hoặc đã check chung ở file app.use 

/**
 * Mở cổng POST /api/v1/wallets/withdraw
 * Yêu cầu Payload: { userId, tokenId, walletId, toAddress, amount, fee }
 */
router.post('/wallets/withdraw', async (req, res) => {
  try {
    const { userId, tokenId, walletId, toAddress, amount, fee } = req.body;

    // Validate params basic
    if (!userId || !tokenId || !walletId || !toAddress || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required parameters.' });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Amount must be greater than zero.' });
    }

    // Gọi Ledger Service để khóa tiền và khởi tạo luồng
    const result = await ledgerService.processWithdrawal(userId, tokenId, walletId, toAddress, amount, fee || 0);

    // Trả về 202 Accepted (Giao dịch đang được xử lý on-chain bởi Daemon Worker)
    return res.status(202).json({
      success: true,
      message: 'Withdrawal initiated successfully.',
      transactionId: result.transactionId
    });

  } catch (err) {
    // Nếu có lỗi "Insufficient available balance.", trả về 400 Bad Request
    const statusCode = err.message.includes('Insufficient') ? 400 : 500;
    res.status(statusCode).json({ success: false, error: err.message });
  }
});

/**
 * Lấy lịch sử giao dịch (Ledger Audit) của 1 User
 */
router.get('/ledger/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const historyRes = await db.query(`
      SELECT 
        l.id as ledger_id,
        t.type as tx_type,
        t.status as tx_status,
        t.amount as requested_amount,
        l.entry_type,
        l.amount as impact_amount,
        l.created_at
      FROM ledger_entries l
      JOIN transactions t ON l.transaction_id = t.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
      LIMIT 100
    `, [userId]);

    res.json({ success: true, data: historyRes.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
