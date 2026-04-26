const axios = require('axios');
const db = require('../utils/db');
const logger = require('../utils/logger');

class BinanceCrawlerWorker {
  constructor() {
    this.intervalId = null;
    this.isCrawling = false;
  }

  /**
   * Start the worker
   * @param {number} intervalMs Default 1 hour (3600000ms)
   */
  start(intervalMs = 3600000) {
    if (this.intervalId) return;
    logger.info(`[BINANCE WORKER] 🚀 Started Binance Crawler Worker (Interval: ${intervalMs}ms)`);
    
    // Run immediately on start
    this.crawl();
    
    // Schedule periodic runs
    this.intervalId = setInterval(() => this.crawl(), intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async crawl() {
    if (this.isCrawling) return;
    this.isCrawling = true;

    try {
      logger.debug('[BINANCE WORKER] Fetching market data from Binance...');
      
      // 1. Get 24hr Ticker for all symbols
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
      const tickers = response.data;

      // 2. Find Top Gainers (> 5% change)
      const topGainers = tickers
        .filter(t => t.symbol.endsWith('USDT'))
        .map(t => ({
          symbol: t.symbol,
          priceChangePercent: parseFloat(t.priceChangePercent),
          lastPrice: parseFloat(t.lastPrice),
          quoteVolume: parseFloat(t.quoteVolume)
        }))
        .filter(t => t.priceChangePercent > 5)
        .sort((a, b) => b.priceChangePercent - a.priceChangePercent)
        .slice(0, 3); // Take top 3

      if (topGainers.length > 0) {
        await this.createMarketUpdatePost(topGainers);
      }

      // 3. Randomly fetch some news (Simulation for now)
      if (Math.random() > 0.7) {
        await this.createNewsPost();
      }

    } catch (err) {
      logger.error(`[BINANCE WORKER] ❌ Crawl failed: ${err.message}`);
    } finally {
      this.isCrawling = false;
    }
  }

  async createMarketUpdatePost(gainers) {
    try {
      const gainerText = gainers.map(g => `${g.symbol}: +${g.priceChangePercent.toFixed(2)}% ($${g.lastPrice})`).join('\n');
      const content = `🚀 [Market Alert] Các đồng coin đang bùng nổ trên Binance 24h qua:\n\n${gainerText}\n\nAnh em có đang giữ con nào trong này không? #Binance #Crypto #Gainer`;
      
      const botName = 'Binance Market Bot';
      
      // Check for duplicate recently
      const lastPost = await db.query('SELECT content FROM social_posts WHERE user_name = $1 ORDER BY created_at DESC LIMIT 1', [botName]);
      if (lastPost.rows.length > 0 && lastPost.rows[0].content === content) return;

      const botUserId = 'binance-bot';
      await db.query(`INSERT INTO users (ext_user_id) VALUES ($1) ON CONFLICT (ext_user_id) DO NOTHING`, [botUserId]);

      // Use a stable Binance/Market related image
      const imageUrl = 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1000&auto=format&fit=crop';

      await db.query(`
        INSERT INTO social_posts (user_id, user_name, user_avatar, type, content, images, likes_count, views_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        botUserId,
        botName,
        'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
        'news',
        content,
        JSON.stringify([imageUrl]),
        Math.floor(Math.random() * 500) + 100,
        Math.floor(Math.random() * 5000) + 1000
      ]);
      
      logger.info('[BINANCE WORKER] ✅ Posted market update with image to social feed');
    } catch (err) {
      logger.error('[BINANCE WORKER] ❌ Failed to create market post:', err.message);
    }
  }

  async createNewsPost() {
    const newsItems = [
      "Binance vừa công bố dự án Launchpool tiếp theo! Anh em đã chuẩn bị BNB chưa? 💎",
      "Thị trường đang có dấu hiệu hồi phục mạnh mẽ sau cú dump hôm qua. Liệu BTC có phá ATH mới? 📈",
      "Lượng Bitcoin trên các sàn giao dịch đang ở mức thấp nhất trong vòng 5 năm qua. Sắp có biến lớn? 🐋",
      "CZ vừa có chia sẻ mới về tương lai của Web3. Tầm nhìn 10 năm tới vẫn rất rạng rỡ! ✨"
    ];
    
    const content = newsItems[Math.floor(Math.random() * newsItems.length)];
    const botName = 'Binance News Hub';

    try {
      const botUserId = 'binance-bot';
      await db.query(`INSERT INTO users (ext_user_id) VALUES ($1) ON CONFLICT (ext_user_id) DO NOTHING`, [botUserId]);

      const newsImageUrl = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1000&auto=format&fit=crop';

      await db.query(`
        INSERT INTO social_posts (user_id, user_name, user_avatar, type, content, images, likes_count, views_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        botUserId,
        botName,
        'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
        'news',
        content,
        JSON.stringify([newsImageUrl]),
        Math.floor(Math.random() * 1000) + 500,
        Math.floor(Math.random() * 10000) + 5000
      ]);
      
      logger.info('[BINANCE WORKER] ✅ Posted news update with image to social feed');
    } catch (err) {
      logger.error('[BINANCE WORKER] ❌ Failed to create news post:', err.message);
    }
  }
}

module.exports = new BinanceCrawlerWorker();
