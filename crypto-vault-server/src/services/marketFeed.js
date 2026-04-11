const WebSocket = require('ws');
const logger = require('../utils/logger');

// Không gian nhớ trạm Tỷ giá Real-time
global.priceCache = new Map();

class MarketFeed {
  constructor(serverWss) {
    if (!serverWss) {
      logger.warn('[MARKET FEED] Khởi tạo không có Internal WebSocket Server, tính năng Broadcast sẽ bị ngắt.');
    }
    
    // Kết nối trực tiếp vào Lõi Mini-Ticker của Binance
    this.binanceWs = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');
    this.serverWss = serverWss; 
    
    // Bản đồ Throttle thời gian
    this.throttleMap = new Map();
    
    this.binanceWs.on('open', () => {
       logger.info(`[MARKET FEED] 🌐 Đã kết nối Thành Công tới Binance WebSocket.`);
    });

    this.binanceWs.on('message', (data) => {
      try {
        const parsed = JSON.parse(data);
        const now = Date.now();
        
        parsed.forEach(ticker => {
          // Lưu cache giá gốc bằng O(1) Memory Set để API DEX /quote dùng so sánh
          global.priceCache.set(ticker.s, parseFloat(ticker.c)); 

          // Logic Throttle: Chỉ truyền tải (Broadcast) tới Mobile/Web tối đa 1 lần mỗi 300ms
          const lastTime = this.throttleMap.get(ticker.s) || 0;
          if (now - lastTime > 300) {
             this.throttleMap.set(ticker.s, now);
             
             // Truyền thẳng data sạch tới App Client
             if (this.serverWss) {
                 this.broadcast({
                    event: "price_update",
                    data: { symbol: ticker.s, market: 'BINANCE', price: ticker.c, timestamp: now }
                 });
             }
          }
        });
      } catch (err) {
        logger.error(`[MARKET FEED] Lỗi giải mã Socket Binance: ${err.message}`);
      }
    });

    this.binanceWs.on('close', () => {
      logger.warn(`[MARKET FEED] Mất kết nối tới Binance. Sẽ khởi động lại vào 5 giây sau...`);
      setTimeout(() => new MarketFeed(this.serverWss), 5000);
    });
  }
  
  broadcast(payload) {
    if(!this.serverWss || !this.serverWss.clients) return;
    this.serverWss.clients.forEach(client => {
      // Chỉ gửi cho những Client Mobile/Admin đang OPEN
      if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(payload));
      }
    });
  }
}

module.exports = MarketFeed;
