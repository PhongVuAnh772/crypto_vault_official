const crypto = require('crypto');
const db = require('../utils/db');
const logger = require('../utils/logger');

/**
 * QR Service
 * Handles dynamic QR code generation and verification for tickets.
 *
 * QR Payload Structure:
 * {
 *   v: 1,                  // Version
 *   tid: "ticket-uuid",    // Ticket ID
 *   eid: "event-uuid",     // Event ID
 *   owa: "0x1234...abcd",  // Owner wallet address
 *   n: "random-nonce",     // Single-use nonce (32 chars)
 *   ts: 1721068800000,     // Timestamp (ms)
 *   sig: "hex-signature"   // ECDSA signature
 * }
 *
 * Security:
 * - Nonce rotates every 30 seconds
 * - Nonce is single-use (verified once, then invalidated)
 * - Timestamp must be within ±60s of server time
 * - Signature prevents payload tampering
 */

const QR_NONCE_TTL_MS = 30 * 1000;       // 30 seconds
const TIMESTAMP_TOLERANCE_MS = 60 * 1000; // 60 seconds
const SERVER_SIGNING_KEY = process.env.QR_SIGNING_KEY || crypto.randomBytes(32).toString('hex');

// In-memory used nonce set (for production, use Redis SET with TTL)
const usedNonces = new Map();

// Cleanup expired nonces every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiresAt] of usedNonces) {
    if (now > expiresAt) {
      usedNonces.delete(nonce);
    }
  }
}, 120000);

/**
 * Generate a new nonce for a ticket's QR code.
 * @param {string} ticketId - Ticket UUID
 * @returns {Object} { nonce, expiresAt }
 */
async function generateNonce(ticketId) {
  const nonce = crypto.randomBytes(16).toString('hex'); // 32 chars
  const expiresAt = new Date(Date.now() + QR_NONCE_TTL_MS);

  await db.query(
    `UPDATE tickets SET qr_nonce = $1, qr_nonce_expires_at = $2, updated_at = NOW() WHERE id = $3`,
    [nonce, expiresAt, ticketId]
  );

  return { nonce, expiresAt };
}

/**
 * Generate a signed QR payload for a ticket.
 * @param {string} ticketId - Ticket UUID
 * @returns {Object} QR payload object ready for JSON encoding + QR rendering
 */
async function generateQRPayload(ticketId) {
  // Fetch ticket data
  const tickets = await db.query(
    `SELECT t.id, t.event_id, t.owner_wallet_address, t.status
     FROM tickets t WHERE t.id = $1`,
    [ticketId]
  );

  if (tickets.length === 0) {
    throw new Error('Ticket not found');
  }

  const ticket = tickets[0];
  if (ticket.status !== 'ACTIVE') {
    throw new Error(`Ticket is not active (status: ${ticket.status})`);
  }

  // Generate fresh nonce
  const { nonce, expiresAt } = await generateNonce(ticketId);
  const timestamp = Date.now();

  // Build payload (without signature)
  const payload = {
    v: 1,
    tid: ticket.id,
    eid: ticket.event_id,
    owa: ticket.owner_wallet_address,
    n: nonce,
    ts: timestamp
  };

  // Sign the payload
  const signatureData = `${payload.v}:${payload.tid}:${payload.eid}:${payload.owa}:${payload.n}:${payload.ts}`;
  const sig = crypto
    .createHmac('sha256', SERVER_SIGNING_KEY)
    .update(signatureData)
    .digest('hex');

  payload.sig = sig;

  return {
    payload,
    expiresAt,
    qrString: JSON.stringify(payload) // Ready to encode as QR
  };
}

/**
 * Verify a QR payload.
 * Checks: signature, timestamp freshness, nonce validity, ticket status.
 * 
 * @param {Object} payload - Parsed QR payload
 * @returns {Object} { valid, ticket, error }
 */
async function verifyQRPayload(payload) {
  try {
    // 1. Version check
    if (payload.v !== 1) {
      return { valid: false, error: 'Unsupported QR version' };
    }

    // 2. Required fields
    if (!payload.tid || !payload.eid || !payload.owa || !payload.n || !payload.ts || !payload.sig) {
      return { valid: false, error: 'Incomplete QR payload' };
    }

    // 3. Verify signature
    const signatureData = `${payload.v}:${payload.tid}:${payload.eid}:${payload.owa}:${payload.n}:${payload.ts}`;
    const expectedSig = crypto
      .createHmac('sha256', SERVER_SIGNING_KEY)
      .update(signatureData)
      .digest('hex');

    try {
      const isValidSig = crypto.timingSafeEqual(
        Buffer.from(expectedSig, 'hex'),
        Buffer.from(payload.sig, 'hex')
      );
      if (!isValidSig) {
        return { valid: false, error: 'Invalid signature' };
      }
    } catch {
      return { valid: false, error: 'Invalid signature format' };
    }

    // 4. Timestamp freshness
    const now = Date.now();
    if (Math.abs(now - payload.ts) > TIMESTAMP_TOLERANCE_MS) {
      return { valid: false, error: 'QR code has expired (timestamp too old)' };
    }

    // 5. Check nonce is not already used (replay prevention)
    if (usedNonces.has(payload.n)) {
      return { valid: false, error: 'QR code has already been scanned (replay detected)' };
    }

    // 6. Verify nonce matches DB
    const tickets = await db.query(
      `SELECT t.*, e.name as event_name, e.venue, e.start_time, e.status as event_status,
              tt.name as ticket_type_name
       FROM tickets t
       JOIN events e ON e.id = t.event_id
       JOIN ticket_types tt ON tt.id = t.ticket_type_id
       WHERE t.id = $1`,
      [payload.tid]
    );

    if (tickets.length === 0) {
      return { valid: false, error: 'Ticket not found' };
    }

    const ticket = tickets[0];

    // 7. Verify nonce matches
    if (ticket.qr_nonce !== payload.n) {
      return { valid: false, error: 'QR code nonce is outdated (was refreshed)' };
    }

    // 8. Check nonce expiration
    if (ticket.qr_nonce_expires_at && new Date(ticket.qr_nonce_expires_at) < new Date()) {
      return { valid: false, error: 'QR code nonce has expired' };
    }

    // 9. Check ticket status
    if (ticket.status !== 'ACTIVE') {
      return {
        valid: false,
        error: `Ticket is ${ticket.status.toLowerCase()}`,
        ticket
      };
    }

    // 10. Check event status
    if (ticket.event_status === 'CANCELLED') {
      return { valid: false, error: 'Event has been cancelled', ticket };
    }

    // 11. Verify ownership
    if (ticket.owner_wallet_address !== payload.owa) {
      return { valid: false, error: 'Wallet address does not match ticket owner', ticket };
    }

    // 12. Mark nonce as used
    usedNonces.set(payload.n, Date.now() + 120000); // Keep for 2 minutes

    return { valid: true, ticket };

  } catch (err) {
    logger.error('[QR_SERVICE] Verification error:', err);
    return { valid: false, error: 'Internal verification error' };
  }
}

/**
 * Generate an offline verification token.
 * This is a pre-signed token that can be verified without network access.
 * Contains ticket data hash + server signature.
 */
async function generateOfflineToken(ticketId) {
  const tickets = await db.query(
    `SELECT t.id, t.event_id, t.owner_wallet_address, t.status, t.seat_info,
            e.name as event_name, e.start_time
     FROM tickets t
     JOIN events e ON e.id = t.event_id
     WHERE t.id = $1 AND t.status = 'ACTIVE'`,
    [ticketId]
  );

  if (tickets.length === 0) {
    throw new Error('Active ticket not found');
  }

  const ticket = tickets[0];
  const issuedAt = Date.now();
  const expiresAt = issuedAt + (24 * 60 * 60 * 1000); // 24 hours

  const tokenData = {
    tid: ticket.id,
    eid: ticket.event_id,
    owa: ticket.owner_wallet_address,
    seat: ticket.seat_info,
    event: ticket.event_name,
    start: ticket.start_time,
    iat: issuedAt,
    exp: expiresAt
  };

  const dataStr = JSON.stringify(tokenData);
  const sig = crypto
    .createHmac('sha256', SERVER_SIGNING_KEY)
    .update(dataStr)
    .digest('hex');

  return {
    data: tokenData,
    sig,
    token: Buffer.from(JSON.stringify({ d: tokenData, s: sig })).toString('base64')
  };
}

/**
 * Verify an offline token (can be done without DB access).
 */
function verifyOfflineToken(tokenBase64) {
  try {
    const decoded = JSON.parse(Buffer.from(tokenBase64, 'base64').toString('utf-8'));
    const { d: data, s: sig } = decoded;

    // Verify signature
    const dataStr = JSON.stringify(data);
    const expectedSig = crypto
      .createHmac('sha256', SERVER_SIGNING_KEY)
      .update(dataStr)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSig, 'hex'),
      Buffer.from(sig, 'hex')
    );

    if (!isValid) {
      return { valid: false, error: 'Invalid offline token signature' };
    }

    // Check expiration
    if (Date.now() > data.exp) {
      return { valid: false, error: 'Offline token has expired' };
    }

    return { valid: true, ticket: data };
  } catch (err) {
    return { valid: false, error: 'Invalid offline token format' };
  }
}

module.exports = {
  generateNonce,
  generateQRPayload,
  verifyQRPayload,
  generateOfflineToken,
  verifyOfflineToken,
  QR_NONCE_TTL_MS,
  TIMESTAMP_TOLERANCE_MS
};
