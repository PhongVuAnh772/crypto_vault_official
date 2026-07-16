const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { requireAuth } = require('../middlewares/authMiddleware');
const { userRateLimiter } = require('../middlewares/rateLimiter');

/**
 * Notification Routes
 * Endpoints for user notifications (mobile wallet app).
 */

// GET /api/v1/notifications — List user notifications
router.get('/', requireAuth, userRateLimiter, async (req, res) => {
  try {
    const { limit = 50, offset = 0, unreadOnly } = req.query;
    const notifications = await notificationService.getByUser(req.user.id, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true'
    });

    const unreadCount = await notificationService.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/notifications/:id/read — Mark as read
router.put('/:id/read', requireAuth, userRateLimiter, async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/notifications/read-all — Mark all as read
router.put('/read-all', requireAuth, userRateLimiter, async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
