const Bottleneck = require('bottleneck');
const logger = require('../utils/logger');

/**
 * OrderQueue: 
 * - Rate limiting (max 10req/sec as a safe limit, or defined by user)
 * - Retries with exponential backoff for 429
 * - 100ms gap between requests
 */
class OrderQueue {
  constructor(options = {}) {
    this.limiter = new Bottleneck({
      id: 'binance-orders',
      minTime: options.minTime || 100, // 100ms between requests
      maxConcurrent: options.maxConcurrent || 1, // process one by one
      reservoir: options.reservoir || 10, // Initial balance
      reservoirRefreshAmount: options.reservoirRefreshAmount || 10,
      reservoirRefreshInterval: options.reservoirRefreshInterval || 1000 // Refill every second
    });

    this.limiter.on('failed', async (error, jobInfo) => {
      const { retryCount } = jobInfo;
      
      // Retry with exponential backoff on 429 errors
      if (error.response && error.response.status === 429 && retryCount < 5) {
        const waitTime = Math.pow(2, retryCount) * 1000;
        logger.warn(`Rate limit hit (429). Retrying in ${waitTime}ms. (Retry #${retryCount + 1})`);
        return waitTime;
      }
      
      logger.error('Order job failed', error.message || error);
    });

    this.limiter.on('error', (error) => {
      logger.error('Order queue error', error);
    });
  }

  async add(task, ...args) {
    return this.limiter.schedule(() => task(...args));
  }
}

module.exports = new OrderQueue();
