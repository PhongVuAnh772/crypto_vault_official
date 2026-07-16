const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const logger = require('../utils/logger');
const { requireStaffAuth, requireStaffRole, generateStaffToken } = require('../middlewares/staffAuthMiddleware');
const { hashPassword } = require('../middlewares/authMiddleware');
const { staffRateLimiter } = require('../middlewares/rateLimiter');

/**
 * Staff Routes
 * Authentication and management endpoints for scanner/staff app.
 */

// POST /api/v1/staff/login — Staff login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'email and password are required' });
    }

    const passwordHash = hashPassword(password);
    const staff = await db.query(
      `SELECT s.*, p.name as partner_name, p.type as partner_type
       FROM staff s
       JOIN partners p ON p.id = s.partner_id
       WHERE s.email = $1 AND s.password_hash = $2 AND s.is_active = true`,
      [email, passwordHash]
    );

    if (staff.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or account deactivated' });
    }

    const staffData = staff[0];

    // Update last login
    await db.query('UPDATE staff SET last_login = NOW() WHERE id = $1', [staffData.id]);

    const token = generateStaffToken(staffData);

    res.json({
      success: true,
      data: {
        token,
        staff: {
          id: staffData.id,
          name: staffData.name,
          email: staffData.email,
          role: staffData.role,
          partnerId: staffData.partner_id,
          partnerName: staffData.partner_name,
          partnerType: staffData.partner_type
        }
      }
    });
  } catch (err) {
    logger.error('[STAFF] Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/staff/scan-history — View scan history
router.get('/scan-history', requireStaffAuth, staffRateLimiter, async (req, res) => {
  try {
    const { eventId, date, limit = 50, offset = 0 } = req.query;
    const conditions = ['sh.staff_id = $1'];
    const params = [req.staff.id];
    let paramIdx = 2;

    if (eventId) {
      conditions.push(`sh.event_id = $${paramIdx++}`);
      params.push(eventId);
    }
    if (date) {
      conditions.push(`DATE(sh.scanned_at) = $${paramIdx++}`);
      params.push(date);
    }

    params.push(parseInt(limit), parseInt(offset));
    const history = await db.query(
      `SELECT sh.*, t.seat_info, t.status as ticket_status,
              e.name as event_name, e.venue
       FROM scan_history sh
       JOIN tickets t ON t.id = sh.ticket_id
       JOIN events e ON e.id = sh.event_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY sh.scanned_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
      params
    );

    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/staff/stats — Scan statistics
router.get('/stats', requireStaffAuth, staffRateLimiter, async (req, res) => {
  try {
    const { eventId } = req.query;
    const conditions = ['sh.staff_id = $1'];
    const params = [req.staff.id];
    let paramIdx = 2;

    if (eventId) {
      conditions.push(`sh.event_id = $${paramIdx++}`);
      params.push(eventId);
    }

    const stats = await db.query(
      `SELECT
         COUNT(*) as total_scans,
         COUNT(*) FILTER (WHERE sh.scan_result = 'VALID') as valid_scans,
         COUNT(*) FILTER (WHERE sh.scan_result = 'INVALID') as invalid_scans,
         COUNT(*) FILTER (WHERE sh.scan_result = 'ALREADY_USED') as duplicate_scans,
         COUNT(*) FILTER (WHERE sh.is_check_in = true) as check_ins,
         COUNT(*) FILTER (WHERE sh.offline_scanned = true) as offline_scans,
         MIN(sh.scanned_at) as first_scan,
         MAX(sh.scanned_at) as last_scan
       FROM scan_history sh
       WHERE ${conditions.join(' AND ')}`,
      params
    );

    // Today's stats
    const todayStats = await db.query(
      `SELECT
         COUNT(*) as today_scans,
         COUNT(*) FILTER (WHERE sh.is_check_in = true) as today_check_ins
       FROM scan_history sh
       WHERE ${conditions.join(' AND ')} AND DATE(sh.scanned_at) = CURRENT_DATE`,
      params
    );

    res.json({
      success: true,
      data: {
        overall: stats[0],
        today: todayStats[0]
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/staff/register — Register staff (partner manager only)
router.post('/register', requireStaffAuth, requireStaffRole(['manager', 'admin']), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'email, password, and name are required' });
    }

    const passwordHash = hashPassword(password);
    const result = await db.query(
      `INSERT INTO staff (partner_id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, partner_id, email, name, role, created_at`,
      [req.staff.partnerId, email, passwordHash, name, role || 'scanner']
    );

    res.status(201).json({ success: true, data: result[0] });
  } catch (err) {
    if (err.message.includes('duplicate key')) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
