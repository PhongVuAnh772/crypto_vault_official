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
        const { type, content, images, trade_data, user_id, user_name, location } = req.body;
        
        const finalUserId = user_id || 'usr-master';

        // Ensure user exists in users table to satisfy foreign key constraint
        await db.query(`
            INSERT INTO users (ext_user_id) 
            VALUES ($1) 
            ON CONFLICT (ext_user_id) DO NOTHING
        `, [finalUserId]);

        const result = await db.query(`
            INSERT INTO social_posts (user_id, user_name, type, content, images, trade_data, location) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *
        `, [
            finalUserId, 
            user_name || 'System Auto', 
            type || 'text', 
            content || '', 
            images ? JSON.stringify(images) : '[]', 
            trade_data ? JSON.stringify(trade_data) : null,
            location ? JSON.stringify(location) : null
        ]);
 
        res.json({ success: true, post: result.rows[0] });
    } catch (error) {
        logger.error('Error creating post', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
 
// GET /api/v1/feed - Get all feed items with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
 
    const { type, user_id } = req.query;
    let queryText = 'SELECT * FROM social_posts';
    let queryParams = [limit, offset];
    let paramIndex = 3;

    const conditions = [];
    if (type && type !== 'Khám phá') {
      conditions.push(`type = $${paramIndex++}`);
      queryParams.push(type.toLowerCase());
    }
    
    if (user_id) {
      conditions.push(`user_id = $${paramIndex++}`);
      queryParams.push(user_id);
    }

    if (conditions.length > 0) {
      queryText += ' WHERE ' + conditions.join(' AND ');
    }

    queryText += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;

    const { rows } = await db.query(queryText, queryParams);
 
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
      images: (typeof r.images === 'string' && r.images !== 'null') ? JSON.parse(r.images) : (r.images || []),
      location: (typeof r.location === 'string' && r.location !== 'null') ? JSON.parse(r.location) : r.location,
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

// GET /api/v1/feed/:id - Get a single post
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM social_posts WHERE id = $1', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        const r = rows[0];
        const formatted = {
            id: r.id,
            user: { id: r.user_id, name: r.user_name, avatar: r.user_avatar },
            type: r.type,
            content: r.content,
            images: (typeof r.images === 'string' && r.images !== 'null') ? JSON.parse(r.images) : (r.images || []),
            likes: r.likes_count,
            comments: r.comments_count,
            views: r.views_count,
            createdAt: new Date(r.created_at).getTime()
        };
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/v1/feed/:id/comments - Get comments for a post
router.get('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if post exists first
        const postCheck = await db.query('SELECT id FROM social_posts WHERE id = $1', [id]);
        if (postCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        await db.query(`
            CREATE TABLE IF NOT EXISTS social_comments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
                user_id VARCHAR(255) DEFAULT 'user-1',
                user_name VARCHAR(255) DEFAULT 'Anonymous',
                user_avatar TEXT DEFAULT 'https://via.placeholder.com/40',
                content TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const { rows } = await db.query(`
            SELECT * FROM social_comments 
            WHERE post_id = $1 
            ORDER BY created_at DESC
        `, [id]);

        const formattedComments = rows.map(r => ({
            id: r.id,
            post_id: r.post_id,
            user: {
                id: r.user_id,
                name: r.user_name,
                avatar: r.user_avatar
            },
            content: r.content,
            createdAt: new Date(r.created_at).getTime()
        }));

        res.json(formattedComments);
    } catch (error) {
        logger.error('Error fetching comments', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/v1/feed/:id/comments - Add a comment to a post
router.post('/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, user_id, user_name } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const result = await db.query(`
            INSERT INTO social_comments (post_id, user_id, user_name, content) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `, [id, user_id || 'usr-master', user_name || 'Anonymous', content]);

        // Update comment count on post
        await db.query(`
            UPDATE social_posts 
            SET comments_count = comments_count + 1 
            WHERE id = $1
        `, [id]);

        res.json({ success: true, comment: result.rows[0] });
    } catch (error) {
        logger.error('Error adding comment', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/v1/feed/:id - Delete a post
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM social_posts WHERE id = $1', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        logger.error('Error deleting post', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/v1/feed/profile/:userId - Get user profile
router.get('/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { rows } = await db.query(`
            SELECT p.*, 
            (SELECT COUNT(*) FROM social_posts WHERE user_id = p.user_id) as post_count
            FROM profiles p 
            WHERE p.user_id::text = $1
        `, [userId]);

        if (rows.length === 0) {
            // Return a default profile if not found
            return res.json({
                name: 'Anonymous User',
                avatar: 'https://i.pravatar.cc/150?u=' + userId,
                followers: '0',
                following: '0',
                bio: 'No bio available',
                education: 'Not specified',
                views: '0 views',
                joined: 'Joined recently'
            });
        }

        const p = rows[0];
        res.json({
            id: p.id,
            userId: p.user_id,
            name: p.nickname || 'Swapnil Ghosh',
            avatar: p.avatar_url || 'https://i.pravatar.cc/150?u=' + userId,
            isVerified: p.is_verified,
            followers: p.followers_count || '1M',
            following: p.following_count || '100',
            bio: p.bio || 'Former Email Marketing Specialist at GAOTEK 2024- 2025',
            education: p.education || 'S.S.C in Commerce, Narinda Govt. High. School Expected 2026',
            views: p.view_count || '655 content views 352 this month',
            joined: 'Joined ' + new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            postCount: p.post_count
        });
    } catch (error) {
        logger.error('Error fetching profile', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
