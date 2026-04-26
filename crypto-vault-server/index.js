require('dotenv').config();
const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Check database connection
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Supabase PostgreSQL Database');
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  }
})();

app.use(cors());
app.use(express.json());

// --- ROUTES MOUNTING ---
const publicRoutes = require('./src/routes/publicRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const bitcoinRoutes = require('./src/routes/bitcoinRoutes');
const dexRoutes = require('./src/routes/dexRoutes');
const nftRoutes = require('./src/routes/nftRoutes');
const telegramRoutes = require('./src/routes/telegramRoutes');
const feedRoutes = require('./src/routes/feedRoutes');
const adsRoutes = require('./src/routes/adsRoutes');

// Mount under /api/v1/public to match mobile app expectations
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1', transactionRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1/bitcoin', bitcoinRoutes);
app.use('/api/v1/dex', dexRoutes);
app.use('/api/v1/nft', nftRoutes);
app.use('/api/v1/telegram', telegramRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/ads', adsRoutes);

// --- INLINE PUBLIC API (LEGACY) ---

// 1. Get configuration for APP
app.get('/api/v1/config', async (req, res) => {
  try {
    const featuresResult = await pool.query("SELECT value FROM app_config WHERE key = 'features' LIMIT 1");
    const features = featuresResult.rows[0]?.value || {};

    const tokensResult = await pool.query(`
      SELECT 
        t.id, t.symbol, t.name, t.decimals, t.is_native, 
        c.chain_key, 
        st.priority 
      FROM supported_tokens st
      JOIN tokens t ON st.token_id = t.id
      JOIN chains c ON t.chain_id = c.id
      WHERE st.is_visible = true
      ORDER BY st.priority ASC
    `);

    const rpcResult = await pool.query(`
      SELECT r.url, c.chain_key
      FROM rpc_endpoints r
      JOIN chains c ON r.chain_id = c.id
      WHERE r.is_active = true
    `);

    const rpcUrls = rpcResult.rows.reduce((acc, r) => {
      acc[r.chain_key] = r.url;
      return acc;
    }, {});

    const profilesResult = await pool.query("SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10");

    res.json({
      features,
      tokens: tokensResult.rows,
      rpcUrls,
      contacts: profilesResult.rows,
      minVersion: "1.0.0",
      announcement: "Hệ thống đang hoạt động ổn định! 🚀"
    });
  } catch (err) {
    console.error('❌ Error fetching config:', err.message);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// 2. Get P2P Ads
app.get('/api/v1/p2p/ads', async (req, res) => {
  try {
    const { type, symbol } = req.query;
    let query = `
      SELECT ads.*, t.symbol, p.nickname, p.avatar_url, p.is_verified
      FROM p2p_ads ads
      JOIN tokens t ON ads.token_id = t.id
      JOIN profiles p ON ads.user_id = p.user_id
      WHERE ads.status = 'ACTIVE'
    `;
    const params = [];
    if (type) {
      query += ` AND ads.type = $${params.length + 1}`;
      params.push(type.toUpperCase());
    }
    if (symbol) {
      query += ` AND t.symbol = $${params.length + 1}`;
      params.push(symbol.toUpperCase());
    }
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch P2P Ads' });
  }
});

// --- ADMIN CRUD API ---

// 3. Manage Tokens (CRUD)
app.get('/api/v1/admin/tokens', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, c.name as chain_name 
      FROM tokens t 
      JOIN chains c ON t.chain_id = c.id 
      ORDER BY t.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/admin/tokens', async (req, res) => {
  const { chain_id, symbol, name, decimals, contract_address, is_native } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tokens (chain_id, symbol, name, decimals, contract_address, is_native) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [chain_id, symbol, name, decimals, contract_address, is_native]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/v1/admin/tokens/:id', async (req, res) => {
  const { id } = req.params;
  const { symbol, name, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tokens SET symbol = $1, name = $2, is_active = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [symbol, name, is_active, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/v1/admin/tokens/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tokens WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Token deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Manage Config (CRUD-like)
app.post('/api/v1/admin/config', async (req, res) => {
  const { features } = req.body;
  try {
    await pool.query(
      "INSERT INTO app_config (key, value) VALUES ('features', $1) ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()",
      [features]
    );
    res.json({ success: true, config: { features } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Audit Profiles/Users
app.get('/api/v1/admin/profiles', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profiles ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Monitor P2P Ads
app.get('/api/v1/admin/p2p/ads', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ads.*, t.symbol, p.nickname 
      FROM p2p_ads ads
      JOIN tokens t ON ads.token_id = t.id
      JOIN profiles p ON ads.user_id = p.user_id
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('====================================');
  console.log(`🚀 Ledgerify Server running at http://localhost:${PORT}`);
  console.log('====================================');
});
