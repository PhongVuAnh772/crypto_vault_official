const crypto = require('crypto');
const axios = require('axios');
const db = require('../utils/db');
const logger = require('../utils/logger');

/**
 * Webhook Service
 * Delivers event notifications to partner webhook URLs with HMAC signature.
 * Implements exponential backoff retry (3 attempts: 1min, 5min, 30min).
 */

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [60000, 300000, 1800000]; // 1min, 5min, 30min
const WEBHOOK_TIMEOUT_MS = 10000; // 10 second timeout

/**
 * Supported webhook event types.
 */
const WEBHOOK_EVENTS = {
  TICKET_ISSUED: 'ticket.issued',
  TICKET_USED: 'ticket.used',
  TICKET_CANCELLED: 'ticket.cancelled',
  TICKET_TRANSFERRED: 'ticket.transferred',
  TICKET_REFUNDED: 'ticket.refunded',
  EVENT_CANCELLED: 'event.cancelled',
  EVENT_COMPLETED: 'event.completed',
  SCAN_COMPLETED: 'scan.completed'
};

/**
 * Sign a webhook payload with HMAC-SHA256.
 * @param {string} secret - Partner's webhook secret
 * @param {Object} body   - Webhook payload
 * @param {number} timestamp - Request timestamp
 * @returns {string} HMAC signature hex
 */
function signPayload(secret, body, timestamp) {
  const data = `${timestamp}.${JSON.stringify(body)}`;
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

/**
 * Deliver a webhook to a partner.
 * @param {Object} params
 * @param {string} params.partnerId   - Partner UUID
 * @param {string} params.eventType   - Event type string
 * @param {Object} params.payload     - Webhook payload data
 * @param {string} params.webhookUrl  - Override URL (optional, uses partner's registered URL)
 * @param {string} params.secret      - Override secret (optional)
 */
async function deliver({ partnerId, eventType, payload, webhookUrl, secret }) {
  try {
    // Fetch partner webhook config if not provided
    if (!webhookUrl || !secret) {
      const partners = await db.query(
        'SELECT webhook_url, webhook_secret FROM partners WHERE id = $1',
        [partnerId]
      );
      if (partners.length === 0) {
        logger.warn(`[WEBHOOK] Partner not found: ${partnerId}`);
        return;
      }
      webhookUrl = webhookUrl || partners[0].webhook_url;
      secret = secret || partners[0].webhook_secret;
    }

    if (!webhookUrl) {
      logger.debug(`[WEBHOOK] No webhook URL configured for partner: ${partnerId}`);
      return;
    }

    const timestamp = Date.now();
    const webhookPayload = {
      id: crypto.randomUUID(),
      event: eventType,
      timestamp: new Date(timestamp).toISOString(),
      data: payload
    };

    // Sign the payload
    const signature = secret ? signPayload(secret, webhookPayload, timestamp) : null;

    // Create log entry
    const logResult = await db.query(
      `INSERT INTO webhook_logs (partner_id, event_type, url, request_body, status)
       VALUES ($1, $2, $3, $4, 'PENDING')
       RETURNING id`,
      [partnerId, eventType, webhookUrl, JSON.stringify(webhookPayload)]
    );
    const logId = logResult[0].id;

    // Attempt delivery
    await attemptDelivery(logId, webhookUrl, webhookPayload, signature, timestamp);

  } catch (err) {
    logger.error(`[WEBHOOK] Delivery setup error for partner ${partnerId}:`, err.message);
  }
}

/**
 * Attempt a single webhook delivery.
 */
async function attemptDelivery(logId, url, payload, signature, timestamp) {
  const startTime = Date.now();
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Id': payload.id,
      'X-Webhook-Timestamp': String(timestamp)
    };
    if (signature) {
      headers['X-Webhook-Signature'] = signature;
    }

    const response = await axios.post(url, payload, {
      headers,
      timeout: WEBHOOK_TIMEOUT_MS,
      validateStatus: () => true // Don't throw on any status
    });

    const responseTimeMs = Date.now() - startTime;
    const isSuccess = response.status >= 200 && response.status < 300;

    await db.query(
      `UPDATE webhook_logs
       SET response_status = $1, response_body = $2, response_time_ms = $3,
           status = $4, delivered_at = CASE WHEN $4 = 'DELIVERED' THEN NOW() ELSE NULL END
       WHERE id = $5`,
      [
        response.status,
        typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        responseTimeMs,
        isSuccess ? 'DELIVERED' : 'FAILED',
        logId
      ]
    );

    if (isSuccess) {
      logger.info(`[WEBHOOK] Delivered ${payload.event} to ${url} (${response.status}, ${responseTimeMs}ms)`);
    } else {
      logger.warn(`[WEBHOOK] Failed ${payload.event} to ${url} (${response.status})`);
      await scheduleRetry(logId);
    }

  } catch (err) {
    const responseTimeMs = Date.now() - startTime;
    await db.query(
      `UPDATE webhook_logs
       SET response_time_ms = $1, status = 'FAILED', error_message = $2
       WHERE id = $3`,
      [responseTimeMs, err.message, logId]
    );
    logger.warn(`[WEBHOOK] Error delivering to ${url}: ${err.message}`);
    await scheduleRetry(logId);
  }
}

/**
 * Schedule a retry for a failed webhook.
 */
async function scheduleRetry(logId) {
  try {
    const logs = await db.query(
      'SELECT retry_count, max_retries FROM webhook_logs WHERE id = $1',
      [logId]
    );
    if (logs.length === 0) return;

    const { retry_count, max_retries } = logs[0];
    if (retry_count >= (max_retries || MAX_RETRIES)) {
      logger.warn(`[WEBHOOK] Max retries reached for log ${logId}`);
      return;
    }

    const delayMs = RETRY_DELAYS_MS[retry_count] || RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
    const nextRetryAt = new Date(Date.now() + delayMs);

    await db.query(
      `UPDATE webhook_logs SET retry_count = retry_count + 1, next_retry_at = $1, status = 'PENDING'
       WHERE id = $2`,
      [nextRetryAt, logId]
    );

    // Schedule the retry
    setTimeout(async () => {
      await retryWebhook(logId);
    }, delayMs);

    logger.info(`[WEBHOOK] Retry ${retry_count + 1} scheduled for log ${logId} at ${nextRetryAt.toISOString()}`);
  } catch (err) {
    logger.error(`[WEBHOOK] Failed to schedule retry for log ${logId}:`, err.message);
  }
}

/**
 * Retry a failed webhook delivery.
 */
async function retryWebhook(logId) {
  try {
    const logs = await db.query(
      `SELECT wl.*, p.webhook_secret
       FROM webhook_logs wl
       JOIN partners p ON p.id = wl.partner_id
       WHERE wl.id = $1 AND wl.status = 'PENDING'`,
      [logId]
    );
    if (logs.length === 0) return;

    const log = logs[0];
    const payload = typeof log.request_body === 'string'
      ? JSON.parse(log.request_body)
      : log.request_body;

    const timestamp = Date.now();
    const signature = log.webhook_secret
      ? signPayload(log.webhook_secret, payload, timestamp)
      : null;

    await attemptDelivery(logId, log.url, payload, signature, timestamp);
  } catch (err) {
    logger.error(`[WEBHOOK] Retry error for log ${logId}:`, err.message);
  }
}

/**
 * Manually retry a webhook by log ID.
 */
async function manualRetry(logId) {
  // Reset retry count and re-attempt
  await db.query(
    'UPDATE webhook_logs SET status = \'PENDING\', retry_count = 0 WHERE id = $1',
    [logId]
  );
  await retryWebhook(logId);
}

/**
 * Send a test webhook to a partner's URL.
 */
async function sendTest(partnerId) {
  const testPayload = {
    id: crypto.randomUUID(),
    event: 'webhook.test',
    timestamp: new Date().toISOString(),
    data: {
      message: 'This is a test webhook from CryptoVault Ticket Platform',
      partnerId
    }
  };

  return deliver({
    partnerId,
    eventType: 'webhook.test',
    payload: testPayload.data
  });
}

module.exports = {
  deliver,
  manualRetry,
  sendTest,
  retryWebhook,
  signPayload,
  WEBHOOK_EVENTS
};
