require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const logger = require('./utils/logger');
const BinanceWSManager = require('./services/websocketManager');
const BinanceService = require('./services/binanceService');
const tradingEngine = require('./services/tradingEngine');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

// Cấu hình CORS nhúng thẳng URL Admin (Hỗ trợ Credentials)
const allowedOrigins = [
  'https://cryptovault-admin.onrender.com',
  'https://cryptovault-admin-latest.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true
}));

app.use(express.json());

// Manual upgrade handling for WebSocket
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const symbol = url.searchParams.get('symbol')?.toUpperCase();
  const market = url.searchParams.get('market')?.toLowerCase();

  logger.debug(`[SOCKET DEBUG] Upgrade request: ${url.pathname} for ${symbol} on ${market}`);

  wss.handleUpgrade(request, socket, head, (ws) => {
    // Attach subscription info to the websocket client
    ws.subscription = { symbol, market };
    wss.emit('connection', ws, request);
  });
});

app.get('/health', (req, res) => {
  res.send('Server (Hybrid) is alive!');
});

const PORT = process.env.PORT || 3000;

// 1. Initialise Hybrid Binance Service & WS Manager
const binanceService = new BinanceService({
  spot: {
    apiKey: process.env.BINANCE_SPOT_API_KEY,
    apiSecret: process.env.BINANCE_SPOT_API_SECRET,
    useTestnet: process.env.BINANCE_SPOT_USE_TESTNET
  },
  futures: {
    apiKey: process.env.BINANCE_FUTURES_API_KEY,
    apiSecret: process.env.BINANCE_FUTURES_API_SECRET,
    useTestnet: process.env.BINANCE_FUTURES_USE_TESTNET
  }
});

const binanceWS = new BinanceWSManager({
  spot: {
    useTestnet: process.env.BINANCE_SPOT_USE_TESTNET,
    streams: ['btcusdt@ticker', 'ethusdt@ticker'] // Spot dùng ticker
  },
  futures: {
    useTestnet: process.env.BINANCE_FUTURES_USE_TESTNET,
    streams: ['btcusdt@markPrice', 'ethusdt@markPrice'] // Futures dùng markPrice
  }
});

binanceWS.connect();

// 2. Local WebSocket Logic
const lastBroadcast = new Map();
const UPDATE_LIMIT_MS = 200;

wss.on('connection', (ws) => {
  logger.info('New client connected to Global WebSocket');
  ws.subscription = null;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      // Giao thức đăng ký từ App: { type: 'subscribe', symbol: 'BTCUSDT', market: 'futures' }
      if (message.type === 'subscribe') {
        const symbol = message.symbol?.toUpperCase();
        const market = message.market?.toLowerCase();
        ws.subscription = { symbol, market };
        logger.info(`[SERVER PROTOCOL] Client subscribed to ${symbol} on ${market}`);

        // Gửi ngay giá hiện tại trong cache nếu có
        const cacheKey = `${market}:${symbol}`;
        const cached = binanceWS.priceCache.get(cacheKey);
        if (cached) {
          ws.send(JSON.stringify({ event: 'priceChange', ...cached }));
        }
      }
    } catch (err) {
      logger.error('[SERVER PROTOCOL] Error parsing client message', err);
    }
  });

  ws.on('close', () => logger.info('Client disconnected'));
});

// Throttled price broadcast
binanceWS.on('priceUpdate', (data) => {
  const { market, symbol, price } = data;
  const key = `${market}:${symbol}`;
  const now = Date.now();
  const lastTime = lastBroadcast.get(key) || 0;

  if (now - lastTime >= UPDATE_LIMIT_MS) {
    lastBroadcast.set(key, now);
    const payload = JSON.stringify({ event: 'priceChange', market, symbol, price });

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
});

// Broadcast helper for other parts of the app
const broadcast = (event, data) => {
  const payload = JSON.stringify({ event, data });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};

// Heartbeat cơ chế Ping-Pong (Chống Timeout khi rảnh rỗi trên Render Proxy)
const interval = setInterval(() => {
  wss.clients.forEach((client) => {
    if (client.isAlive === false) return client.terminate();
    client.isAlive = false;
    // Bắn khung ping mặc định của chuẩn WebSockets
    client.ping();
  });
}, 30000); // Gửi mỗi 30s

wss.on('close', () => {
  clearInterval(interval);
});

// Listen for global events to broadcast
const globalEvents = require('./utils/events');
globalEvents.on('broadcast', ({ event, data }) => {
  broadcast(event, data);
});

// Exports moved to the end of file

// Routes are loaded below

// Load dynamic routes
const dexRoutes = require('./routes/dexRoutes');
const bitcoinRoutes = require('./routes/bitcoinRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adsRoutes = require('./routes/adsRoutes');

app.use('/api/dex', dexRoutes);
app.use('/api/bitcoin', bitcoinRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1', transactionRoutes);
app.use('/api/ads', adsRoutes);

// 3. INTERNAL TRADING REST API
app.get('/api/positions', (req, res) => {
  res.json({ success: true, data: tradingEngine.getPositions() });
});

app.post('/api/positions/open', async (req, res) => {
  try {
    const { symbol, side, margin, leverage, amount } = req.body;

    // Auto-fetch latest price from memory cache
    const cacheKey = `futures:${symbol?.toUpperCase()}`;
    const latestPriceData = binanceWS.priceCache.get(cacheKey);
    const entryPrice = latestPriceData ? latestPriceData.price : 69000;

    // 1. GỬI LỆNH LÊN BINANCE TESTNET (THẬT)
    try {
      // A. Cập nhật Đòn bẩy (Leverage) lên Binance trước khi đánh lệnh
      await binanceService._request('futures', 'POST', '/leverage', {
        symbol: symbol.toUpperCase(),
        leverage: leverage
      }, true);

      // B. Đánh Lệnh
      await binanceService.placeOrder('futures', {
        symbol: symbol.toUpperCase(),
        side: side.toUpperCase() === 'LONG' ? 'BUY' : 'SELL', // Binance format
        type: 'MARKET',
        quantity: amount.toFixed(3) // Định dạng số thập phân của hợp đồng
      }, entryPrice);
    } catch (binanceError) {
      // Log lỗi rõ ràng từ Binance
      const errMsg = binanceError.response?.data?.msg || binanceError.message;
      logger.error(`[MẠNG TESTNET] Lỗi từ Binance Futures: ${errMsg}`);

      let userFacingError = `Binance Testnet Từ Chối: ${errMsg}`;
      if (errMsg.includes('Margin is insufficient')) {
        userFacingError = `Ví Testnet không đủ số dư USDT (Margin). Để sửa: 1. Giảm "Số lượng (BTC)" xuống mức thấp ví dụ 0.05. Hoặc 2. Lên web testnet nạp thêm tiền Faucet.`;
      }

      throw new Error(userFacingError);
    }

    // 2. NẾU TESTNET THÀNH CÔNG -> LƯU VÀO TRADING ENGINE LOCAL ĐỂ HIỂN THỊ UI NGAY LẬP TỨC
    const newPos = tradingEngine.openPosition('mock-user-id', symbol, side, entryPrice, leverage, margin, amount);

    // Broadcast immediately so UI updates
    const positions = tradingEngine.getPositions();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event: 'position_update', data: positions }));
      }
    });

    res.json({ success: true, data: newPos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/positions/close', async (req, res) => {
  try {
    const { id } = req.body;

    // Tìm position để lấy thông tin đóng
    const allPos = tradingEngine.getPositions();
    const posToClose = allPos.find(p => p.id === id);
    if (!posToClose) {
      return res.status(404).json({ success: false, error: 'Position not found' });
    }

    // Gửi lệnh đóng ngược chiều lên Binance
    const cacheKey = `futures:${posToClose.symbol?.toUpperCase()}`;
    const latestPriceData = binanceWS.priceCache.get(cacheKey);
    const exitPrice = latestPriceData ? latestPriceData.price : posToClose.entryPrice;

    try {
      await binanceService.placeOrder('futures', {
        symbol: posToClose.symbol.toUpperCase(),
        side: posToClose.side === 'LONG' ? 'SELL' : 'BUY', // Đánh ngược chiều để đóng
        type: 'MARKET',
        quantity: posToClose.amount.toFixed(3)
      }, exitPrice);
    } catch (binanceError) {
      logger.error(`[MẠNG TESTNET] Lỗi đóng lệnh Binance: ${binanceError.message}`);
      throw new Error(`Lỗi Đóng Lệnh Binance: ${binanceError.message}`);
    }

    // Nếu Binance đóng thành công, xóa local
    tradingEngine.closePosition(id);

    // Broadcast immediately
    const positions = tradingEngine.getPositions();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event: 'position_update', data: positions }));
      }
    });

    res.json({ success: true, data: positions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

server.listen(PORT, () => {
  logger.info(`Hybrid Server listening on port ${PORT}`);
  
  // Khởi động Background Worker theo dõi hàng đợi Blockchain Transactions (cứ mỗi 10 giây query 1 lần)
  const transactionWorker = require('./workers/transactionWorker');
  transactionWorker.start(10000);
});

module.exports = { server, app, globalEvents };
