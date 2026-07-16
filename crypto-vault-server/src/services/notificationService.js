const db = require('../utils/db');
const logger = require('../utils/logger');

/**
 * Notification Service
 * Manages in-app notifications for ticket lifecycle events.
 * In production, extend with Firebase Cloud Messaging (FCM) for push notifications.
 */

const NOTIFICATION_TYPES = {
  TICKET_ISSUED: 'TICKET_ISSUED',
  TICKET_TRANSFERRED: 'TICKET_TRANSFERRED',
  TICKET_RECEIVED: 'TICKET_RECEIVED',
  TICKET_CANCELLED: 'TICKET_CANCELLED',
  TICKET_REFUNDED: 'TICKET_REFUNDED',
  TICKET_USED: 'TICKET_USED',
  EVENT_REMINDER: 'EVENT_REMINDER',
  EVENT_CANCELLED: 'EVENT_CANCELLED',
  EVENT_UPDATED: 'EVENT_UPDATED'
};

/**
 * Create a notification.
 * @param {Object} params
 * @param {string} params.userId        - Target user UUID
 * @param {string} params.title         - Notification title
 * @param {string} params.body          - Notification body text
 * @param {string} params.type          - Notification type (from NOTIFICATION_TYPES)
 * @param {string} params.priority      - LOW | NORMAL | HIGH | URGENT
 * @param {string} params.referenceType - e.g. 'ticket', 'event'
 * @param {string} params.referenceId   - UUID of referenced resource
 * @param {string} params.actionUrl     - Deep link URL
 * @param {string} params.imageUrl      - Image URL (event poster, etc.)
 * @param {Object} params.metadata      - Additional JSON metadata
 */
async function create({
  userId,
  title,
  body,
  type,
  priority = 'NORMAL',
  referenceType = null,
  referenceId = null,
  actionUrl = null,
  imageUrl = null,
  metadata = {}
}) {
  try {
    const result = await db.query(
      `INSERT INTO notifications (user_id, title, body, type, priority, reference_type, reference_id, action_url, image_url, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, title, body, type, priority, referenceType, referenceId, actionUrl, imageUrl, JSON.stringify(metadata)]
    );

    logger.info(`[NOTIFICATION] Created ${type} for user ${userId}: ${title}`);
    return result[0];
  } catch (err) {
    logger.error('[NOTIFICATION] Failed to create notification:', err.message);
    throw err;
  }
}

/**
 * Get notifications for a user.
 */
async function getByUser(userId, { limit = 50, offset = 0, unreadOnly = false } = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let paramIdx = 2;

  if (unreadOnly) {
    conditions.push('is_read = false');
  }

  params.push(limit, offset);
  const rows = await db.query(
    `SELECT * FROM notifications
     WHERE ${conditions.join(' AND ')}
     ORDER BY created_at DESC
     LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
    params
  );

  return rows;
}

/**
 * Get unread count for a user.
 */
async function getUnreadCount(userId) {
  const result = await db.query(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
    [userId]
  );
  return parseInt(result[0].count, 10);
}

/**
 * Mark notification as read.
 */
async function markAsRead(notificationId, userId) {
  await db.query(
    'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2',
    [notificationId, userId]
  );
}

/**
 * Mark all notifications as read for a user.
 */
async function markAllAsRead(userId) {
  await db.query(
    'UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false',
    [userId]
  );
}

// ============================================================
// Convenience methods for ticket lifecycle events
// ============================================================

async function notifyTicketIssued(userId, ticket, event) {
  return create({
    userId,
    title: '🎫 New Ticket Received!',
    body: `You received a ticket for "${event.name}" at ${event.venue}`,
    type: NOTIFICATION_TYPES.TICKET_ISSUED,
    priority: 'HIGH',
    referenceType: 'ticket',
    referenceId: ticket.id,
    actionUrl: `cryptovault://tickets/${ticket.id}`,
    imageUrl: event.poster_url,
    metadata: { eventId: event.id, seatInfo: ticket.seat_info }
  });
}

async function notifyTicketTransferred(fromUserId, toUserId, ticket, event) {
  // Notify sender
  await create({
    userId: fromUserId,
    title: '📤 Ticket Transferred',
    body: `Your ticket for "${event.name}" has been transferred`,
    type: NOTIFICATION_TYPES.TICKET_TRANSFERRED,
    referenceType: 'ticket',
    referenceId: ticket.id
  });

  // Notify receiver
  await create({
    userId: toUserId,
    title: '🎫 Ticket Received!',
    body: `You received a ticket for "${event.name}"`,
    type: NOTIFICATION_TYPES.TICKET_RECEIVED,
    priority: 'HIGH',
    referenceType: 'ticket',
    referenceId: ticket.id,
    actionUrl: `cryptovault://tickets/${ticket.id}`,
    imageUrl: event.poster_url
  });
}

async function notifyTicketCancelled(userId, ticket, event) {
  return create({
    userId,
    title: '❌ Ticket Cancelled',
    body: `Your ticket for "${event.name}" has been cancelled`,
    type: NOTIFICATION_TYPES.TICKET_CANCELLED,
    referenceType: 'ticket',
    referenceId: ticket.id
  });
}

async function notifyEventCancelled(userId, event) {
  return create({
    userId,
    title: '⚠️ Event Cancelled',
    body: `"${event.name}" has been cancelled. Refunds will be processed.`,
    type: NOTIFICATION_TYPES.EVENT_CANCELLED,
    priority: 'URGENT',
    referenceType: 'event',
    referenceId: event.id
  });
}

module.exports = {
  create,
  getByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  notifyTicketIssued,
  notifyTicketTransferred,
  notifyTicketCancelled,
  notifyEventCancelled,
  NOTIFICATION_TYPES
};
