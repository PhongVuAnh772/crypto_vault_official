const db = require('../utils/db');
const logger = require('../utils/logger');
const webhookService = require('./webhookService');
const notificationService = require('./notificationService');
const auditService = require('./auditService');
const qrService = require('./qrService');

/**
 * Ticket Service
 * Core business logic for ticket issuance, lifecycle management, and queries.
 */

/**
 * Issue a new ticket.
 * Creates the ticket record, triggers webhook, and sends notification.
 *
 * @param {Object} params
 * @param {string} params.partnerId       - Partner UUID
 * @param {string} params.eventId         - Event UUID
 * @param {string} params.ticketTypeId    - Ticket type UUID
 * @param {string} params.ownerWalletAddress - Owner's wallet address
 * @param {string} params.ownerUserId     - Owner's user UUID (optional)
 * @param {string} params.seatInfo        - Seat info string
 * @param {string} params.gate            - Gate info
 * @param {string} params.rowInfo         - Row info
 * @param {string} params.externalTicketId - Partner's own ticket ID
 * @param {string} params.metadataUri     - IPFS metadata URI
 * @param {Object} params.metadata        - Additional JSON metadata
 * @param {Object} params.auditContext    - { ipAddress, userAgent } for audit
 * @returns {Object} Created ticket record
 */
async function issueTicket({
  partnerId,
  eventId,
  ticketTypeId,
  ownerWalletAddress,
  ownerUserId = null,
  seatInfo = null,
  gate = null,
  rowInfo = null,
  externalTicketId = null,
  metadataUri = null,
  metadata = {},
  auditContext = {}
}) {
  // 1. Validate event exists and is active
  const events = await db.query(
    'SELECT * FROM events WHERE id = $1 AND partner_id = $2',
    [eventId, partnerId]
  );
  if (events.length === 0) {
    throw new Error('Event not found or does not belong to this partner');
  }
  const event = events[0];
  if (event.status !== 'ACTIVE') {
    throw new Error(`Event is ${event.status}, cannot issue tickets`);
  }

  // 2. Validate ticket type and check capacity
  const ticketTypes = await db.query(
    'SELECT * FROM ticket_types WHERE id = $1 AND event_id = $2',
    [ticketTypeId, eventId]
  );
  if (ticketTypes.length === 0) {
    throw new Error('Ticket type not found for this event');
  }
  const ticketType = ticketTypes[0];

  if (ticketType.max_supply && ticketType.issued_count >= ticketType.max_supply) {
    throw new Error(`Ticket type "${ticketType.name}" is sold out`);
  }

  // 3. Check event max capacity
  if (event.max_capacity) {
    const totalIssued = await db.query(
      `SELECT COUNT(*) as count FROM tickets WHERE event_id = $1 AND status NOT IN ('CANCELLED', 'REFUNDED')`,
      [eventId]
    );
    if (parseInt(totalIssued[0].count, 10) >= event.max_capacity) {
      throw new Error('Event has reached maximum capacity');
    }
  }

  // 4. Create ticket record
  const result = await db.query(
    `INSERT INTO tickets (ticket_type_id, event_id, partner_id, owner_wallet_address, owner_user_id,
                          seat_info, gate, row_info, external_ticket_id, metadata_uri, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [ticketTypeId, eventId, partnerId, ownerWalletAddress, ownerUserId,
     seatInfo, gate, rowInfo, externalTicketId, metadataUri, JSON.stringify(metadata)]
  );
  const ticket = result[0];

  // 5. Increment issued_count on ticket type
  await db.query(
    'UPDATE ticket_types SET issued_count = issued_count + 1, updated_at = NOW() WHERE id = $1',
    [ticketTypeId]
  );

  // 6. Audit log
  await auditService.log({
    actorType: 'PARTNER',
    actorId: partnerId,
    action: 'ticket.issue',
    resourceType: 'ticket',
    resourceId: ticket.id,
    description: `Issued ticket for event "${event.name}"`,
    details: { eventId, ticketTypeId, seatInfo, ownerWalletAddress },
    ...auditContext
  });

  // 7. Send webhook
  webhookService.deliver({
    partnerId,
    eventType: webhookService.WEBHOOK_EVENTS.TICKET_ISSUED,
    payload: {
      ticketId: ticket.id,
      externalTicketId,
      eventId,
      eventName: event.name,
      ticketType: ticketType.name,
      ownerWalletAddress,
      seatInfo,
      issuedAt: ticket.issued_at
    }
  }).catch(err => logger.error('[TICKET] Webhook delivery error:', err.message));

  // 8. Send notification (if owner user ID is known)
  if (ownerUserId) {
    notificationService.notifyTicketIssued(ownerUserId, ticket, event)
      .catch(err => logger.error('[TICKET] Notification error:', err.message));
  }

  logger.info(`[TICKET] Issued ticket ${ticket.id} for event "${event.name}" to ${ownerWalletAddress}`);
  return ticket;
}

/**
 * Batch issue tickets.
 */
async function batchIssueTickets({ partnerId, eventId, ticketTypeId, tickets: ticketList, auditContext = {} }) {
  const results = [];
  const errors = [];

  for (const ticketData of ticketList) {
    try {
      const ticket = await issueTicket({
        partnerId,
        eventId,
        ticketTypeId,
        ownerWalletAddress: ticketData.ownerWalletAddress,
        ownerUserId: ticketData.ownerUserId,
        seatInfo: ticketData.seatInfo,
        gate: ticketData.gate,
        rowInfo: ticketData.rowInfo,
        externalTicketId: ticketData.externalTicketId,
        metadata: ticketData.metadata,
        auditContext
      });
      results.push({ success: true, ticket });
    } catch (err) {
      errors.push({
        success: false,
        externalTicketId: ticketData.externalTicketId,
        error: err.message
      });
    }
  }

  return { issued: results, errors };
}

/**
 * Get ticket by ID with full details.
 */
async function getTicketById(ticketId) {
  const rows = await db.query(
    `SELECT t.*,
            e.name as event_name, e.description as event_description, e.venue, e.venue_address,
            e.city, e.country, e.start_time, e.end_time, e.poster_url, e.status as event_status,
            tt.name as ticket_type_name, tt.price, tt.currency, tt.is_transferable, tt.is_refundable,
            p.name as partner_name, p.type as partner_type, p.logo_url as partner_logo
     FROM tickets t
     JOIN events e ON e.id = t.event_id
     JOIN ticket_types tt ON tt.id = t.ticket_type_id
     JOIN partners p ON p.id = t.partner_id
     WHERE t.id = $1`,
    [ticketId]
  );
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get tickets by wallet address.
 */
async function getTicketsByWallet(walletAddress, { status = null, limit = 50, offset = 0 } = {}) {
  const conditions = ['t.owner_wallet_address = $1'];
  const params = [walletAddress];
  let paramIdx = 2;

  if (status) {
    conditions.push(`t.status = $${paramIdx++}`);
    params.push(status);
  }

  params.push(limit, offset);
  const rows = await db.query(
    `SELECT t.*,
            e.name as event_name, e.venue, e.start_time, e.end_time, e.poster_url, e.status as event_status,
            tt.name as ticket_type_name, tt.price, tt.currency,
            p.name as partner_name, p.logo_url as partner_logo
     FROM tickets t
     JOIN events e ON e.id = t.event_id
     JOIN ticket_types tt ON tt.id = t.ticket_type_id
     JOIN partners p ON p.id = t.partner_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY e.start_time ASC
     LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
    params
  );
  return rows;
}

/**
 * Get tickets by event ID.
 */
async function getTicketsByEvent(eventId, { status = null, limit = 100, offset = 0 } = {}) {
  const conditions = ['t.event_id = $1'];
  const params = [eventId];
  let paramIdx = 2;

  if (status) {
    conditions.push(`t.status = $${paramIdx++}`);
    params.push(status);
  }

  params.push(limit, offset);
  const rows = await db.query(
    `SELECT t.*,
            tt.name as ticket_type_name, tt.price, tt.currency
     FROM tickets t
     JOIN ticket_types tt ON tt.id = t.ticket_type_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY t.issued_at DESC
     LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
    params
  );
  return rows;
}

/**
 * Cancel a ticket.
 */
async function cancelTicket(ticketId, { cancelledBy, auditContext = {} }) {
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  if (ticket.status !== 'ACTIVE') throw new Error(`Cannot cancel ticket with status: ${ticket.status}`);

  await db.query(
    `UPDATE tickets SET status = 'CANCELLED', cancelled_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [ticketId]
  );

  // Decrement issued_count
  await db.query(
    'UPDATE ticket_types SET issued_count = GREATEST(issued_count - 1, 0), updated_at = NOW() WHERE id = $1',
    [ticket.ticket_type_id]
  );

  // Audit
  await auditService.log({
    actorType: cancelledBy.type || 'PARTNER',
    actorId: cancelledBy.id,
    action: 'ticket.cancel',
    resourceType: 'ticket',
    resourceId: ticketId,
    description: `Cancelled ticket for event "${ticket.event_name}"`,
    ...auditContext
  });

  // Webhook
  webhookService.deliver({
    partnerId: ticket.partner_id,
    eventType: webhookService.WEBHOOK_EVENTS.TICKET_CANCELLED,
    payload: { ticketId, eventId: ticket.event_id, ownerWalletAddress: ticket.owner_wallet_address }
  }).catch(err => logger.error('[TICKET] Cancel webhook error:', err.message));

  // Notification
  if (ticket.owner_user_id) {
    notificationService.notifyTicketCancelled(ticket.owner_user_id, ticket, ticket)
      .catch(err => logger.error('[TICKET] Cancel notification error:', err.message));
  }

  return { ...ticket, status: 'CANCELLED' };
}

/**
 * Refund a ticket.
 */
async function refundTicket(ticketId, { refundedBy, auditContext = {} }) {
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  if (ticket.status !== 'ACTIVE') throw new Error(`Cannot refund ticket with status: ${ticket.status}`);
  if (!ticket.is_refundable) throw new Error('This ticket type is non-refundable');
  if (ticket.refund_deadline && new Date(ticket.refund_deadline) < new Date()) {
    throw new Error('Refund deadline has passed');
  }

  await db.query(
    `UPDATE tickets SET status = 'REFUNDED', refunded_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [ticketId]
  );

  await db.query(
    'UPDATE ticket_types SET issued_count = GREATEST(issued_count - 1, 0), updated_at = NOW() WHERE id = $1',
    [ticket.ticket_type_id]
  );

  await auditService.log({
    actorType: refundedBy.type || 'PARTNER',
    actorId: refundedBy.id,
    action: 'ticket.refund',
    resourceType: 'ticket',
    resourceId: ticketId,
    description: `Refunded ticket for event "${ticket.event_name}"`,
    ...auditContext
  });

  webhookService.deliver({
    partnerId: ticket.partner_id,
    eventType: webhookService.WEBHOOK_EVENTS.TICKET_REFUNDED,
    payload: { ticketId, eventId: ticket.event_id, ownerWalletAddress: ticket.owner_wallet_address }
  }).catch(err => logger.error('[TICKET] Refund webhook error:', err.message));

  return { ...ticket, status: 'REFUNDED' };
}

/**
 * Transfer a ticket to a new wallet address.
 */
async function transferTicket(ticketId, { toAddress, fromUserId, toUserId = null, auditContext = {} }) {
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  if (ticket.status !== 'ACTIVE') throw new Error(`Cannot transfer ticket with status: ${ticket.status}`);
  if (!ticket.is_transferable) throw new Error('This ticket type is non-transferable');

  const fromAddress = ticket.owner_wallet_address;

  // Update ticket ownership
  await db.query(
    `UPDATE tickets
     SET owner_wallet_address = $1, owner_user_id = $2,
         original_owner_address = COALESCE(original_owner_address, $3),
         transfer_count = transfer_count + 1, updated_at = NOW()
     WHERE id = $4`,
    [toAddress, toUserId, fromAddress, ticketId]
  );

  // Record transfer
  await db.query(
    `INSERT INTO ticket_transfers (ticket_id, from_address, to_address, from_user_id, to_user_id, status)
     VALUES ($1, $2, $3, $4, $5, 'CONFIRMED')`,
    [ticketId, fromAddress, toAddress, fromUserId, toUserId]
  );

  // Audit
  await auditService.log({
    actorType: 'USER',
    actorId: fromUserId,
    action: 'ticket.transfer',
    resourceType: 'ticket',
    resourceId: ticketId,
    description: `Transferred ticket from ${fromAddress} to ${toAddress}`,
    details: { fromAddress, toAddress },
    ...auditContext
  });

  // Webhook
  webhookService.deliver({
    partnerId: ticket.partner_id,
    eventType: webhookService.WEBHOOK_EVENTS.TICKET_TRANSFERRED,
    payload: { ticketId, fromAddress, toAddress, eventId: ticket.event_id }
  }).catch(err => logger.error('[TICKET] Transfer webhook error:', err.message));

  // Notifications
  if (fromUserId || toUserId) {
    notificationService.notifyTicketTransferred(fromUserId, toUserId, ticket, ticket)
      .catch(err => logger.error('[TICKET] Transfer notification error:', err.message));
  }

  return { ...ticket, owner_wallet_address: toAddress, transfer_count: ticket.transfer_count + 1 };
}

/**
 * Mark ticket as used (check-in).
 */
async function checkInTicket(ticketId, { staffId, partnerId, eventId, scanMethod = 'QR', deviceInfo = {}, location = {} }) {
  const ticket = await getTicketById(ticketId);
  if (!ticket) throw new Error('Ticket not found');
  if (ticket.status === 'USED') throw new Error('Ticket has already been used');
  if (ticket.status !== 'ACTIVE') throw new Error(`Cannot check in ticket with status: ${ticket.status}`);

  // Update ticket status
  await db.query(
    `UPDATE tickets SET status = 'USED', used_at = NOW(), used_by_staff_id = $1, updated_at = NOW() WHERE id = $2`,
    [staffId, ticketId]
  );

  // Update event attendance
  await db.query(
    'UPDATE events SET current_attendance = current_attendance + 1 WHERE id = $1',
    [ticket.event_id]
  );

  // Record scan history
  await db.query(
    `INSERT INTO scan_history (ticket_id, event_id, staff_id, partner_id, scan_result, scan_method, is_check_in, device_info, location)
     VALUES ($1, $2, $3, $4, 'VALID', $5, true, $6, $7)`,
    [ticketId, ticket.event_id, staffId, ticket.partner_id, scanMethod, JSON.stringify(deviceInfo), JSON.stringify(location)]
  );

  // Audit
  await auditService.log({
    actorType: 'STAFF',
    actorId: staffId,
    action: 'ticket.checkin',
    resourceType: 'ticket',
    resourceId: ticketId,
    description: `Checked in ticket at ${ticket.event_name}`
  });

  // Webhook
  webhookService.deliver({
    partnerId: ticket.partner_id,
    eventType: webhookService.WEBHOOK_EVENTS.TICKET_USED,
    payload: { ticketId, eventId: ticket.event_id, usedAt: new Date().toISOString(), staffId }
  }).catch(err => logger.error('[TICKET] Check-in webhook error:', err.message));

  return { ...ticket, status: 'USED' };
}

/**
 * Get event dashboard stats.
 */
async function getEventDashboard(eventId) {
  const [eventRows, statsRows, typeRows] = await Promise.all([
    db.query('SELECT * FROM events WHERE id = $1', [eventId]),
    db.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_count,
         COUNT(*) FILTER (WHERE status = 'USED') as used_count,
         COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_count,
         COUNT(*) FILTER (WHERE status = 'REFUNDED') as refunded_count,
         COUNT(*) FILTER (WHERE status = 'TRANSFERRED') as transferred_count,
         COUNT(*) as total_count
       FROM tickets WHERE event_id = $1`,
      [eventId]
    ),
    db.query(
      `SELECT tt.name, tt.max_supply, tt.issued_count, tt.price, tt.currency
       FROM ticket_types tt WHERE tt.event_id = $1`,
      [eventId]
    )
  ]);

  if (eventRows.length === 0) return null;

  return {
    event: eventRows[0],
    stats: statsRows[0],
    ticketTypes: typeRows
  };
}

module.exports = {
  issueTicket,
  batchIssueTickets,
  getTicketById,
  getTicketsByWallet,
  getTicketsByEvent,
  cancelTicket,
  refundTicket,
  transferTicket,
  checkInTicket,
  getEventDashboard
};
