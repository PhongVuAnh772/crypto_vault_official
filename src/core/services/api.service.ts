import axios from 'axios';
import { CONFIG } from '../constants/config';

// The base URL of the Node.js backend
const BASE_URL = CONFIG.API_BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

export type MarketType = 'spot' | 'futures';

export const tradeService = {
  getLatestPrice: async (symbol: string = 'BTCUSDT', market: MarketType = 'futures') => {
    const response = await api.get(`/price?symbol=${symbol}&market=${market}`);
    return response.data;
  },

  placeOrder: async (orderData: {
    market?: MarketType;
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    price?: number;
    slippageThreshold?: number;
  }) => {
    // Default to futures if not specified
    const payload = { market: 'futures', ...orderData };
    const response = await api.post('/order', payload);
    return response.data;
  },
};
