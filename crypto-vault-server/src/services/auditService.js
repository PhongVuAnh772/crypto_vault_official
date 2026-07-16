const db = require('../utils/db');
const logger = require('../utils/logger');

/**
 * Audit Service
 * Logs all sensitive operations for compliance and debugging.
 */

/**
 * Log an audit event.
 * @param {Object} params
 * @param {string} params.actorType  - USER | PARTNER | STAFF | SYSTEM
 * @param {string} params.actorId    - UUID of the actor
 * @param {string} params.actorEmail - Email if available
 * @param {string} params.action     - Action performed (e.g. 'ticket.issue', 'event.create')
 * @param {string} params.resourceType - Type of resource (e.g. 'ticket', 'event')
 * @param {string} params.resourceId   - UUID of the resource
 * @param {string} params.description  - Human-readable description
 * @param {Object} params.details      - Additional JSON details
 * @param {string} params.ipAddress    - IP of the requester
 * @param {string} params.userAgent    - User-Agent header
 */
async function log({
  actorType,
  actorId = null,
  actorEmail = null,
  action,
  resourceType = null,
  resourceId = null,
  description = null,
  details = {},
  ipAddress = null,
  userAgent = null
}) {
  try {
    await db.query(
      `INSERT INTO audit_logs (actor_type, actor_id, actor_email, action, resource_type, resource_id, description, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [actorType, actorId, actorEmail, action, resourceType, resourceId, description, JSON.stringify(details), ipAddress, userAgent]
    );
  } catch (err) {
    // Audit logging should never break the main flow
    logger.error('[AUDIT] Failed to write audit log:', err.message);
  }
}

/**
 * Query audit logs with filters.
 */
async function query({
  actorType = null,
  actorId = null,
  action = null,
  resourceType = null,
  resourceId = null,
  fromDate = null,
  toDate = null,
  limit = 50,
  offset = 0
} = {}) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (actorType) {
    conditions.push(`actor_type = $${paramIndex++}`);
    params.push(actorType);
  }
  if (actorId) {
    conditions.push(`actor_id = $${paramIndex++}`);
    params.push(actorId);
  }
  if (action) {
    conditions.push(`action LIKE $${paramIndex++}`);
    params.push(`${action}%`);
  }
  if (resourceType) {
    conditions.push(`resource_type = $${paramIndex++}`);
    params.push(resourceType);
  }
  if (resourceId) {
    conditions.push(`resource_id = $${paramIndex++}`);
    params.push(resourceId);
  }
  if (fromDate) {
    conditions.push(`created_at >= $${paramIndex++}`);
    params.push(fromDate);
  }
  if (toDate) {
    conditions.push(`created_at <= $${paramIndex++}`);
    params.push(toDate);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(limit, offset);
  const rows = await db.query(
    `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    params
  );

  return rows;
}

/**
 * Helper to extract audit context from Express request.
 */
function fromRequest(req) {
  return {
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']
  };
}

module.exports = { log, query, fromRequest };
