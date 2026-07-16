const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { requirePartnerAuth } = require('../middlewares/partnerAuthMiddleware');
const { partnerRateLimiter } = require('../middlewares/rateLimiter');
const webhookService = require('../services/webhookService');

/**
 * Webhook Routes
 * Endpoints for webhook log viewing, retry, and testing.
 */

// GET /api/v1/webhooks/logs — View webhook delivery logs
router.get('/logs', requirePartnerAuth, partnerRateLimiter, async (req, res) => {
  try {
    const { status, eventType, limit = 50, offset = 0 } = req.query;
    const conditions = ['partner_id = $1'];
    const params = [req.partner.id];
    let paramIdx = 2;

    if (status) {
      conditions.push(`status = $${paramIdx++}`);
      params.push(status);
    }
    if (eventType) {
      conditions.push(`event_type = $${paramIdx++}`);
      params.push(eventType);
    }

    params.push(parseInt(limit), parseInt(offset));
    const logs = await db.query(
      `SELECT id, event_type, url, response_status, response_time_ms, retry_count, status, error_message, created_at, delivered_at
       FROM webhook_logs
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
      params
    );

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/webhooks/retry/:id — Retry a failed webhook
router.post('/retry/:id', requirePartnerAuth, partnerRateLimiter, async (req, res) => {
  try {
    // Verify log belongs to this partner
    const logs = await db.query(
      'SELECT id FROM webhook_logs WHERE id = $1 AND partner_id = $2',
      [req.params.id, req.partner.id]
    );
    if (logs.length === 0) {
      return res.status(404).json({ success: false, error: 'Webhook log not found' });
    }

    await webhookService.manualRetry(req.params.id);
    res.json({ success: true, message: 'Webhook retry initiated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/webhooks/test — Send test webhook
router.post('/test', requirePartnerAuth, partnerRateLimiter, async (req, res) => {
  try {
    await webhookService.sendTest(req.partner.id);
    res.json({ success: true, message: 'Test webhook sent' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
