const crypto = require('crypto');
const db = require('../utils/db');
const logger = require('../utils/logger');

/**
 * Partner Authentication Middleware
 * 
 * Validates requests from third-party partners using:
 * 1. API Key (X-API-Key header)
 * 2. HMAC Signature (X-Signature header) over timestamp + body
 * 3. Timestamp freshness (X-Timestamp header, ±5min tolerance)
 * 4. Scope-based authorization
 */

const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Verify HMAC-SHA256 signature
 */
function verifyHmacSignature(apiSecret, timestamp, body, signature) {
  const payload = `${timestamp}.${JSON.stringify(body)}`;
  const expected = crypto
    .createHmac('sha256', apiSecret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  );
}

/**
 * Core partner authentication middleware.
 * Attaches `req.partner` with partner data and `req.apiKey` with key data.
 */
const requirePartnerAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Missing X-API-Key header'
      });
    }

    // 1. Look up API key
    const keyResult = await db.query(
      `SELECT pak.*, p.id as partner_id, p.name as partner_name, 
              p.type as partner_type, p.is_active as partner_active,
              p.webhook_url, p.webhook_secret
       FROM partner_api_keys pak
       JOIN partners p ON p.id = pak.partner_id
       WHERE pak.api_key = $1 AND pak.is_active = true`,
      [apiKey]
    );

    if (keyResult.length === 0) {
      logger.warn(`[PARTNER_AUTH] Invalid API key attempted: ${apiKey.substring(0, 8)}...`);
      return res.status(401).json({
        success: false,
        error: 'Invalid or inactive API key'
      });
    }

    const keyData = keyResult[0];

    // 2. Check partner is active
    if (!keyData.partner_active) {
      return res.status(403).json({
        success: false,
        error: 'Partner account is deactivated'
      });
    }

    // 3. Check key expiration
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'API key has expired'
      });
    }

    // 4. Verify HMAC signature (if signature header is present)
    if (signature) {
      if (!timestamp) {
        return res.status(400).json({
          success: false,
          error: 'X-Timestamp header required when X-Signature is provided'
        });
      }

      // Check timestamp freshness
      const reqTime = parseInt(timestamp, 10);
      const now = Date.now();
      if (isNaN(reqTime) || Math.abs(now - reqTime) > TIMESTAMP_TOLERANCE_MS) {
        return res.status(401).json({
          success: false,
          error: 'Request timestamp is stale or invalid'
        });
      }

      // Verify HMAC — we need the raw secret. Since we store a hash,
      // for HMAC verification we use the webhook_secret as the shared secret.
      // In production, store the actual secret encrypted, not hashed.
      try {
        const isValid = verifyHmacSignature(
          keyData.webhook_secret || keyData.api_secret_hash,
          timestamp,
          req.body || {},
          signature
        );
        if (!isValid) {
          logger.warn(`[PARTNER_AUTH] Invalid HMAC signature for partner: ${keyData.partner_name}`);
          return res.status(401).json({
            success: false,
            error: 'Invalid request signature'
          });
        }
      } catch (hmacErr) {
        return res.status(401).json({
          success: false,
          error: 'Invalid request signature format'
        });
      }
    }

    // 5. Update last_used_at
    db.query(
      'UPDATE partner_api_keys SET last_used_at = NOW() WHERE id = $1',
      [keyData.id]
    ).catch(err => logger.error('[PARTNER_AUTH] Failed to update last_used_at', err));

    // 6. Attach partner info to request
    req.partner = {
      id: keyData.partner_id,
      name: keyData.partner_name,
      type: keyData.partner_type,
      webhookUrl: keyData.webhook_url,
      webhookSecret: keyData.webhook_secret
    };
    req.apiKey = {
      id: keyData.id,
      scopes: keyData.scopes || [],
      rateLimit: keyData.rate_limit || 100
    };

    next();
  } catch (err) {
    logger.error('[PARTNER_AUTH] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication service error'
    });
  }
};

/**
 * Scope-based authorization middleware.
 * Must be used after requirePartnerAuth.
 * @param {string[]} requiredScopes - Array of required scopes (any match = authorized)
 */
const requireScope = (requiredScopes) => {
  return (req, res, next) => {
    if (!req.apiKey || !req.apiKey.scopes) {
      return res.status(403).json({
        success: false,
        error: 'No scopes available'
      });
    }

    const hasScope = requiredScopes.some(scope => req.apiKey.scopes.includes(scope));
    if (!hasScope) {
      logger.warn(`[PARTNER_AUTH] Scope denied. Required: ${requiredScopes.join(',')}. Has: ${req.apiKey.scopes.join(',')}`);
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required scopes: ${requiredScopes.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  requirePartnerAuth,
  requireScope,
  verifyHmacSignature,
  TIMESTAMP_TOLERANCE_MS
};
