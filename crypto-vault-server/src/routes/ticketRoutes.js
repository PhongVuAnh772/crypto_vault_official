const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const ticketService = require('../services/ticketService');
const { requirePartnerAuth, requireScope } = require('../middlewares/partnerAuthMiddleware');
const { partnerRateLimiter } = require('../middlewares/rateLimiter');
const auditService = require('../services/auditService');

/**
 * Ticket Routes
 * Endpoints for ticket issuance, management, and queries.
 * Accessed by partners via API key auth.
 */

// POST /api/v1/tickets/issue — Issue a single ticket
router.post('/issue', requirePartnerAuth, partnerRateLimiter, requireScope(['ticket:issue']), async (req, res) => {
  try {
    const {
      eventId, ticketTypeId, ownerWalletAddress, ownerUserId,
      seatInfo, gate, rowInfo, externalTicketId, metadataUri, metadata
    } = req.body;

    if (!eventId || !ticketTypeId || !ownerWalletAddress) {
      return res.status(400).json({
        success: false,
        error: 'eventId, ticketTypeId, and ownerWalletAddress are required'
      });
    }

    const ticket = await ticketService.issueTicket({
      partnerId: req.partner.id,
      eventId,
      ticketTypeId,
      ownerWalletAddress,
      ownerUserId,
      seatInfo,
      gate,
      rowInfo,
      externalTicketId,
      metadataUri,
      metadata,
      auditContext: auditService.fromRequest(req)
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    logger.error('[TICKET_ROUTE] Issue error:', err);
    const status = err.message.includes('not found') ? 404
      : err.message.includes('sold out') || err.message.includes('capacity') ? 409
      : 500;
    res.status(status).json({ success: false, error: err.message });
  }
});

// POST /api/v1/tickets/batch-issue — Batch issue tickets
router.post('/batch-issue', requirePartnerAuth, partnerRateLimiter, requireScope(['ticket:issue']), async (req, res) => {
  try {
    const { eventId, ticketTypeId, tickets } = req.body;

    if (!eventId || !ticketTypeId || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'eventId, ticketTypeId, and tickets array are required'
      });
    }

    if (tickets.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Batch size cannot exceed 50 tickets'
      });
    }

    const result = await ticketService.batchIssueTickets({
      partnerId: req.partner.id,
      eventId,
      ticketTypeId,
      tickets,
      auditContext: auditService.fromRequest(req)
    });

    res.status(201).json({
      success: true,
      data: {
        issued: result.issued.length,
        errors: result.errors.length,
        results: result.issued,
        failures: result.errors
      }
    });
  } catch (err) {
    logger.error('[TICKET_ROUTE] Batch issue error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/tickets/:id — Get ticket details
router.get('/:id', requirePartnerAuth, partnerRateLimiter, requireScope(['ticket:verify']), async (req, res) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Ensure partner can only see their own tickets
    if (ticket.partner_id !== req.partner.id) {
      return res.status(403).json({ success: false, error: 'Ticket does not belong to this partner' });
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/tickets/:id/cancel — Cancel ticket
router.post('/:id/cancel', requirePartnerAuth, partnerRateLimiter, requireScope(['ticket:cancel']), async (req, res) => {
  try {
    const ticket = await ticketService.cancelTicket(req.params.id, {
      cancelledBy: { type: 'PARTNER', id: req.partner.id },
      auditContext: auditService.fromRequest(req)
    });

    res.json({ success: true, data: ticket });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: err.message });
  }
});

// POST /api/v1/tickets/:id/refund — Refund ticket
router.post('/:id/refund', requirePartnerAuth, partnerRateLimiter, requireScope(['ticket:cancel']), async (req, res) => {
  try {
    const ticket = await ticketService.refundTicket(req.params.id, {
      refundedBy: { type: 'PARTNER', id: req.partner.id },
      auditContext: auditService.fromRequest(req)
    });

    res.json({ success: true, data: ticket });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: err.message });
  }
});

// GET /api/v1/tickets/wallet/:address — Get tickets by wallet
router.get('/wallet/:address', requirePartnerAuth, partnerRateLimiter, requireScope(['ticket:verify']), async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const tickets = await ticketService.getTicketsByWallet(req.params.address, {
      status, limit: parseInt(limit), offset: parseInt(offset)
    });
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/tickets/event/:eventId — Get tickets by event
router.get('/event/:eventId', requirePartnerAuth, partnerRateLimiter, requireScope(['event:read']), async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;
    const tickets = await ticketService.getTicketsByEvent(req.params.eventId, {
      status, limit: parseInt(limit), offset: parseInt(offset)
    });
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/tickets/:id/transfer — Transfer ticket
router.post('/:id/transfer', requirePartnerAuth, partnerRateLimiter, requireScope(['ticket:issue']), async (req, res) => {
  try {
    const { toAddress, toUserId } = req.body;
    if (!toAddress) {
      return res.status(400).json({ success: false, error: 'toAddress is required' });
    }

    const ticket = await ticketService.transferTicket(req.params.id, {
      toAddress,
      fromUserId: null,
      toUserId,
      auditContext: auditService.fromRequest(req)
    });

    res.json({ success: true, data: ticket });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, error: err.message });
  }
});

module.exports = router;
