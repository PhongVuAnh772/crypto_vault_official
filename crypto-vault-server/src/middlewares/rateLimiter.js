const logger = require('../utils/logger');

/**
 * In-memory sliding window rate limiter.
 * For production, replace with Redis-based implementation using ioredis.
 * 
 * Supports per-key rate limiting with configurable window and max requests.
 */

// In-memory store: key -> { timestamps: number[] }
const store = new Map();

// Cleanup interval (every 60 seconds, remove expired entries)
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of store) {
    data.timestamps = data.timestamps.filter(t => now - t < 120000);
    if (data.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, 60000);

/**
 * Create a rate limiter middleware.
 * @param {Object} options
 * @param {number} options.windowMs    - Time window in milliseconds (default: 60000 = 1 min)
 * @param {number} options.maxRequests - Max requests per window (default: 100)
 * @param {Function} options.keyFn     - Function to extract rate limit key from req (default: IP)
 * @param {string} options.message     - Error message (default: 'Rate limit exceeded')
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 60000,
    maxRequests = 100,
    keyFn = (req) => req.ip || req.connection?.remoteAddress || 'unknown',
    message = 'Rate limit exceeded. Please try again later.'
  } = options;

  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();

    if (!store.has(key)) {
      store.set(key, { timestamps: [] });
    }

    const data = store.get(key);

    // Remove timestamps outside the window
    data.timestamps = data.timestamps.filter(t => now - t < windowMs);

    if (data.timestamps.length >= maxRequests) {
      const retryAfter = Math.ceil((data.timestamps[0] + windowMs - now) / 1000);

      logger.warn(`[RATE_LIMIT] Key "${key}" exceeded ${maxRequests} requests in ${windowMs}ms`);

      res.set('Retry-After', String(retryAfter));
      res.set('X-RateLimit-Limit', String(maxRequests));
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', String(Math.ceil((data.timestamps[0] + windowMs) / 1000)));

      return res.status(429).json({
        success: false,
        error: message,
        retryAfter
      });
    }

    data.timestamps.push(now);

    // Set rate limit headers
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(maxRequests - data.timestamps.length));

    next();
  };
}

// ============================================================
// Pre-configured rate limiters
// ============================================================

/** Partner API: 100 requests/minute (overridable per API key) */
const partnerRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 100,
  keyFn: (req) => `partner:${req.partner?.id || req.ip}`,
  message: 'Partner API rate limit exceeded (100 req/min)'
});

/** User API: 30 requests/minute */
const userRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 30,
  keyFn: (req) => `user:${req.user?.id || req.ip}`,
  message: 'User API rate limit exceeded (30 req/min)'
});

/** Staff/Scanner API: 60 requests/minute */
const staffRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 60,
  keyFn: (req) => `staff:${req.staff?.id || req.ip}`,
  message: 'Staff API rate limit exceeded (60 req/min)'
});

/** QR Generation: 10 requests/minute per user (prevent abuse) */
const qrRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 10,
  keyFn: (req) => `qr:${req.user?.id || req.ip}`,
  message: 'QR generation rate limit exceeded (10 req/min)'
});

module.exports = {
  createRateLimiter,
  partnerRateLimiter,
  userRateLimiter,
  staffRateLimiter,
  qrRateLimiter
};
