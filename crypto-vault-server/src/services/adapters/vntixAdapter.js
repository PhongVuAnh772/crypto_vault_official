const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * VNtix Adapter
 * Connects to VNtix B2B API for tour/ticket/combo products.
 * Falls back to mock data when credentials are not configured.
 */

const VNTIX_API_URL = process.env.VNTIX_API_URL || 'https://api.vntix.vn';
const VNTIX_API_KEY = process.env.VNTIX_API_KEY || '';
const VNTIX_API_SECRET = process.env.VNTIX_API_SECRET || '';

const isMockMode = !VNTIX_API_KEY;

// ============================================================
// HTTP Client
// ============================================================

function createClient() {
  return axios.create({
    baseURL: VNTIX_API_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': VNTIX_API_KEY,
      'x-api-secret': VNTIX_API_SECRET,
    },
  });
}

// ============================================================
// Mock Data
// ============================================================

const MOCK_PRODUCTS = [
  {
    id: 'vntix-mock-001',
    name: 'Vé Bà Nà Hills - Cáp treo khứ hồi',
    description: 'Vé tham quan Bà Nà Hills bao gồm cáp treo khứ hồi, vào cổng Sun World, Cầu Vàng.',
    category: 'ATTRACTION',
    location: 'Đà Nẵng',
    price: 750000,
    currency: 'VND',
    imageUrl: 'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=800',
    availableDates: ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25'],
    maxQuantity: 50,
    options: [
      { id: 'opt-adult', name: 'Người lớn', price: 750000 },
      { id: 'opt-child', name: 'Trẻ em (1m - 1m4)', price: 550000 },
    ],
    metadata: { partner: 'Sun World', rating: 4.7, reviewCount: 12500 },
  },
  {
    id: 'vntix-mock-002',
    name: 'Vé VinWonders Nha Trang',
    description: 'Vé vào cổng công viên giải trí VinWonders Nha Trang, bao gồm tất cả trò chơi.',
    category: 'THEME_PARK',
    location: 'Nha Trang',
    price: 880000,
    currency: 'VND',
    imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800',
    availableDates: ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23'],
    maxQuantity: 100,
    options: [
      { id: 'opt-adult', name: 'Người lớn', price: 880000 },
      { id: 'opt-child', name: 'Trẻ em (1m - 1m4)', price: 680000 },
    ],
    metadata: { partner: 'Vinpearl', rating: 4.5, reviewCount: 8900 },
  },
  {
    id: 'vntix-mock-003',
    name: 'Tour Cù Lao Chàm - Lặn ngắm san hô',
    description: 'Tour 1 ngày tham quan Cù Lao Chàm, bao gồm tàu cao tốc, bữa trưa, lặn ngắm san hô.',
    category: 'TOUR',
    location: 'Hội An',
    price: 650000,
    currency: 'VND',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    availableDates: ['2026-07-21', '2026-07-23', '2026-07-25'],
    maxQuantity: 30,
    options: [
      { id: 'opt-standard', name: 'Tiêu chuẩn', price: 650000 },
      { id: 'opt-vip', name: 'VIP (tàu riêng)', price: 1200000 },
    ],
    metadata: { partner: 'Cham Island Tours', rating: 4.8, reviewCount: 3200 },
  },
  {
    id: 'vntix-mock-004',
    name: 'Vé Đại Nội Huế',
    description: 'Vé tham quan Quần thể di tích Cố đô Huế - Đại Nội.',
    category: 'ATTRACTION',
    location: 'Huế',
    price: 200000,
    currency: 'VND',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
    availableDates: ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24', '2026-07-25', '2026-07-26'],
    maxQuantity: 200,
    options: [
      { id: 'opt-adult', name: 'Người lớn', price: 200000 },
      { id: 'opt-student', name: 'Học sinh/Sinh viên', price: 40000 },
    ],
    metadata: { partner: 'Trung tâm BTDT Cố đô Huế', rating: 4.6, reviewCount: 15000 },
  },
];

// ============================================================
// API Methods
// ============================================================

/**
 * Fetch all available products from VNtix.
 */
async function fetchProducts(filters = {}) {
  if (isMockMode) {
    logger.info('[VNTIX] Mock mode — returning mock products');
    let products = [...MOCK_PRODUCTS];
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    if (filters.location) {
      products = products.filter(p =>
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    return products;
  }

  try {
    const client = createClient();
    const response = await client.get('/v1/products', { params: filters });
    return response.data.data || [];
  } catch (err) {
    logger.error('[VNTIX] fetchProducts error:', err.message);
    throw new Error(`VNtix API error: ${err.message}`);
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
    const response = await client.get(`/v1/products/${productId}`);
    return response.data.data;
  } catch (err) {
    logger.error('[VNTIX] getProduct error:', err.message);
    throw new Error(`VNtix API error: ${err.message}`);
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
    const response = await client.get(`/v1/products/${productId}/availability`, {
      params: { date },
    });
    return response.data.data;
  } catch (err) {
    logger.error('[VNTIX] checkAvailability error:', err.message);
    throw new Error(`VNtix API error: ${err.message}`);
  }
}

/**
 * Create an order (purchase ticket).
 */
async function createOrder(productId, { optionId, quantity, customerName, customerPhone, visitDate }) {
  if (isMockMode) {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const option = product.options.find(o => o.id === optionId) || product.options[0];
    const orderId = `VNTIX-MOCK-${Date.now()}`;

    return {
      orderId,
      status: 'CONFIRMED',
      productId,
      productName: product.name,
      optionName: option.name,
      quantity: quantity || 1,
      totalPrice: option.price * (quantity || 1),
      currency: product.currency,
      visitDate,
      qrCode: `https://vntix.vn/qr/${orderId}`,
      customerName,
      customerPhone,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const client = createClient();
    const response = await client.post('/v1/orders', {
      productId,
      optionId,
      quantity,
      customerName,
      customerPhone,
      visitDate,
    });
    return response.data.data;
  } catch (err) {
    logger.error('[VNTIX] createOrder error:', err.message);
    throw new Error(`VNtix API error: ${err.message}`);
  }
}

/**
 * Get order status.
 */
async function getOrderStatus(orderId) {
  if (isMockMode) {
    return {
      orderId,
      status: 'CONFIRMED',
      usedAt: null,
    };
  }

  try {
    const client = createClient();
    const response = await client.get(`/v1/orders/${orderId}`);
    return response.data.data;
  } catch (err) {
    logger.error('[VNTIX] getOrderStatus error:', err.message);
    throw new Error(`VNtix API error: ${err.message}`);
  }
}

// ============================================================
// Helpers
// ============================================================

/**
 * Normalize VNtix product to CryptoVault event format.
 */
function normalizeToEvent(product) {
  return {
    externalId: `vntix_${product.id}`,
    name: product.name,
    description: product.description,
    eventType: mapCategory(product.category),
    venue: product.location,
    city: product.location,
    country: 'Vietnam',
    startTime: product.availableDates?.[0]
      ? new Date(`${product.availableDates[0]}T08:00:00+07:00`).toISOString()
      : new Date().toISOString(),
    posterUrl: product.imageUrl,
    metadata: {
      provider: 'vntix',
      originalProductId: product.id,
      ...product.metadata,
    },
  };
}

/**
 * Normalize VNtix options to CryptoVault ticket type format.
 */
function normalizeToTicketTypes(product) {
  return (product.options || []).map(option => ({
    name: option.name,
    price: option.price,
    currency: product.currency || 'VND',
    maxSupply: product.maxQuantity,
    metadata: {
      provider: 'vntix',
      originalOptionId: option.id,
    },
  }));
}

function mapCategory(category) {
  const mapping = {
    ATTRACTION: 'ATTRACTION',
    THEME_PARK: 'THEME_PARK',
    TOUR: 'TOUR',
    COMBO: 'COMBO',
  };
  return mapping[category] || 'OTHER';
}

module.exports = {
  fetchProducts,
  getProduct,
  checkAvailability,
  createOrder,
  getOrderStatus,
  normalizeToEvent,
  normalizeToTicketTypes,
  isMockMode,
  PROVIDER_NAME: 'vntix',
};
