const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const logger = require('../utils/logger');

// POST /api/v1/feed/like - Like a post
router.post('/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            UPDATE social_posts 
            SET likes_count = likes_count + 1 
            WHERE id = $1 
            RETURNING likes_count
        `, [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ success: true, likes: result.rows[0].likes_count });
    } catch (error) {
        logger.error('Error liking post', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/v1/feed/create - Create a new post
router.post('/create', async (req, res) => {
    try {
        const { type, content, images, trade_data, user_id, user_name } = req.body;
        
        const result = await db.query(`
            INSERT INTO social_posts (user_id, user_name, type, content, images, trade_data) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `, [
            user_id || 'usr-master', 
            user_name || 'System Auto', 
            type || 'text', 
            content || '', 
            images ? JSON.stringify(images) : '[]', 
            trade_data ? JSON.stringify(trade_data) : null
        ]);

        res.json({ success: true, post: result.rows[0] });
    } catch (error) {
        logger.error('Error creating post', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/v1/feed - Get all feed items with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // MVP: Auto-provision table and seed data if not found.
    // In production, this should be in a strict migration system.
    await db.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) DEFAULT 'user-1',
          user_name VARCHAR(255) DEFAULT 'Anonymous',
          user_avatar TEXT DEFAULT 'https://via.placeholder.com/40',
          type VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          images JSONB DEFAULT '[]',
          trade_data JSONB,
          likes_count INT DEFAULT 0,
          comments_count INT DEFAULT 0,
          views_count INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure we have some seed data for demonstration
    const countRes = await db.query('SELECT COUNT(*) FROM social_posts');
    if (parseInt(countRes.rows[0].count) === 0) {
       await db.query(`
         INSERT INTO social_posts (user_name, type, content, trade_data, likes_count, views_count) VALUES 
         ('Shanell Rannells', 'trade', 'Bác nào cho em hỏi sao em chốt lời 200u mà lại âm', '{"symbol":"BTCUSDT","pnl":-209.67,"roi":-52.4,"leverage":20,"positionSize":864,"entryPrice":9.258,"markPrice":9.10,"positionSide":"SHORT"}', 5, 14000),
         ('RIBKA_BITCOINER', 'news', 'CẬP NHẬT: Lạm phát...', 'null', 4, 7500),
         ('toigiaudo', 'trade', 'Long BTC để đổi đời anh em ơi!!! Cú dump vừa rồi chỉ là rũ hàng thôi nhé 🚀', '{"symbol":"BTCUSDT","pnl":1543.21,"roi":125.4,"leverage":50,"positionSize":1.5,"entryPrice":62450.0,"markPrice":65120.5,"positionSide":"LONG"}', 1250, 154000)
       `);
    }

    const { rows } = await db.query(`
      SELECT * FROM social_posts
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Map specific DB column names to frontend expected JSON properties
    const formattedRows = rows.map(r => ({
      id: r.id,
      user: {
        id: r.user_id,
        name: r.user_name,
        avatar: r.user_avatar
      },
      type: r.type,
      content: r.content,
      images: r.images === 'null' ? [] : r.images,
      // Handle the case where trade_data might be saved as text or null
      tradeData: (typeof r.trade_data === 'string' && r.trade_data !== 'null') ? JSON.parse(r.trade_data) : r.trade_data,
      likes: r.likes_count,
      comments: r.comments_count,
      views: r.views_count,
      createdAt: new Date(r.created_at).getTime()
    }));

    res.json(formattedRows);
  } catch (error) {
    logger.error('Failed to get feed API', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
