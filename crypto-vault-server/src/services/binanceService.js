const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');
const orderQueue = require('./orderQueue');
const Decimal = require('decimal.js');

class BinanceService {
  constructor(options = {}) {
    this.spotConfig = options.spot || {};
    this.futuresConfig = options.futures || {};

    // Setup Spot Client
    const isSpotTestnet = this.spotConfig.useTestnet === 'true';
    this.spotBaseUrl = isSpotTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com';
    this.spotClient = axios.create({
      baseURL: this.spotBaseUrl,
      headers: {
        'X-MBX-APIKEY': this.spotConfig.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Setup Futures Client
    const isFuturesTestnet = this.futuresConfig.useTestnet === 'true';
    this.futuresBaseUrl = isFuturesTestnet ? 'https://testnet.binancefuture.com' : 'https://fapi.binance.com';
    this.futuresClient = axios.create({
      baseURL: this.futuresBaseUrl,
      headers: {
        'X-MBX-APIKEY': this.futuresConfig.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  generateSignature(queryString, apiSecret) {
    return crypto
      .createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');
  }

  async _request(market, method, endpoint, params = {}, isPrivate = false) {
    const isSpot = market === 'spot';
    const config = isSpot ? this.spotConfig : this.futuresConfig;
    const client = isSpot ? this.spotClient : this.futuresClient;
    const pathPrefix = isSpot ? '/api/v3' : '/fapi/v1';

    const timestamp = Date.now();
    const queryParams = new URLSearchParams({ ...params, timestamp });
    
    let url = `${pathPrefix}${endpoint}`;
    let data = null;

    if (isPrivate) {
      const signature = this.generateSignature(queryParams.toString(), config.apiSecret);
      queryParams.append('signature', signature);
    }

    const queryString = queryParams.toString();

    try {
      if (method === 'GET') {
        url += `?${queryString}`;
      } else {
        data = queryString;
      }

      logger.debug(`Binance (${market.toUpperCase()}) Request: ${method} ${url}`);
      const response = await client({ method, url, data });
      return response.data;
    } catch (err) {
      const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
      logger.error(`Binance (${market.toUpperCase()}) API Error (${endpoint}): ${errorMsg}`);
      throw err;
    }
  }

  /**
   * Place an order with market selection (spot/futures).
   */
  async placeOrder(market, params, latestPrice) {
    const { symbol, side, type, quantity, price, slippageThreshold = 0.01 } = params;

    // Slippage check
    if (type === 'MARKET' && latestPrice) {
      const currentPrice = new Decimal(latestPrice);
      const orderPrice = new Decimal(price || currentPrice);
      const diff = currentPrice.minus(orderPrice).abs().div(orderPrice);
      
      if (diff.greaterThan(slippageThreshold)) {
        const errorMsg = `Slippage too high (${diff.times(100).toFixed(2)}% > ${slippageThreshold * 100}% threshold). Order rejected.`;
        logger.warn(errorMsg);
        throw new Error(errorMsg);
      }
    }

    const result = await orderQueue.add(async () => {
      const apiParams = {
        symbol: symbol.toUpperCase(),
        side: side.toUpperCase(),
        type: type.toUpperCase(),
        quantity,
        recvWindow: 5000,
      };

      if (type === 'LIMIT') {
        apiParams.price = price;
        apiParams.timeInForce = 'GTC';
      }

      return this._request(market, 'POST', '/order', apiParams, true);
    });

    logger.info(`Binance (${market.toUpperCase()}) order: ${result.orderId} for ${symbol}`);
    return result;
  }

  async createListenKey(market) {
    const result = await this._request(market, 'POST', '/listenKey', {}, true);
    return result.listenKey;
  }

  async keepAliveListenKey(market, listenKey) {
    const endpoint = market === 'spot' ? `/userDataStream?listenKey=${listenKey}` : `/listenKey?listenKey=${listenKey}`;
    return this._request(market, 'PUT', endpoint, {}, true);
  }
}

module.exports = BinanceService;
