const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const db = require('../utils/db');
const qrService = require('../services/qrService');
const ticketService = require('../services/ticketService');
const { requireStaffAuth } = require('../middlewares/staffAuthMiddleware');
const { staffRateLimiter } = require('../middlewares/rateLimiter');
const auditService = require('../services/auditService');

/**
 * Verification Routes
 * Endpoints for ticket QR verification and check-in.
 * Used by staff/scanner app.
 */

// POST /api/v1/verify/qr — Verify QR code payload
router.post('/qr', requireStaffAuth, staffRateLimiter, async (req, res) => {
  try {
    const { payload } = req.body;

    if (!payload) {
      return res.status(400).json({ success: false, error: 'QR payload is required' });
    }

    // Parse payload if it's a string
    const qrPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;

    const result = await qrService.verifyQRPayload(qrPayload);

    // Record scan in history (regardless of result)
    const scanResult = result.valid ? 'VALID' : (
      result.error?.includes('already been used') ? 'ALREADY_USED' :
      result.error?.includes('expired') ? 'EXPIRED' :
      result.error?.includes('cancelled') ? 'CANCELLED' :
      result.error?.includes('not found') ? 'NOT_FOUND' : 'INVALID'
    );

    await db.query(
      `INSERT INTO scan_history (ticket_id, event_id, staff_id, partner_id, scan_result, scan_method, device_info, location)
       VALUES ($1, $2, $3, $4, $5, 'QR', $6, $7)`,
      [
        qrPayload.tid,
        qrPayload.eid,
        req.staff.id,
        req.staff.partnerId,
        scanResult,
        JSON.stringify(req.body.deviceInfo || {}),
        JSON.stringify(req.body.location || {})
      ]
    ).catch(err => logger.error('[VERIFY] Failed to record scan:', err.message));

    if (result.valid) {
      res.json({
        success: true,
        data: {
          status: 'VALID',
          ticket: result.ticket,
          message: 'Ticket is valid and ready for check-in'
        }
      });
    } else {
      res.json({
        success: false,
        data: {
          status: scanResult,
          message: result.error,
          ticket: result.ticket || null
        }
      });
    }
  } catch (err) {
    logger.error('[VERIFY] QR verification error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/verify/check-in — Check-in ticket (mark as used)
router.post('/check-in', requireStaffAuth, staffRateLimiter, async (req, res) => {
  try {
    const { ticketId, scanMethod, deviceInfo, location } = req.body;

    if (!ticketId) {
      return res.status(400).json({ success: false, error: 'ticketId is required' });
    }

    const ticket = await ticketService.checkInTicket(ticketId, {
      staffId: req.staff.id,
      partnerId: req.staff.partnerId,
      scanMethod: scanMethod || 'QR',
      deviceInfo: deviceInfo || {},
      location: location || {}
    });

    res.json({
      success: true,
      data: {
        status: 'CHECKED_IN',
        ticket,
        message: 'Ticket successfully checked in'
      }
    });
  } catch (err) {
    const status = err.message.includes('not found') ? 404
      : err.message.includes('already been used') ? 409
      : 400;
    res.status(status).json({ success: false, error: err.message });
  }
});

// POST /api/v1/verify/offline — Submit offline verification batch
router.post('/offline', requireStaffAuth, staffRateLimiter, async (req, res) => {
  try {
    const { scans } = req.body;

    if (!Array.isArray(scans) || scans.length === 0) {
      return res.status(400).json({ success: false, error: 'scans array is required' });
    }

    const results = [];
    for (const scan of scans) {
      try {
        // Verify offline token
        const verification = qrService.verifyOfflineToken(scan.offlineToken);

        if (verification.valid) {
          // Attempt check-in
          const ticket = await ticketService.checkInTicket(verification.ticket.tid, {
            staffId: req.staff.id,
            partnerId: req.staff.partnerId,
            scanMethod: scan.scanMethod || 'QR',
            deviceInfo: scan.deviceInfo || {},
            location: scan.location || {}
          });

          // Mark scan as offline + synced
          await db.query(
            `UPDATE scan_history SET offline_scanned = true, synced_at = NOW()
             WHERE ticket_id = $1 AND staff_id = $2
             ORDER BY scanned_at DESC LIMIT 1`,
            [verification.ticket.tid, req.staff.id]
          );

          results.push({ ticketId: verification.ticket.tid, status: 'SYNCED', success: true });
        } else {
          results.push({ ticketId: scan.ticketId, status: 'INVALID', success: false, error: verification.error });
        }
      } catch (err) {
        results.push({ ticketId: scan.ticketId, status: 'ERROR', success: false, error: err.message });
      }
    }

    res.json({
      success: true,
      data: {
        total: scans.length,
        synced: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });
  } catch (err) {
    logger.error('[VERIFY] Offline sync error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/verify/ticket/:id/status — Quick status check
router.get('/ticket/:id/status', requireStaffAuth, staffRateLimiter, async (req, res) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.json({
      success: true,
      data: {
        ticketId: ticket.id,
        status: ticket.status,
        eventName: ticket.event_name,
        seatInfo: ticket.seat_info,
        ownerWallet: ticket.owner_wallet_address,
        usedAt: ticket.used_at
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
