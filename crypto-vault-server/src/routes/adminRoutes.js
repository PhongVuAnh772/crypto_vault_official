const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const logger = require('../utils/logger');
const adminWorkflowService = require('../services/adminService'); // File Service xử lý Workflow
const globalEvents = require('../utils/events');
const { ethers } = require('ethers');
const ticketBlockchainService = require('../services/ticketBlockchainService');
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
    const fields = Object.keys(updates).filter(k => ['name', 'is_active', 'rpc_url', 'is_testnet', 'coin_transfer_fee', 'token_transfer_fee', 'nft_transfer_fee'].includes(k));
    if (fields.length === 0) return res.json({ success: true, message: 'No fields to update' });

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map(f => updates[f]);
    values.push(id);

    const result = await db.query(
      `UPDATE chains SET ${setClause} WHERE id = $${values.length} RETURNING *`,
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

// --- NFT MARKETPLACE AUCTIONS ---
router.get('/admin/marketplace/auctions', async (req, res) => {
  try {
    const status = req.query.status ? String(req.query.status) : null;
    const result = status
      ? await db.query(
        `SELECT a.*, n.name AS nft_name, n.image_url AS nft_image_url
         FROM marketplace_auctions a
         LEFT JOIN marketplace_nfts n ON n.nft_address = a.nft_address
         WHERE a.status = $1
         ORDER BY a.updated_at DESC, a.created_at DESC`,
        [status],
      )
      : await db.query(
        `SELECT a.*, n.name AS nft_name, n.image_url AS nft_image_url
         FROM marketplace_auctions a
         LEFT JOIN marketplace_nfts n ON n.nft_address = a.nft_address
         ORDER BY a.updated_at DESC, a.created_at DESC`,
      );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/marketplace/auctions/:id/bids', async (req, res) => {
  try {
    const bids = await db.query(
      `SELECT * FROM marketplace_bids WHERE auction_id = $1 ORDER BY created_at DESC`,
      [req.params.id],
    );
    res.json({ success: true, data: bids.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/admin/marketplace/auctions/:id', requireRole(['super_admin', 'manager']), async (req, res) => {
  try {
    const { status, tx_hash, current_price, current_bidder, end_time } = req.body || {};
    const updates = [];
    const values = [];
    let idx = 1;

    if (status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (tx_hash !== undefined) {
      updates.push(`tx_hash = $${idx++}`);
      values.push(tx_hash || null);
    }
    if (current_price !== undefined) {
      const price = Number(current_price);
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({ success: false, error: 'current_price must be a non-negative number' });
      }
      updates.push(`current_price = $${idx++}`);
      values.push(price);
    }
    if (current_bidder !== undefined) {
      updates.push(`current_bidder = $${idx++}`);
      values.push(current_bidder || null);
    }
    if (end_time !== undefined) {
      const endTs = new Date(end_time).getTime();
      if (!Number.isFinite(endTs)) {
        return res.status(400).json({ success: false, error: 'end_time must be a valid ISO datetime' });
      }
      updates.push(`end_time = $${idx++}`);
      values.push(new Date(endTs).toISOString());
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    values.push(req.params.id);
    const result = await db.query(
      `UPDATE marketplace_auctions
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    if (!result.rowCount) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/admin/marketplace/bids/:id', requireRole(['super_admin', 'manager']), async (req, res) => {
  try {
    const { status, tx_hash } = req.body || {};
    const updates = [];
    const values = [];
    let idx = 1;

    if (status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (tx_hash !== undefined) {
      updates.push(`tx_hash = $${idx++}`);
      values.push(tx_hash || null);
    }
    if (!updates.length) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    values.push(req.params.id);
    const result = await db.query(
      `UPDATE marketplace_bids
       SET ${updates.join(', ')}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    if (!result.rowCount) {
      return res.status(404).json({ success: false, error: 'Bid not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- TRANSACTION FEE CONFIG ---
const DEFAULT_FEE_CONFIG = {
  enabled: true,
  mode: 'percentage', // percentage | flat
  percent: 0.2, // 0.2%
  flatAmount: 0,
  minFee: 0,
  maxFee: 0, // 0 = unlimited
  gasBufferPercent: 5,
  updatedBy: null,
};

const normalizeFeeConfig = (raw = {}) => ({
  enabled: raw.enabled !== undefined ? !!raw.enabled : DEFAULT_FEE_CONFIG.enabled,
  mode: raw.mode === 'flat' ? 'flat' : 'percentage',
  percent: Number(raw.percent ?? DEFAULT_FEE_CONFIG.percent),
  flatAmount: Number(raw.flatAmount ?? DEFAULT_FEE_CONFIG.flatAmount),
  minFee: Number(raw.minFee ?? DEFAULT_FEE_CONFIG.minFee),
  maxFee: Number(raw.maxFee ?? DEFAULT_FEE_CONFIG.maxFee),
  gasBufferPercent: Number(raw.gasBufferPercent ?? DEFAULT_FEE_CONFIG.gasBufferPercent),
  updatedBy: raw.updatedBy ?? null,
});

const validateFeeConfig = (cfg) => {
  if (!['percentage', 'flat'].includes(cfg.mode)) return 'mode must be percentage or flat';
  if (Number.isNaN(cfg.percent) || cfg.percent < 0 || cfg.percent > 100) return 'percent must be between 0 and 100';
  if (Number.isNaN(cfg.flatAmount) || cfg.flatAmount < 0) return 'flatAmount must be >= 0';
  if (Number.isNaN(cfg.minFee) || cfg.minFee < 0) return 'minFee must be >= 0';
  if (Number.isNaN(cfg.maxFee) || cfg.maxFee < 0) return 'maxFee must be >= 0';
  if (cfg.maxFee > 0 && cfg.maxFee < cfg.minFee) return 'maxFee must be >= minFee';
  if (Number.isNaN(cfg.gasBufferPercent) || cfg.gasBufferPercent < 0 || cfg.gasBufferPercent > 100) {
    return 'gasBufferPercent must be between 0 and 100';
  }
  return null;
};

const calculatePlatformFee = (amount, cfg) => {
  const amountNum = Number(amount || 0);
  if (!cfg.enabled || amountNum <= 0) return 0;

  let fee = cfg.mode === 'flat'
    ? cfg.flatAmount
    : (amountNum * cfg.percent) / 100;

  if (cfg.minFee > 0) fee = Math.max(fee, cfg.minFee);
  if (cfg.maxFee > 0) fee = Math.min(fee, cfg.maxFee);

  return Number(fee.toFixed(8));
};

router.get('/admin/fees', async (req, res) => {
  try {
    const result = await db.query("SELECT value FROM app_config WHERE key = 'transaction_fee'");
    if (result.rows.length === 0) {
      return res.json({ success: true, data: DEFAULT_FEE_CONFIG });
    }
    return res.json({ success: true, data: normalizeFeeConfig(result.rows[0].value) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/fees', requireRole(['super_admin', 'manager']), async (req, res) => {
  try {
    const input = req.body?.feeConfig || req.body || {};
    const feeConfig = normalizeFeeConfig({
      ...input,
      updatedBy: req.user?.id || null,
      updatedAt: new Date().toISOString(),
    });

    const validationError = validateFeeConfig(feeConfig);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const result = await db.query(
      `INSERT INTO app_config (key, value) VALUES ('transaction_fee', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()
       RETURNING value, updated_at`,
      [feeConfig]
    );

    globalEvents.emit('broadcast', {
      event: 'config_update',
      data: { type: 'transaction_fee', value: result.rows[0].value },
    });

    return res.json({
      success: true,
      data: result.rows[0].value,
      updated_at: result.rows[0].updated_at,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/fees/calculate', async (req, res) => {
  try {
    const { amount, networkFee = 0 } = req.body || {};
    if (amount === undefined || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'amount must be > 0' });
    }

    const cfgRes = await db.query("SELECT value FROM app_config WHERE key = 'transaction_fee'");
    const feeConfig = cfgRes.rows.length > 0
      ? normalizeFeeConfig(cfgRes.rows[0].value)
      : DEFAULT_FEE_CONFIG;

    const platformFee = calculatePlatformFee(amount, feeConfig);
    const networkFeeNum = Math.max(0, Number(networkFee || 0));
    const gasBufferAmount = Number(((networkFeeNum * feeConfig.gasBufferPercent) / 100).toFixed(8));
    const totalFee = Number((platformFee + networkFeeNum + gasBufferAmount).toFixed(8));

    return res.json({
      success: true,
      data: {
        amount: Number(amount),
        feeConfig,
        feeBreakdown: {
          platformFee,
          networkFee: networkFeeNum,
          gasBufferAmount,
          totalFee,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
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

// --- NFT TICKET MANAGEMENT & TESTNET MINTING ---
let recentMintedTickets = [];

async function handleTicketInfo(req, res) {
  try {
    const contractAddress = process.env.TICKET_CONTRACT_ADDRESS || '0x54D9F360D2A08f34C947371aF1Dd2652020f3ACc';
    const chain = 'sepolia';
    const pk = process.env.TICKET_MINTER_PRIVATE_KEY;
    let minterAddress = 'Chưa cài đặt';
    if (pk) {
      try {
        const w = new ethers.Wallet(pk);
        minterAddress = w.address;
      } catch (e) {}
    }

    res.json({
      success: true,
      data: {
        contractAddress,
        chain,
        minterAddress,
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
        explorerUrl: `https://sepolia.etherscan.io/address/${contractAddress}`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function handleTicketMint(req, res) {
  try {
    const { toAddress, eventName, ticketType, seatInfo, metadataUri } = req.body;
    const contractAddress = process.env.TICKET_CONTRACT_ADDRESS || '0x54D9F360D2A08f34C947371aF1Dd2652020f3ACc';

    if (!toAddress) {
      return res.status(400).json({ success: false, error: 'Địa chỉ ví nhận (toAddress) là bắt buộc' });
    }

    const ticketId = 'ticket_' + Date.now();
    const result = await ticketBlockchainService.mintTicketNFT({
      ticketId,
      contractAddress,
      chain: 'sepolia',
      toAddress,
      metadataUri: metadataUri || 'ipfs://bafkreid4x6ygpy7l2327y345',
      eventId: eventName || 'CryptoVault Festival 2026',
      ticketType: ticketType || 'VIP_PASS',
      seatInfo: seatInfo || 'VIP Row A-12'
    });

    const ticketRecord = {
      id: ticketId,
      tokenId: result.tokenId,
      toAddress,
      eventName: eventName || 'CryptoVault Festival 2026',
      ticketType: ticketType || 'VIP Pass',
      seatInfo: seatInfo || 'VIP Row A-12',
      txHash: result.txHash,
      explorerUrl: `https://sepolia.etherscan.io/tx/${result.txHash}`,
      mintedAt: new Date().toISOString()
    };

    recentMintedTickets.unshift(ticketRecord);

    res.json({
      success: true,
      data: ticketRecord
    });
  } catch (err) {
    logger.error('[ADMIN_TICKETS] Mint error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function handleTicketList(req, res) {
  try {
    res.json({
      success: true,
      data: recentMintedTickets
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Support multiple URL aliases so frontend calls never 404
router.get('/admin/tickets/info', handleTicketInfo);
router.get('/tickets/info', handleTicketInfo);

router.post('/admin/tickets/mint', handleTicketMint);
router.post('/tickets/mint', handleTicketMint);

router.get('/admin/tickets/list', handleTicketList);
router.get('/tickets/list', handleTicketList);

module.exports = router;
module.exports.handleTicketInfo = handleTicketInfo;
module.exports.handleTicketMint = handleTicketMint;
module.exports.handleTicketList = handleTicketList;
