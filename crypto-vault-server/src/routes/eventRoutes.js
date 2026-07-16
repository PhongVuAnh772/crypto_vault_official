const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const logger = require('../utils/logger');
const { requirePartnerAuth, requireScope } = require('../middlewares/partnerAuthMiddleware');
const { partnerRateLimiter } = require('../middlewares/rateLimiter');
const auditService = require('../services/auditService');

/**
 * Event Routes
 * CRUD endpoints for events. Accessed by partners via API key auth.
 */

// POST /api/v1/events — Create event
router.post('/', requirePartnerAuth, partnerRateLimiter, requireScope(['event:create']), async (req, res) => {
  try {
    const {
      externalId, name, description, eventType, venue, venueAddress,
      city, country, startTime, endTime, timezone, maxCapacity, posterUrl, metadata
    } = req.body;

    if (!name || !eventType || !startTime) {
      return res.status(400).json({
        success: false,
        error: 'name, eventType, and startTime are required'
      });
    }

    const result = await db.query(
      `INSERT INTO events (partner_id, external_id, name, description, event_type, venue, venue_address,
                           city, country, start_time, end_time, timezone, max_capacity, poster_url, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        req.partner.id, externalId, name, description, eventType, venue, venueAddress,
        city, country, startTime, endTime, timezone || 'UTC', maxCapacity, posterUrl,
        JSON.stringify(metadata || {})
      ]
    );

    await auditService.log({
      actorType: 'PARTNER',
      actorId: req.partner.id,
      action: 'event.create',
      resourceType: 'event',
      resourceId: result[0].id,
      description: `Created event "${name}"`,
      ...auditService.fromRequest(req)
    });

    res.status(201).json({ success: true, data: result[0] });
  } catch (err) {
    if (err.message.includes('duplicate key')) {
      return res.status(409).json({ success: false, error: 'Event with this external_id already exists' });
    }
    logger.error('[EVENT] Create error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/events — List events (partner-scoped)
router.get('/', requirePartnerAuth, partnerRateLimiter, requireScope(['event:read']), async (req, res) => {
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
    const events = await db.query(
      `SELECT * FROM events
       WHERE ${conditions.join(' AND ')}
       ORDER BY start_time DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
      params
    );

    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/events/:id — Get event details
router.get('/:id', requirePartnerAuth, partnerRateLimiter, requireScope(['event:read']), async (req, res) => {
  try {
    const events = await db.query(
      'SELECT * FROM events WHERE id = $1 AND partner_id = $2',
      [req.params.id, req.partner.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({ success: true, data: events[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/events/:id — Update event
router.put('/:id', requirePartnerAuth, partnerRateLimiter, requireScope(['event:update']), async (req, res) => {
  try {
    const { name, description, venue, venueAddress, city, country, startTime, endTime, maxCapacity, posterUrl, metadata } = req.body;
    const eventId = req.params.id;

    // Verify ownership
    const existing = await db.query(
      'SELECT * FROM events WHERE id = $1 AND partner_id = $2',
      [eventId, req.partner.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const result = await db.query(
      `UPDATE events SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         venue = COALESCE($3, venue),
         venue_address = COALESCE($4, venue_address),
         city = COALESCE($5, city),
         country = COALESCE($6, country),
         start_time = COALESCE($7, start_time),
         end_time = COALESCE($8, end_time),
         max_capacity = COALESCE($9, max_capacity),
         poster_url = COALESCE($10, poster_url),
         metadata = COALESCE($11, metadata),
         updated_at = NOW()
       WHERE id = $12
       RETURNING *`,
      [name, description, venue, venueAddress, city, country, startTime, endTime, maxCapacity, posterUrl, metadata ? JSON.stringify(metadata) : null, eventId]
    );

    await auditService.log({
      actorType: 'PARTNER',
      actorId: req.partner.id,
      action: 'event.update',
      resourceType: 'event',
      resourceId: eventId,
      description: `Updated event "${result[0].name}"`,
      ...auditService.fromRequest(req)
    });

    res.json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/events/:id/cancel — Cancel event
router.post('/:id/cancel', requirePartnerAuth, partnerRateLimiter, requireScope(['event:update']), async (req, res) => {
  try {
    const eventId = req.params.id;

    const events = await db.query(
      'SELECT * FROM events WHERE id = $1 AND partner_id = $2',
      [eventId, req.partner.id]
    );
    if (events.length === 0) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    if (events[0].status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'Event is already cancelled' });
    }

    // Cancel the event
    await db.query(
      "UPDATE events SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1",
      [eventId]
    );

    // Cancel all active tickets for this event
    const cancelledTickets = await db.query(
      `UPDATE tickets SET status = 'CANCELLED', cancelled_at = NOW(), updated_at = NOW()
       WHERE event_id = $1 AND status = 'ACTIVE'
       RETURNING id, owner_user_id`,
      [eventId]
    );

    await auditService.log({
      actorType: 'PARTNER',
      actorId: req.partner.id,
      action: 'event.cancel',
      resourceType: 'event',
      resourceId: eventId,
      description: `Cancelled event "${events[0].name}" (${cancelledTickets.length} tickets affected)`,
      ...auditService.fromRequest(req)
    });

    res.json({
      success: true,
      message: 'Event cancelled',
      ticketsCancelled: cancelledTickets.length
    });
  } catch (err) {
    logger.error('[EVENT] Cancel error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/events/:id/ticket-types — Create ticket type for event
router.post('/:id/ticket-types', requirePartnerAuth, partnerRateLimiter, requireScope(['event:update']), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, description, price, currency, maxSupply, isTransferable, isRefundable, refundDeadline, metadata } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'name is required' });
    }

    // Verify event ownership
    const events = await db.query(
      'SELECT id FROM events WHERE id = $1 AND partner_id = $2',
      [eventId, req.partner.id]
    );
    if (events.length === 0) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const result = await db.query(
      `INSERT INTO ticket_types (event_id, name, description, price, currency, max_supply, is_transferable, is_refundable, refund_deadline, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [eventId, name, description, price || 0, currency || 'USD', maxSupply, isTransferable !== false, isRefundable !== false, refundDeadline, JSON.stringify(metadata || {})]
    );

    res.status(201).json({ success: true, data: result[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/events/:id/ticket-types — List ticket types for event
router.get('/:id/ticket-types', requirePartnerAuth, partnerRateLimiter, requireScope(['event:read']), async (req, res) => {
  try {
    const types = await db.query(
      'SELECT * FROM ticket_types WHERE event_id = $1 ORDER BY price ASC',
      [req.params.id]
    );
    res.json({ success: true, data: types });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/events/:id/dashboard — Event dashboard stats
router.get('/:id/dashboard', requirePartnerAuth, partnerRateLimiter, requireScope(['event:read']), async (req, res) => {
  try {
    const ticketService = require('../services/ticketService');
    const dashboard = await ticketService.getEventDashboard(req.params.id);

    if (!dashboard) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({ success: true, data: dashboard });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
