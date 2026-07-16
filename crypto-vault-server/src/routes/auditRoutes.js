const express = require('express');
const router = express.Router();
const auditService = require('../services/auditService');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

/**
 * Audit Routes
 * Admin-only endpoints for querying audit logs.
 */

// GET /api/v1/audit — Query audit logs
router.get('/', requireAuth, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const {
      actorType, actorId, action, resourceType, resourceId,
      fromDate, toDate, limit = 50, offset = 0
    } = req.query;

    const logs = await auditService.query({
      actorType,
      actorId,
      action,
      resourceType,
      resourceId,
      fromDate,
      toDate,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
