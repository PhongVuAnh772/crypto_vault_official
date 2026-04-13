const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const logger = require('../utils/logger');
const adminWorkflowService = require('../services/adminService'); // File Service xử lý Workflow
const globalEvents = require('../utils/events');
const { requireAuth, requireRole, hashPassword, JWT_SECRET } = require('../middlewares/authMiddleware');

// --- MOBILE COMPATIBILITY ENDPOINTS (NO AUTH) ---

router.get('/mobile/setting-currency', async (req, res) => {
  try {
    const MOCK_SETTING_CURRENCIES = [
      { name: "US Dollar", rate: 1, symbol: "USD", sign: "$" },
      { name: "Euro", rate: 0.92, symbol: "EUR", sign: "€" },
      { name: "Vietnamese Dong", rate: 25000, symbol: "VND", sign: "₫" },
      { name: "Japanese Yen", rate: 155, symbol: "JPY", sign: "¥" },
      { name: "British Pound", rate: 0.79, symbol: "GBP", sign: "£" }
    ];
    res.json({ success: true, data: MOCK_SETTING_CURRENCIES });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/mobile/cryptos/currency', async (req, res) => {
  try {
    const MOCK_CRYPTOS_CURRENCY = [
      { name: "Bitcoin", price: 43000, slug: "bitcoin", symbol: "BTC" },
      { name: "Ethereum", price: 2300, slug: "ethereum", symbol: "ETH" },
      { name: "BNB", price: 310, slug: "binance-coin", symbol: "BNB" },
      { name: "Polygon", price: 0.78, slug: "polygon", symbol: "POL" },
      { name: "Toncoin", price: 2.35, slug: "toncoin", symbol: "TON" }
    ];
    res.json({ success: true, data: MOCK_CRYPTOS_CURRENCY });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/mobile/tokens/request', async (req, res) => {
  try {
    const { chain_id, symbol, name, decimals, contract_address, user_id, metadata } = req.body;
    const result = await db.query(
      `INSERT INTO custom_token_requests (chain_id, symbol, name, decimals, contract_address, user_id, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [chain_id, symbol, name, decimals, contract_address, user_id, metadata || {}]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AUTHENTICATION & INITIALIZE ---
router.post('/admin/setup', async (req, res) => {
  try {
    const check = await db.query('SELECT COUNT(*) FROM admins');
    if (parseInt(check.rows[0].count) > 0) return res.status(403).json({ success: false, error: 'Hệ thống đã có admin' });

    const { email, password } = req.body;
    const pwdHash = hashPassword(password);
    const result = await db.query(
      "INSERT INTO admins (email, password_hash, role) VALUES ($1, $2, 'super_admin') RETURNING id, email, role",
      [email, pwdHash]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const pwdHash = hashPassword(password);
    const result = await db.query(
      'SELECT id, email, role, is_active FROM admins WHERE email = $1 AND password_hash = $2 AND is_active = true',
      [email, pwdHash]
    );

    if (result.rows.length === 0) return res.status(401).json({ success: false, error: 'Sai email hoặc mật khẩu' });

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

    await db.query('UPDATE admins SET last_login = NOW() WHERE id = $1', [user.id]);
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Khoá bảo mật áp dụng cho toàn bộ thao tác admin (chỉ yêu cầu Token cơ bản)
router.use('/admin', requireAuth);

// --- TOKENS ---
router.get('/admin/tokens', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, c.name as chain_name 
      FROM tokens t 
      LEFT JOIN chains c ON t.chain_id = c.id 
      ORDER BY t.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    logger.error('Failed to fetch tokens', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/tokens', async (req, res) => {
  try {
    const { chain_id, symbol, name, decimals, contract_address, is_native } = req.body;
    const result = await db.query(
      `INSERT INTO tokens (chain_id, symbol, name, decimals, contract_address, is_native) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [chain_id, symbol, name, decimals, contract_address, is_native]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/admin/tokens/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic query
    const fields = Object.keys(updates).filter(k => ['symbol', 'name', 'is_active', 'decimals', 'contract_address'].includes(k));
    if (fields.length === 0) return res.json({ success: true, message: 'No fields to update' });

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map(f => updates[f]);
    values.push(id);

    const result = await db.query(
      `UPDATE tokens SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );

    globalEvents.emit('broadcast', { event: 'config_update', data: { type: 'token', id, ...updates } });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/admin/tokens/:id', requireRole(['super_admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM tokens WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- PROFILES ---
router.get('/admin/profiles', async (req, res) => {
  try {
    // SECURITY: Mnemonic is NOT stored in profiles table per schema.sql
    const result = await db.query('SELECT id, user_id, nickname, avatar_url, is_verified, created_at FROM profiles ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/admin/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified, nickname } = req.body;
    const result = await db.query(
      'UPDATE profiles SET is_verified = $1, nickname = $2 WHERE id = $3 RETURNING *',
      [is_verified, nickname, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- CHAINS ---
router.get('/admin/chains', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM chains ORDER BY name ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/chains', async (req, res) => {
  try {
    const { name, chain_key, architecture, is_testnet } = req.body;
    const result = await db.query(
      `INSERT INTO chains (name, chain_key, architecture, is_testnet) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, chain_key, architecture, is_testnet]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/admin/chains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic query
    const fields = Object.keys(updates).filter(k => ['name', 'is_active', 'rpc_url', 'is_testnet'].includes(k));
    if (fields.length === 0) return res.json({ success: true, message: 'No fields to update' });

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map(f => updates[f]);
    values.push(id);

    const result = await db.query(
      `UPDATE chains SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );

    globalEvents.emit('broadcast', { event: 'config_update', data: { type: 'chain', id, ...updates } });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/admin/chains/:id', requireRole(['super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM chains WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- P2P ORDERS & ADS ---
router.get('/admin/p2p/orders', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.*, t.symbol, c.name as chain_name 
      FROM p2p_orders o
      JOIN tokens t ON o.token_id = t.id
      JOIN chains c ON o.chain_id = c.id
      ORDER BY o.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/p2p/ads', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, t.symbol, c.name as chain_name 
      FROM p2p_ads a
      JOIN tokens t ON a.token_id = t.id
      JOIN chains c ON a.chain_id = c.id
      ORDER BY a.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- WALLETS ---
router.get('/admin/wallets', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT w.*, c.name as chain_name 
      FROM wallets w
      JOIN chains c ON w.chain_id::text = c.id::text
      ORDER BY w.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- SYSTEM JOBS ---
router.get('/admin/jobs', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT j.*, c.name as chain_name 
      FROM transaction_jobs j
      LEFT JOIN chains c ON j.reference_id = c.id
      ORDER BY j.created_at DESC
      LIMIT 100
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// THÊM: CÁC ROUTE PHỤC VỤ DASHBOARD WORKFLOW
// ==========================================

// 1. Quản lý Lệnh Rút Tiền (Withdrawals Queue)
router.get('/admin/withdrawals', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.id, t.user_id, t.token_id, t.amount, t.status, t.created_at
      FROM transactions t
      WHERE t.type = 'WITHDRAWAL' AND t.status = 'PENDING'
      ORDER BY t.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Approve Rút tiền
router.post('/admin/withdrawals/:id/approve', requireRole(['super_admin', 'manager']), async (req, res) => {
  try {
    const result = await adminWorkflowService.approveWithdrawal(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reject Rút Tiền
router.post('/admin/withdrawals/:id/reject', requireRole(['super_admin', 'manager']), async (req, res) => {
  try {
    const result = await adminWorkflowService.rejectWithdrawal(req.params.id, req.user.id, req.body.reason || 'Admin Rejected');
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Gỡ Tranh Chấp P2P
router.post('/admin/p2p/disputes/:escrowId/resolve', requireRole(['super_admin']), async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { resolution, reason } = req.body;
    if (!['FAVOR_BUYER', 'FAVOR_SELLER'].includes(resolution)) throw new Error('Invalid resolution');

    const result = await adminWorkflowService.resolveP2PDispute(escrowId, resolution, req.user.id, reason);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- CUSTOM TOKEN REQUESTS ---
router.get('/admin/custom-tokens', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, c.name as chain_name 
      FROM custom_token_requests r 
      JOIN chains c ON r.chain_id = c.id 
      WHERE r.status = 'PENDING'
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/custom-tokens/:id/approve', requireRole(['super_admin', 'manager']), async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    
    // 1. Get request data
    const reqData = await client.query('SELECT * FROM custom_token_requests WHERE id = $1', [id]);
    if (reqData.rows.length === 0) throw new Error('Request not found');
    const token = reqData.rows[0];

    // 2. Insert into official tokens table
    const insertResult = await client.query(
      `INSERT INTO tokens (chain_id, symbol, name, decimals, contract_address, is_native, is_active, metadata) 
       VALUES ($1, $2, $3, $4, $5, false, true, $6) 
       ON CONFLICT (chain_id, symbol, contract_address) DO UPDATE SET is_active = true
       RETURNING *`,
      [token.chain_id, token.symbol, token.name, token.decimals, token.contract_address, token.metadata]
    );

    // 3. Update request status
    await client.query('UPDATE custom_token_requests SET status = $1, updated_at = NOW() WHERE id = $2', ['APPROVED', id]);

    await client.query('COMMIT');
    res.json({ success: true, data: insertResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

router.post('/admin/custom-tokens/:id/reject', requireRole(['super_admin', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("UPDATE custom_token_requests SET status = 'REJECTED', updated_at = NOW() WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- CONFIG ---
router.get('/config', async (req, res) => {
  try {
    const result = await db.query("SELECT value FROM app_config WHERE key = 'features'");
    if (result.rows.length === 0) {
      // Default config if not exists
      const defaultConfig = {
        p2pEnabled: true,
        swapEnabled: true,
        bridgeEnabled: false,
        maintenanceMode: false
      };
      return res.json({ success: true, features: defaultConfig });
    }
    res.json({ success: true, features: result.rows[0].value });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/config', async (req, res) => {
  try {
    const { features } = req.body;
    const result = await db.query(
      `INSERT INTO app_config (key, value) VALUES ('features', $1) 
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW() RETURNING value`,
      [features]
    );
    res.json({ success: true, config: { features: result.rows[0].value } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
