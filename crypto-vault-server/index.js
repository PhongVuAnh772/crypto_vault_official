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
    rejectUnauthorized: false // Supabase requires SSL, but usually with self-signed certs
  }
});

// Kiểm tra kết nối Database khi khởi động
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

// 1. Endpoint lấy cấu hình cho APP (Bản đồ "Mạng điều khiển" toàn cầu)
app.get('/api/v1/config', async (req, res) => {
  try {
    // A. Lấy Feature Flags từ app_config
    const featuresResult = await pool.query("SELECT value FROM app_config WHERE key = 'features' LIMIT 1");
    const features = featuresResult.rows[0]?.value || {};

    // B. Lấy Danh sách Token được hỗ trợ (Join tokens, chains, supported_tokens)
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

    // C. Lấy RPC URLs
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

    // D. Lấy danh sách hồ sơ (Contacts giả lập cho app)
    const profilesResult = await pool.query("SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10");

    // Tổng hợp cấu hình cuối cùng
    const finalConfig = {
      features,
      tokens: tokensResult.rows,
      rpcUrls,
      contacts: profilesResult.rows, // Sẽ dùng cho mục Quick Send
      minVersion: "1.0.0",
      announcement: "Hệ thống đã chuyển sang Supabase Database thành công! 🚀"
    };

    res.json(finalConfig);
  } catch (err) {
    console.error('❌ Error fetching config:', err.message);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// 2. Endpoint lấy danh sách P2P Ads (Thị trường nội bộ)
app.get('/api/v1/p2p/ads', async (req, res) => {
  try {
    const { type, symbol } = req.query; // BUY/SELL, USDT/BTC...
    
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
    
    // Format lại dữ liệu giống Binance API để app dễ tích hợp
    const formattedAds = result.rows.map(row => ({
      id: row.id,
      name: row.nickname,
      avatar: row.avatar_url,
      isVerified: row.is_verified,
      price: row.price,
      currency: "USD", // Giả định
      limitMin: row.min_limit,
      limitMax: row.max_limit,
      payments: ["Bank Transfer"], // Giả định
    }));

    res.json({ success: true, data: formattedAds });
  } catch (err) {
    console.error('❌ Error fetching P2P Ads:', err.message);
    res.status(500).json({ error: 'Failed to fetch P2P Ads' });
  }
});

app.listen(PORT, () => {
  console.log('====================================');
  console.log(`🚀 CryptoVault Server running at http://localhost:${PORT}`);
  console.log('====================================');
});
