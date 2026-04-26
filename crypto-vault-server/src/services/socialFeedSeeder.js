const db = require('../utils/db');
const logger = require('../utils/logger');

const mockPosts = [
  {
    user_id: 'user-001',
    user_name: 'The Crypto Whale 🐋',
    user_avatar: 'https://i.pravatar.cc/150?u=whale',
    type: 'trade',
    content: 'Bullish on ETH! My target is $4500 by the end of next month. Who is with me? 🚀🚀',
    trade_data: {
      symbol: 'ETH/USDT',
      pnl: 5420.50,
      roi: 85.50,
      leverage: 20,
      positionSize: 15.5,
      entryPrice: 2200.45,
      markPrice: 2550.20,
      positionSide: 'LONG'
    },
    likes_count: 5430,
    comments_count: 820,
    views_count: 125000
  },
  {
    user_id: 'user-002',
    user_name: 'NFT Hunter 🖼️',
    user_avatar: 'https://i.pravatar.cc/150?u=nft',
    type: 'live',
    content: 'Reviewing Top 10 NFT Collections on TON Blockchain. JOIN NOW!',
    images: ['https://images.unsplash.com/photo-1620336655055-088d06e7660c?q=80&w=1000&auto=format&fit=crop'],
    likes_count: 1250,
    comments_count: 45,
    views_count: 8900
  },
  {
    user_id: 'user-003',
    user_name: 'Daily News 📰',
    user_avatar: 'https://i.pravatar.cc/150?u=news',
    type: 'news',
    content: 'Binance announces new partnership with Gulf Crypto. BNB price reacts positively.',
    likes_count: 8900,
    comments_count: 1200,
    views_count: 240000
  },
  {
    user_id: 'user-004',
    user_name: 'Swing Trader',
    user_avatar: 'https://i.pravatar.cc/150?u=swing',
    type: 'trade',
    content: 'Shorting BTC from the local top. Market looks exhausted.',
    trade_data: {
      symbol: 'BTC/USDT',
      pnl: -150.20,
      roi: -5.20,
      leverage: 10,
      positionSize: 0.1,
      entryPrice: 66050.00,
      markPrice: 66200.50,
      positionSide: 'SHORT'
    },
    likes_count: 12,
    comments_count: 2,
    views_count: 450
  },
  {
    user_id: 'user-005',
    user_name: 'Master Miner',
    user_avatar: 'https://i.pravatar.cc/150?u=miner',
    type: 'image',
    content: 'Just received my new mining rig! Ready to earn some BTC.',
    images: [
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=1000&auto=format&fit=crop'
    ],
    likes_count: 450,
    comments_count: 120,
    views_count: 5600
  }
];

async function seedIfEmpty() {
  try {
    // 1. Ensure table exists
    await db.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE IF NOT EXISTS social_posts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) DEFAULT 'user-1',
          user_name VARCHAR(255) DEFAULT 'Anonymous',
          user_avatar TEXT DEFAULT 'https://via.placeholder.com/40',
          type VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          images JSONB DEFAULT '[]',
          location JSONB DEFAULT 'null',
          trade_data JSONB,
          likes_count INT DEFAULT 0,
          comments_count INT DEFAULT 0,
          views_count INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Check if empty
    const { rows } = await db.query('SELECT COUNT(*) FROM social_posts');
    if (parseInt(rows[0].count) > 0) {
      // logger.debug('[SOCIAL SEED] Table already has data, skipping.');
      return;
    }

    logger.info('[SOCIAL SEED] Database is empty, auto-seeding mock data...');

    // 2.5 Ensure mock users exist to satisfy foreign key constraints
    const mockUserIds = [...new Set(mockPosts.map(p => p.user_id))];
    for (const extId of mockUserIds) {
      await db.query(`
        INSERT INTO users (ext_user_id) 
        VALUES ($1) 
        ON CONFLICT (ext_user_id) DO NOTHING
      `, [extId]);
    }

    // 3. Insert mock data
    for (const post of mockPosts) {
      await db.query(`
        INSERT INTO social_posts (
          user_id, user_name, user_avatar, type, content, images, trade_data, likes_count, comments_count, views_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        post.user_id,
        post.user_name,
        post.user_avatar,
        post.type,
        post.content,
        post.images ? JSON.stringify(post.images) : '[]',
        post.trade_data ? JSON.stringify(post.trade_data) : null,
        post.likes_count,
        post.comments_count,
        post.views_count
      ]);
    }
    
    logger.info(`[SOCIAL SEED] Successfully auto-seeded ${mockPosts.length} posts.`);
  } catch (err) {
    logger.error(`[SOCIAL SEED] Error auto-seeding social feed: ${err.message}`, err);
  }
}

module.exports = { seedIfEmpty };
