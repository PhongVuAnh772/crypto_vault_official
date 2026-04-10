const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const logger = require('../utils/logger');
const globalEvents = require('../utils/events');

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

router.delete('/admin/tokens/:id', async (req, res) => {
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

router.delete('/admin/chains/:id', async (req, res) => {
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
      JOIN chains c ON w.chain_id = c.id
      ORDER BY w.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- TRANSACTION JOBS ---
router.get('/admin/jobs', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT j.*, c.name as chain_name 
      FROM transaction_jobs j
      JOIN chains c ON j.chain_id = c.id
      ORDER BY j.created_at DESC
      LIMIT 100
    `);
    res.json({ success: true, data: result.rows });
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
