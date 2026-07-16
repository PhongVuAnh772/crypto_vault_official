const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../utils/db');
const logger = require('../utils/logger');
const { requireAuth } = require('../middlewares/authMiddleware');
const { hashPassword } = require('../middlewares/authMiddleware');
const auditService = require('../services/auditService');

/**
 * Partner Routes
 * Endpoints for partner registration and management.
 * Used by admin dashboard and partner onboarding flow.
 */

// POST /api/v1/partners/register — Register new partner
router.post('/register', requireAuth, async (req, res) => {
  try {
    const { name, type, description, contactEmail, contactPhone, websiteUrl, webhookUrl } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'name and type are required' });
    }

    const validTypes = ['CINEMA', 'CONCERT', 'AIRLINE', 'HOTEL', 'STADIUM', 'THEME_PARK', 'UNIVERSITY', 'GAMING', 'OTHER'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    // Generate webhook secret
    const webhookSecret = crypto.randomBytes(32).toString('hex');

    const result = await db.query(
      `INSERT INTO partners (name, type, description, contact_email, contact_phone, website_url, webhook_url, webhook_secret)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, type, description, contactEmail, contactPhone, websiteUrl, webhookUrl, webhookSecret]
    );

    await auditService.log({
      actorType: 'USER',
      actorId: req.user.id,
      action: 'partner.register',
      resourceType: 'partner',
      resourceId: result[0].id,
      description: `Registered partner "${name}" (${type})`,
      ...auditService.fromRequest(req)
    });

    res.status(201).json({
      success: true,
      data: {
        ...result[0],
        webhook_secret: webhookSecret // Return once on creation
      }
    });
  } catch (err) {
    logger.error('[PARTNER] Registration error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/partners/api-keys — Generate API key pair
router.post('/api-keys', requireAuth, async (req, res) => {
  try {
    const { partnerId, keyName, scopes, rateLimit, expiresAt } = req.body;
    if (!partnerId) {
      return res.status(400).json({ success: false, error: 'partnerId is required' });
    }

    // Verify partner exists
    const partners = await db.query('SELECT id FROM partners WHERE id = $1', [partnerId]);
    if (partners.length === 0) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    // Generate API key and secret
    const apiKey = `cv_${crypto.randomBytes(24).toString('hex')}`;
    const apiSecret = `cvs_${crypto.randomBytes(32).toString('hex')}`;
    const apiSecretHash = crypto.createHash('sha256').update(apiSecret).digest('hex');

    const result = await db.query(
      `INSERT INTO partner_api_keys (partner_id, key_name, api_key, api_secret_hash, scopes, rate_limit, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, partner_id, key_name, api_key, scopes, rate_limit, expires_at, created_at`,
      [partnerId, keyName || 'default', apiKey, apiSecretHash, scopes || null, rateLimit || 100, expiresAt || null]
    );

    await auditService.log({
      actorType: 'USER',
      actorId: req.user.id,
      action: 'partner.api_key.create',
      resourceType: 'partner',
      resourceId: partnerId,
      description: `Generated API key "${keyName || 'default'}" for partner`,
      ...auditService.fromRequest(req)
    });

    res.status(201).json({
      success: true,
      data: {
        ...result[0],
        api_secret: apiSecret // Return ONCE, never stored in plain text
      },
      warning: 'Save the api_secret now. It will not be shown again.'
    });
  } catch (err) {
    logger.error('[PARTNER] API key generation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/partners/profile — Get partner profile (by API key)
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const { partnerId } = req.query;
    if (!partnerId) {
      return res.status(400).json({ success: false, error: 'partnerId query param required' });
    }

    const partners = await db.query(
      `SELECT p.*, COUNT(e.id) as event_count
       FROM partners p
       LEFT JOIN events e ON e.partner_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [partnerId]
    );

    if (partners.length === 0) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    // Remove sensitive fields
    const partner = partners[0];
    delete partner.webhook_secret;

    res.json({ success: true, data: partner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/partners/webhook — Update webhook URL
router.put('/webhook', requireAuth, async (req, res) => {
  try {
    const { partnerId, webhookUrl } = req.body;
    if (!partnerId) {
      return res.status(400).json({ success: false, error: 'partnerId is required' });
    }

    await db.query(
      'UPDATE partners SET webhook_url = $1, updated_at = NOW() WHERE id = $2',
      [webhookUrl, partnerId]
    );

    res.json({ success: true, message: 'Webhook URL updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/partners — List all partners (admin)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { limit = 50, offset = 0, type } = req.query;
    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (type) {
      conditions.push(`p.type = $${paramIdx++}`);
      params.push(type);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parseInt(limit), parseInt(offset));

    const partners = await db.query(
      `SELECT p.*, COUNT(DISTINCT e.id) as event_count
       FROM partners p
       LEFT JOIN events e ON e.partner_id = p.id
       ${where}
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
      params
    );

    // Remove sensitive fields
    partners.forEach(p => delete p.webhook_secret);

    res.json({ success: true, data: partners });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
