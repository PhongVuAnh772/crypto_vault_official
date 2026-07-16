const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const externalTicketSync = require('../services/externalTicketSyncService');
const { requireAuth } = require('../middlewares/authMiddleware');
const auditService = require('../services/auditService');

/**
 * External Ticket Routes
 * Endpoints for browsing and purchasing tickets from external providers
 * (VNtix, Globaltix). Used by mobile wallet app.
 */

// GET /api/v1/external-tickets/providers — List available providers
router.get('/providers', async (_req, res) => {
  try {
    const providers = externalTicketSync.getProviders();
    res.json({ success: true, data: providers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/external-tickets/:provider/products — Browse products
router.get('/:provider/products', async (req, res) => {
  try {
    const { provider } = req.params;
    const { category, location, country } = req.query;

    const products = await externalTicketSync.fetchProducts(provider, {
      category,
      location,
      country,
    });

    res.json({ success: true, data: products, count: products.length });
  } catch (err) {
    const status = err.message.includes('Unknown provider') ? 400 : 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

// GET /api/v1/external-tickets/:provider/products/:productId — Product detail
router.get('/:provider/products/:productId', async (req, res) => {
  try {
    const { provider, productId } = req.params;
    const product = await externalTicketSync.getProduct(provider, productId);

    res.json({ success: true, data: product });
  } catch (err) {
    const status = err.message.includes('not found') ? 404
      : err.message.includes('Unknown provider') ? 400 : 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

// GET /api/v1/external-tickets/:provider/products/:productId/availability — Check availability
router.get('/:provider/products/:productId/availability', async (req, res) => {
  try {
    const { provider, productId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'date query parameter is required (YYYY-MM-DD)',
      });
    }

    const availability = await externalTicketSync.checkAvailability(provider, productId, date);
    res.json({ success: true, data: availability });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

// POST /api/v1/external-tickets/:provider/purchase — Purchase ticket and issue to wallet
router.post('/:provider/purchase', requireAuth, async (req, res) => {
  try {
    const { provider } = req.params;
    const {
      productId,
      optionId,
      quantity,
      visitDate,
      customerName,
      customerPhone,
      customerEmail,
      walletAddress,
    } = req.body;

    if (!productId || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'productId and walletAddress are required',
      });
    }

    const result = await externalTicketSync.purchaseAndIssue({
      provider,
      productId,
      optionId,
      quantity: quantity || 1,
      visitDate,
      customerName,
      customerPhone,
      customerEmail,
      walletAddress,
      userId: req.user?.id,
      auditContext: auditService.fromRequest(req),
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    logger.error(`[EXT_TICKET] Purchase error (${req.params.provider}):`, err);
    const status = err.message.includes('not found') ? 404
      : err.message.includes('Unknown provider') ? 400
      : err.message.includes('sold out') ? 409 : 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

module.exports = router;
