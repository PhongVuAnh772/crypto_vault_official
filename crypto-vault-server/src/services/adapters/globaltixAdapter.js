const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Globaltix Adapter
 * Connects to Globaltix B2B REST API for travel/attraction ticket products.
 * Falls back to mock data when credentials are not configured.
 */

const GLOBALTIX_API_URL = process.env.GLOBALTIX_API_URL || 'https://api.globaltix.com/api/v2';
const GLOBALTIX_API_KEY = process.env.GLOBALTIX_API_KEY || '';
const GLOBALTIX_API_SECRET = process.env.GLOBALTIX_API_SECRET || '';

const isMockMode = !GLOBALTIX_API_KEY;

// ============================================================
// HTTP Client
// ============================================================

function createClient() {
  return axios.create({
    baseURL: GLOBALTIX_API_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GLOBALTIX_API_KEY}`,
      'x-api-secret': GLOBALTIX_API_SECRET,
    },
  });
}

// ============================================================
// Mock Data
// ============================================================

const MOCK_PRODUCTS = [
  {
    id: 'gtx-mock-001',
    name: 'Singapore Universal Studios - 1 Day Pass',
    description: 'Full-day admission to Universal Studios Singapore with access to all rides and shows.',
    category: 'THEME_PARK',
    location: 'Singapore',
    country: 'Singapore',
    price: 82,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1613861615601-a]e0ccb0e8e20?w=800',
    availableDates: ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25', '2026-07-26'],
    maxQuantity: 200,
    options: [
      { id: 'opt-adult', name: 'Adult (13+)', price: 82 },
      { id: 'opt-child', name: 'Child (4-12)', price: 62 },
      { id: 'opt-senior', name: 'Senior (60+)', price: 42 },
    ],
    metadata: { partner: 'Resorts World Sentosa', rating: 4.6, reviewCount: 45000 },
  },
  {
    id: 'gtx-mock-002',
    name: 'Bangkok Safari World — Trọn gói',
    description: 'Vé trọn gói Safari World + Marine Park tại Bangkok, bao gồm show biểu diễn.',
    category: 'ATTRACTION',
    location: 'Bangkok',
    country: 'Thailand',
    price: 35,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1456926631375-92c8ce872def?w=800',
    availableDates: ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24'],
    maxQuantity: 150,
    options: [
      { id: 'opt-adult', name: 'Adult', price: 35 },
      { id: 'opt-child', name: 'Child (100cm-140cm)', price: 28 },
    ],
    metadata: { partner: 'Safari World Bangkok', rating: 4.3, reviewCount: 22000 },
  },
  {
    id: 'gtx-mock-003',
    name: 'Vé Tham Quan Landmark 81 SkyView',
    description: 'Vé lên đài quan sát tầng 79-81 tòa nhà Landmark 81, TP.HCM.',
    category: 'ATTRACTION',
    location: 'TP. Hồ Chí Minh',
    country: 'Vietnam',
    price: 350000,
    currency: 'VND',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800',
    availableDates: ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25'],
    maxQuantity: 100,
    options: [
      { id: 'opt-standard', name: 'Standard', price: 350000 },
      { id: 'opt-premium', name: 'Premium (kèm đồ uống)', price: 500000 },
    ],
    metadata: { partner: 'Vingroup', rating: 4.4, reviewCount: 6800 },
  },
  {
    id: 'gtx-mock-004',
    name: 'Kuala Lumpur Petronas Twin Towers — Observation Deck',
    description: 'Skip-the-line ticket to Petronas Twin Towers Skybridge + Observation Deck.',
    category: 'ATTRACTION',
    location: 'Kuala Lumpur',
    country: 'Malaysia',
    price: 25,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800',
    availableDates: ['2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25'],
    maxQuantity: 80,
    options: [
      { id: 'opt-adult', name: 'Adult', price: 25 },
      { id: 'opt-child', name: 'Child (3-12)', price: 15 },
    ],
    metadata: { partner: 'KLCC', rating: 4.5, reviewCount: 38000 },
  },
  {
    id: 'gtx-mock-005',
    name: 'Đà Lạt - Vé Thung Lũng Tình Yêu',
    description: 'Vé vào cổng khu du lịch Thung Lũng Tình Yêu, Đà Lạt.',
    category: 'ATTRACTION',
    location: 'Đà Lạt',
    country: 'Vietnam',
    price: 250000,
    currency: 'VND',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
    availableDates: ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25', '2026-07-26'],
    maxQuantity: 300,
    options: [
      { id: 'opt-adult', name: 'Người lớn', price: 250000 },
      { id: 'opt-child', name: 'Trẻ em (1m-1m3)', price: 125000 },
    ],
    metadata: { partner: 'KDL Thung Lũng Tình Yêu', rating: 4.2, reviewCount: 9500 },
  },
];

// ============================================================
// API Methods
// ============================================================

/**
 * Fetch available products, optionally filtered.
 */
async function fetchProducts(filters = {}) {
  if (isMockMode) {
    logger.info('[GLOBALTIX] Mock mode — returning mock products');
    let products = [...MOCK_PRODUCTS];
    if (filters.country) {
      products = products.filter(p =>
        p.country.toLowerCase().includes(filters.country.toLowerCase())
      );
    }
    if (filters.location) {
      products = products.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    return products;
  }

  try {
    const client = createClient();
    // Globaltix flow: countries → cities → products
    const response = await client.get('/products', { params: filters });
    return response.data.data || [];
  } catch (err) {
    logger.error('[GLOBALTIX] fetchProducts error:', err.message);
    throw new Error(`Globaltix API error: ${err.message}`);
  }
}

/**
 * Get product detail by ID.
 */
async function getProduct(productId) {
  if (isMockMode) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');
    return product;
  }

  try {
    const client = createClient();
    const response = await client.get(`/products/${productId}`);
    return response.data.data;
  } catch (err) {
    logger.error('[GLOBALTIX] getProduct error:', err.message);
    throw new Error(`Globaltix API error: ${err.message}`);
  }
}

/**
 * Check availability for a product on a specific date.
 */
async function checkAvailability(productId, date) {
  if (isMockMode) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const available = product.availableDates.includes(date);
    return {
      available,
      productId,
      date,
      remainingSlots: available ? Math.floor(Math.random() * product.maxQuantity) + 1 : 0,
      options: available ? product.options : [],
    };
  }

  try {
    const client = createClient();
    const response = await client.get(`/products/${productId}/availability`, {
      params: { date },
    });
    return response.data.data;
  } catch (err) {
    logger.error('[GLOBALTIX] checkAvailability error:', err.message);
    throw new Error(`Globaltix API error: ${err.message}`);
  }
}

/**
 * Create a booking (purchase ticket).
 */
async function createBooking(productId, { optionId, quantity, customerName, customerEmail, visitDate }) {
  if (isMockMode) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const option = product.options.find(o => o.id === optionId) || product.options[0];
    const bookingId = `GTX-MOCK-${Date.now()}`;

    return {
      bookingId,
      status: 'CONFIRMED',
      productId,
      productName: product.name,
      optionName: option.name,
      quantity: quantity || 1,
      totalPrice: option.price * (quantity || 1),
      currency: product.currency,
      visitDate,
      voucherUrl: `https://globaltix.com/voucher/${bookingId}`,
      customerName,
      customerEmail,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const client = createClient();
    const response = await client.post('/bookings', {
      productId,
      optionId,
      quantity,
      customerName,
      customerEmail,
      visitDate,
    });
    return response.data.data;
  } catch (err) {
    logger.error('[GLOBALTIX] createBooking error:', err.message);
    throw new Error(`Globaltix API error: ${err.message}`);
  }
}

/**
 * Get booking status.
 */
async function getBookingStatus(bookingId) {
  if (isMockMode) {
    return {
      bookingId,
      status: 'CONFIRMED',
      redeemedAt: null,
    };
  }

  try {
    const client = createClient();
    const response = await client.get(`/bookings/${bookingId}`);
    return response.data.data;
  } catch (err) {
    logger.error('[GLOBALTIX] getBookingStatus error:', err.message);
    throw new Error(`Globaltix API error: ${err.message}`);
  }
}

// ============================================================
// Helpers
// ============================================================

/**
 * Normalize Globaltix product to CryptoVault event format.
 */
function normalizeToEvent(product) {
  return {
    externalId: `globaltix_${product.id}`,
    name: product.name,
    description: product.description,
    eventType: mapCategory(product.category),
    venue: product.location,
    city: product.location,
    country: product.country || 'Vietnam',
    startTime: product.availableDates?.[0]
      ? new Date(`${product.availableDates[0]}T08:00:00+07:00`).toISOString()
      : new Date().toISOString(),
    posterUrl: product.imageUrl,
    metadata: {
      provider: 'globaltix',
      originalProductId: product.id,
      ...product.metadata,
    },
  };
}

/**
 * Normalize Globaltix options to CryptoVault ticket type format.
 */
function normalizeToTicketTypes(product) {
  return (product.options || []).map(option => ({
    name: option.name,
    price: option.price,
    currency: product.currency || 'USD',
    maxSupply: product.maxQuantity,
    metadata: {
      provider: 'globaltix',
      originalOptionId: option.id,
    },
  }));
}

function mapCategory(category) {
  const mapping = {
    THEME_PARK: 'THEME_PARK',
    ATTRACTION: 'ATTRACTION',
    TOUR: 'TOUR',
    TRANSPORT: 'TRANSPORT',
  };
  return mapping[category] || 'OTHER';
}

module.exports = {
  fetchProducts,
  getProduct,
  checkAvailability,
  createBooking,
  getBookingStatus,
  normalizeToEvent,
  normalizeToTicketTypes,
  isMockMode,
  PROVIDER_NAME: 'globaltix',
};
