const logger = require('../utils/logger');
const db = require('../utils/db');
const ticketService = require('./ticketService');
const auditService = require('./auditService');

// Adapters
const vntixAdapter = require('./adapters/vntixAdapter');
const globaltixAdapter = require('./adapters/globaltixAdapter');

/**
 * External Ticket Sync Service
 * Normalizes data from VNtix / Globaltix into the internal CryptoVault schema
 * and orchestrates the purchase → issue flow.
 */

const ADAPTERS = {
  vntix: vntixAdapter,
  globaltix: globaltixAdapter,
};

// ============================================================
// Provider Registry
// ============================================================

function getProviders() {
  return [
    {
      id: 'vntix',
      name: 'VNtix',
      description: 'Nền tảng B2B đặt vé & tour du lịch Việt Nam',
      logo: 'https://vntix.vn/favicon.ico',
      region: 'Vietnam',
      mockMode: vntixAdapter.isMockMode,
      categories: ['ATTRACTION', 'THEME_PARK', 'TOUR', 'COMBO'],
    },
    {
      id: 'globaltix',
      name: 'Globaltix',
      description: 'Nền tảng vé du lịch & điểm tham quan Đông Nam Á',
      logo: 'https://www.globaltix.com/favicon.ico',
      region: 'Southeast Asia',
      mockMode: globaltixAdapter.isMockMode,
      categories: ['ATTRACTION', 'THEME_PARK', 'TOUR', 'TRANSPORT'],
    },
  ];
}

function getAdapter(provider) {
  const adapter = ADAPTERS[provider];
  if (!adapter) {
    throw new Error(`Unknown provider: ${provider}. Available: ${Object.keys(ADAPTERS).join(', ')}`);
  }
  return adapter;
}

// ============================================================
// Product Browsing
// ============================================================

/**
 * Fetch products from an external provider.
 */
async function fetchProducts(provider, filters = {}) {
  const adapter = getAdapter(provider);
  return adapter.fetchProducts(filters);
}

/**
 * Get a single product detail.
 */
async function getProduct(provider, productId) {
  const adapter = getAdapter(provider);
  return adapter.getProduct(productId);
}

/**
 * Check product availability.
 */
async function checkAvailability(provider, productId, date) {
  const adapter = getAdapter(provider);
  return adapter.checkAvailability(productId, date);
}

// ============================================================
// Purchase Flow
// ============================================================

/**
 * Purchase a ticket from an external provider and issue it as an internal
 * CryptoVault ticket (optionally as NFT).
 *
 * Flow:
 *   1. Call external provider to create order/booking
 *   2. Find or create internal Partner for this provider
 *   3. Find or create internal Event from the product
 *   4. Find or create internal Ticket Type from the option
 *   5. Issue internal ticket via ticketService.issueTicket()
 */
async function purchaseAndIssue({
  provider,
  productId,
  optionId,
  quantity = 1,
  visitDate,
  customerName,
  customerPhone,
  customerEmail,
  walletAddress,
  userId = null,
  auditContext = {},
}) {
  const adapter = getAdapter(provider);

  // 1. Get product info
  const product = await adapter.getProduct(productId);

  // 2. Create external order/booking
  let externalOrder;
  if (provider === 'vntix') {
    externalOrder = await adapter.createOrder(productId, {
      optionId,
      quantity,
      customerName,
      customerPhone,
      visitDate,
    });
  } else {
    externalOrder = await adapter.createBooking(productId, {
      optionId,
      quantity,
      customerName,
      customerEmail,
      visitDate,
    });
  }

  logger.info(`[EXT_TICKET] External order created: ${externalOrder.orderId || externalOrder.bookingId}`);

  // 3. Find or create internal partner for this provider
  const partnerId = await findOrCreatePartner(provider);

  // 4. Find or create internal event
  const eventData = adapter.normalizeToEvent(product);
  const eventId = await findOrCreateEvent(partnerId, eventData);

  // 5. Find or create ticket type
  const ticketTypes = adapter.normalizeToTicketTypes(product);
  const selectedType = ticketTypes.find(t =>
    t.metadata?.originalOptionId === optionId
  ) || ticketTypes[0];
  const ticketTypeId = await findOrCreateTicketType(eventId, selectedType);

  // 6. Issue internal ticket(s)
  const tickets = [];
  for (let i = 0; i < quantity; i++) {
    const ticket = await ticketService.issueTicket({
      partnerId,
      eventId,
      ticketTypeId,
      ownerWalletAddress: walletAddress,
      ownerUserId: userId,
      externalTicketId: `${externalOrder.orderId || externalOrder.bookingId}_${i}`,
      metadata: {
        provider,
        externalOrderId: externalOrder.orderId || externalOrder.bookingId,
        productName: product.name,
        optionName: selectedType.name,
        visitDate,
        customerName,
        voucherUrl: externalOrder.voucherUrl || externalOrder.qrCode,
      },
      auditContext,
    });
    tickets.push(ticket);
  }

  return {
    provider,
    externalOrder: {
      id: externalOrder.orderId || externalOrder.bookingId,
      status: externalOrder.status,
      totalPrice: externalOrder.totalPrice,
      currency: externalOrder.currency,
    },
    tickets,
    ticketCount: tickets.length,
  };
}

// ============================================================
// Internal DB Helpers
// ============================================================

async function findOrCreatePartner(provider) {
  const providerInfo = getProviders().find(p => p.id === provider);
  const partnerName = `${providerInfo.name} (Auto)`;

  const existing = await db.query(
    "SELECT id FROM partners WHERE name = $1",
    [partnerName]
  );

  if (existing.length > 0) return existing[0].id;

  const result = await db.query(
    `INSERT INTO partners (name, type, description, is_active, metadata)
     VALUES ($1, 'OTHER', $2, true, $3)
     RETURNING id`,
    [
      partnerName,
      providerInfo.description,
      JSON.stringify({ provider, autoCreated: true }),
    ]
  );

  logger.info(`[EXT_TICKET] Auto-created partner "${partnerName}" (${result[0].id})`);
  return result[0].id;
}

async function findOrCreateEvent(partnerId, eventData) {
  const existing = await db.query(
    'SELECT id FROM events WHERE partner_id = $1 AND external_id = $2',
    [partnerId, eventData.externalId]
  );

  if (existing.length > 0) return existing[0].id;

  const result = await db.query(
    `INSERT INTO events (partner_id, external_id, name, description, event_type, venue, city, country, start_time, poster_url, metadata, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ACTIVE')
     RETURNING id`,
    [
      partnerId,
      eventData.externalId,
      eventData.name,
      eventData.description,
      eventData.eventType,
      eventData.venue,
      eventData.city,
      eventData.country,
      eventData.startTime,
      eventData.posterUrl,
      JSON.stringify(eventData.metadata || {}),
    ]
  );

  logger.info(`[EXT_TICKET] Auto-created event "${eventData.name}" (${result[0].id})`);
  return result[0].id;
}

async function findOrCreateTicketType(eventId, typeData) {
  const existing = await db.query(
    'SELECT id FROM ticket_types WHERE event_id = $1 AND name = $2',
    [eventId, typeData.name]
  );

  if (existing.length > 0) return existing[0].id;

  const result = await db.query(
    `INSERT INTO ticket_types (event_id, name, price, currency, max_supply, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      eventId,
      typeData.name,
      typeData.price,
      typeData.currency,
      typeData.maxSupply,
      JSON.stringify(typeData.metadata || {}),
    ]
  );

  logger.info(`[EXT_TICKET] Auto-created ticket type "${typeData.name}" (${result[0].id})`);
  return result[0].id;
}

module.exports = {
  getProviders,
  fetchProducts,
  getProduct,
  checkAvailability,
  purchaseAndIssue,
};
