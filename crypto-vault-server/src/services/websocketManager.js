const WebSocket = require('ws');
const logger = require('../utils/logger');
const EventEmitter = require('events');

class BinanceWSManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.spotConfig = options.spot || {};
    this.futuresConfig = options.futures || {};

    this.spotStreams = this.spotConfig.streams || ['btcusdt@ticker', 'ethusdt@ticker'];
    this.futuresStreams = this.futuresConfig.streams || ['btcusdt@markPrice', 'ethusdt@markPrice'];

    this.priceCache = new Map();

    this.spotWs = null;
    this.futuresWs = null;
    this.isClosing = false;
  }

  connect() {
    this.connectMarket('spot');
    this.connectMarket('futures');
  }

  getWsBaseUrl(market) {
    const isSpot = market === 'spot';
    const useTestnet = isSpot ? this.spotConfig.useTestnet : this.futuresConfig.useTestnet;

    if (isSpot) {
      return useTestnet === 'true' ? 'wss://stream.testnet.binance.vision/ws' : 'wss://stream.binance.com:9443/ws';
    } else {
      return useTestnet === 'true' ? 'wss://fstream.binancefuture.com/ws' : 'wss://fstream.binance.com/ws';
    }
  }

  connectMarket(market) {
    const isFutures = market === 'futures';
    const baseUrl = this.getWsBaseUrl(market);

    logger.info(`Connecting to Binance ${market.toUpperCase()} WS: ${baseUrl}`);
    const ws = new WebSocket(baseUrl);

    ws.on('open', () => {
      logger.info(`Binance ${market.toUpperCase()} WS Connected`);

      // Chọn đúng danh sách streams cho thị trường này
      const targetStreams = isFutures ? this.futuresStreams : this.spotStreams;

      const subscribeMsg = {
        method: 'SUBSCRIBE',
        params: targetStreams.map(s => s.toLowerCase()),
        id: isFutures ? 100 : 200
      };

      logger.debug(`[WS SEND] ${market.toUpperCase()} Subscribe: ${JSON.stringify(subscribeMsg)}`);
      ws.send(JSON.stringify(subscribeMsg));
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        // Ignore subscription results or pings
        if (message.result === null || message.id) return;
        this.handleMessage(market, message);
      } catch (err) {
        logger.error(`Error parsing ${market} WS message`, err);
      }
    });

    ws.on('error', (error) => {
      logger.error(`${market} WebSocket Error: ${JSON.stringify(error)}`);
      if (error && error.message) {
        logger.error(`Error message: ${error.message}`);
      }
    });

    ws.on('close', () => {
      logger.warn(`${market} WebSocket Closed. Reconnecting in 5s...`);
      if (!this.isClosing) {
        setTimeout(() => this.connectMarket(market), 5000);
      }
    });

    if (!isFutures) this.spotWs = ws;
    else this.futuresWs = ws;
  }

  handleMessage(market, message) {
    const isFutures = market === 'futures';
    let symbol, price, time;

    // Log dữ liệu thô để debug (ẩn bớt nếu quá nhiều)
    // logger.debug(`[BINANCE RAW ${market.toUpperCase()}] ${JSON.stringify(message)}`);

    // Use common data payload for combined streams: { stream, data }
    const data = message.data || message;

    if (!isFutures) {
      // Spot ticker/miniTicker format: { s: 'BTCUSDT', c: '68000.00' }
      if (data.s && data.c) {
        symbol = data.s;
        price = data.c;
        time = data.E || Date.now();
      }
    } else {
      // Futures stream format: { s: 'BTCUSDT', p: '68000.00' }
      if (data && data.s && data.p) {
        symbol = data.s;
        price = data.p;
        time = data.E || Date.now();
      }
    }

    if (symbol && price) {
      logger.info(`[BINANCE PARSED ${market.toUpperCase()}] ${symbol} -> ${price}`);
      const cacheKey = `${market}:${symbol}`;
      this.priceCache.set(cacheKey, { market, symbol, price, time });
      this.emit('priceUpdate', { market, symbol, price, time });
    }
  }

  close() {
    this.isClosing = true;
    if (this.spotWs) this.spotWs.terminate();
    if (this.futuresWs) this.futuresWs.terminate();
  }
}

module.exports = BinanceWSManager;
