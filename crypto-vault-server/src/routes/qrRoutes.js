const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const qrService = require('../services/qrService');
const { requireAuth } = require('../middlewares/authMiddleware');
const { qrRateLimiter } = require('../middlewares/rateLimiter');

/**
 * QR Routes
 * Endpoints for QR code generation and nonce management.
 * Used by mobile wallet app.
 */

// POST /api/v1/qr/generate — Generate dynamic QR payload for a ticket
router.post('/generate', requireAuth, qrRateLimiter, async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({ success: false, error: 'ticketId is required' });
    }

    const result = await qrService.generateQRPayload(ticketId);

    res.json({
      success: true,
      data: {
        payload: result.payload,
        qrString: result.qrString,
        expiresAt: result.expiresAt,
        ttlMs: qrService.QR_NONCE_TTL_MS
      }
    });
  } catch (err) {
    const status = err.message.includes('not found') ? 404
      : err.message.includes('not active') ? 400
      : 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

// POST /api/v1/qr/refresh-nonce — Refresh QR nonce (for auto-refresh loop)
router.post('/refresh-nonce', requireAuth, qrRateLimiter, async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({ success: false, error: 'ticketId is required' });
    }

    const result = await qrService.generateQRPayload(ticketId);

    res.json({
      success: true,
      data: {
        payload: result.payload,
        qrString: result.qrString,
        expiresAt: result.expiresAt,
        ttlMs: qrService.QR_NONCE_TTL_MS
      }
    });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

// POST /api/v1/qr/offline-token — Generate an offline verification token
router.post('/offline-token', requireAuth, qrRateLimiter, async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({ success: false, error: 'ticketId is required' });
    }

    const result = await qrService.generateOfflineToken(ticketId);

    res.json({
      success: true,
      data: {
        token: result.token,
        expiresAt: new Date(result.data.exp).toISOString()
      }
    });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

module.exports = router;
