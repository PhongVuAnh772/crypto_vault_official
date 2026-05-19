require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { JWT_SECRET } = require('./middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const logger = require('./utils/logger');

const verifySocketToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const getUserFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  return verifySocketToken(token);
};
const BinanceWSManager = require('./services/websocketManager');
const BinanceService = require('./services/binanceService');
const tradingEngine = require('./services/tradingEngine');
const cors = require('cors');
const socialFeedSeeder = require('./services/socialFeedSeeder');

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
        if (message.token) {
          const userData = verifySocketToken(message.token);
          if (userData) ws.userId = userData.id;
        }
        logger.info(`[SERVER PROTOCOL] Client subscribed to ${symbol} on ${market}`);

        // Gửi ngay giá hiện tại trong cache nếu có
        const cacheKey = `${market}:${symbol}`;
        const cached = binanceWS.priceCache.get(cacheKey);
        if (cached) {
          ws.send(JSON.stringify({ event: 'priceChange', ...cached }));
        }
      } else if (message.type === 'join_live' || message.type === 'leave_live' || message.type === 'live_chat' || message.type === 'send_reaction') {
        const roomId = message.roomId || 'global';
        
        // Helper to broadcast viewer count
        const broadcastViewerCount = (rid) => {
          let count = 0;
          wss.clients.forEach(client => {
            if (client.roomId === rid && client.readyState === WebSocket.OPEN) {
              count++;
            }
          });
          const countUpdate = JSON.stringify({ type: 'viewer_count', roomId: rid, count });
          wss.clients.forEach(client => {
            if (client.roomId === rid && client.readyState === WebSocket.OPEN) {
              client.send(countUpdate);
            }
          });
        };

        if (message.type === 'join_live') {
          // [SECURITY] Verify Token before joining
          const userData = verifySocketToken(message.token);
          if (!userData) {
            ws.send(JSON.stringify({ type: 'error', message: 'Authentication required to join live' }));
            return;
          }

          // [BACKEND ARCHITECT] Room Validation
          const db = require('./utils/db');
          db.query('SELECT status FROM posts WHERE id = $1', [roomId]).then(res => {
            if (res.length > 0 && res[0].status === 'live') {
              ws.roomId = roomId;
              ws.userId = userData.id; // Store user ID in session
              logger.info(`[LIVE] User ${userData.id} joined room: ${roomId}`);
              broadcastViewerCount(roomId);
            } else {
              ws.send(JSON.stringify({ type: 'error', message: 'Room is not live' }));
            }
          });
        } else if (message.type === 'leave_live') {
          const oldRoomId = ws.roomId;
          ws.roomId = null;
          logger.info(`[LIVE] Client left room: ${oldRoomId}`);
          if (oldRoomId) broadcastViewerCount(oldRoomId);
        } else if (message.type === 'live_chat') {
          // [SECURITY] Verify Identity
          const userData = verifySocketToken(message.token);
          if (!userData) return;

          const db = require('./utils/db');
          
          // [ANTI-SPOOFING] Fetch real user info from DB, don't trust client data
          db.query('SELECT name, avatar FROM users WHERE id = $1', [userData.id]).then(userRes => {
            if (userRes.length === 0) return;
            
            const realName = userRes[0].name;
            const realAvatar = userRes[0].avatar;

            const secureMessage = {
              ...message,
              message: {
                ...message.message,
                user: realName,
                avatar: realAvatar,
                userId: userData.id
              }
            };

            db.query(
              'INSERT INTO social_comments (post_id, user_name, content, user_avatar) VALUES ($1, $2, $3, $4)',
              [roomId, realName, message.message.text, realAvatar]
            ).catch(err => logger.error('[DB] Failed to save live chat', err));

            wss.clients.forEach(client => {
              if (client.roomId === roomId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(secureMessage));
              }
            });
          });
        } else if (message.type === 'send_reaction') {
          // [SECURITY] Basic Auth Check
          if (!verifySocketToken(message.token)) return;
          // [BACKEND ARCHITECT] Persistence: Update likes in DB
          const db = require('./utils/db');
          db.query('UPDATE posts SET likes = likes + 1 WHERE id = $1', [roomId])
            .catch(err => logger.error('[DB] Failed to update likes', err));

          wss.clients.forEach(client => {
            if (client.roomId === roomId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));
            }
          });
        } else if (message.type === 'end_live') {
          // [SECURITY] Verify Host Identity
          const userData = verifySocketToken(message.token);
          if (!userData) return;

          const db = require('./utils/db');
          // Check if user is the owner of the post
          db.query('SELECT user_id FROM posts WHERE id = $1', [roomId]).then(res => {
            if (res.length > 0 && res[0].user_id === userData.id) {
              // Update status to ended
              db.query('UPDATE posts SET status = \'ended\' WHERE id = $1', [roomId])
                .then(() => {
                  logger.info(`[LIVE] Host ended room: ${roomId}`);
                  // Broadcast to all viewers
                  wss.clients.forEach(client => {
                    if (client.roomId === roomId && client.readyState === WebSocket.OPEN) {
                      client.send(JSON.stringify({ type: 'stream_ended', roomId }));
                    }
                  });
                });
            }
          });
        }
      }
    } catch (err) {
      logger.error('[SERVER PROTOCOL] Error parsing client message', err);
    }
  });

  ws.on('close', () => {
    if (ws.roomId) {
      const rid = ws.roomId;
      logger.info(`[LIVE] Client disconnected from room: ${rid}`);
      // Re-calculate viewer count for that room after a small delay
      setTimeout(() => {
        let count = 0;
        wss.clients.forEach(client => {
          if (client.roomId === rid && client.readyState === WebSocket.OPEN) {
            count++;
          }
        });
        const countUpdate = JSON.stringify({ type: 'viewer_count', roomId: rid, count });
        wss.clients.forEach(client => {
          if (client.roomId === rid && client.readyState === WebSocket.OPEN) {
            client.send(countUpdate);
          }
        });
      }, 100);
    }
    logger.info('Client disconnected');
  });
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

    // [ARCHITECT] Trigger Matching Engine check
    if (market === 'futures') {
      tradingEngine.checkLimitOrders(symbol, price).then(matchedUserId => {
        if (matchedUserId) {
          // Notify affected user to refresh positions
          Promise.all([
            tradingEngine.getPositions(matchedUserId),
            tradingEngine.getOpenOrders(matchedUserId)
          ]).then(([positions, orders]) => {
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN && client.userId === matchedUserId) {
                client.send(JSON.stringify({ event: 'position_update', data: positions }));
                client.send(JSON.stringify({ event: 'order_update', data: orders }));
              }
            });
          });
        }
      });
    }

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
});

// Throttled Order Book broadcast
const lastDepthBroadcast = new Map();
binanceWS.on('depthUpdate', (data) => {
  const { market, symbol, bids, asks } = data;
  const key = `depth:${market}:${symbol}`;
  const now = Date.now();
  const lastTime = lastDepthBroadcast.get(key) || 0;

  if (now - lastTime >= 500) { // Broadcast depth every 500ms
    lastDepthBroadcast.set(key, now);
    const payload = JSON.stringify({ event: 'depthUpdate', market, symbol, bids, asks });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && 
          client.subscription && 
          client.subscription.symbol === symbol && 
          client.subscription.market === market) {
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
const createDexV1Router = require('./routes/dexV1Routes');
const bitcoinRoutes = require('./routes/bitcoinRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adsRoutes = require('./routes/adsRoutes');
const feedRoutes = require('./routes/feedRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');

app.use('/api/dex', dexRoutes);
app.use('/api/v1/dex', createDexV1Router({
  binanceService,
  binanceWS,
  tradingEngine,
  getUserFromRequest,
  dexRouteResolver: {
    getQuote: dexRoutes.getQuote,
    buildSwap: dexRoutes.buildSwap,
  },
}));
app.use('/api/bitcoin', bitcoinRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1', transactionRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1', marketplaceRoutes);

// 3. INTERNAL TRADING REST API
app.get('/api/market/summary/:market/:symbol', async (req, res) => {
  try {
    const market = req.params.market === 'spot' ? 'spot' : 'futures';
    const symbol = req.params.symbol?.toUpperCase();
    if (!symbol) {
      return res.status(400).json({ success: false, error: 'Symbol is required' });
    }

    const ticker = await binanceService._request(market, 'GET', '/ticker/24hr', { symbol }, false);
    const cached = binanceWS.priceCache.get(`${market}:${symbol}`);
    res.json({
      success: true,
      data: {
        market,
        symbol,
        lastPrice: cached?.price || ticker.lastPrice,
        priceChangePercent: ticker.priceChangePercent,
        highPrice: ticker.highPrice,
        lowPrice: ticker.lowPrice,
        volume: ticker.volume,
        quoteVolume: ticker.quoteVolume,
        weightedAvgPrice: ticker.weightedAvgPrice,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.response?.data?.msg || err.message });
  }
});

app.get('/api/trading/account', async (req, res) => {
  try {
    const userData = getUserFromRequest(req);
    if (!userData) return res.status(401).json({ success: false, error: 'Invalid token' });

    const db = require('./utils/db');
    const balancesRes = await db.query(
      `SELECT
          COALESCE(t.symbol, t.name, 'UNKNOWN') AS symbol,
          COALESCE(t.name, t.symbol, 'Unknown') AS name,
          COALESCE(b.available_balance, 0) AS available_balance,
          COALESCE(b.locked_balance, 0) AS locked_balance
       FROM balances b
       LEFT JOIN tokens t ON t.id = b.token_id
       WHERE b.user_id = $1
       ORDER BY symbol ASC`,
      [userData.id]
    );

    const balances = balancesRes.rows.map((row) => ({
      symbol: String(row.symbol || 'UNKNOWN').toUpperCase(),
      name: row.name,
      available: Number(row.available_balance || 0),
      locked: Number(row.locked_balance || 0),
      total: Number(row.available_balance || 0) + Number(row.locked_balance || 0),
    }));

    const usdt = balances.find((item) => item.symbol === 'USDT');
    res.json({
      success: true,
      data: {
        userId: userData.id,
        balances,
        availableMargin: usdt?.available || 0,
        walletBalance: usdt?.total || 0,
        marginAsset: 'USDT',
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/positions', async (req, res) => {
  try {
    const userData = getUserFromRequest(req);
    if (!userData) return res.status(401).json({ success: false, error: 'Invalid token' });

    const positions = await tradingEngine.getPositions(userData.id);
    res.json({ success: true, data: positions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/positions/open', async (req, res) => {
  try {
    const userData = getUserFromRequest(req);
    if (!userData) return res.status(401).json({ success: false, error: 'Invalid token' });

    const { symbol, side, margin, leverage, amount, orderType = 'MARKET', price } = req.body;
    const normalizedSymbol = symbol?.toUpperCase();
    const normalizedOrderType = String(orderType).toUpperCase();
    const normalizedSide = side?.toUpperCase();
    const quantity = Number(amount);
    const parsedLeverage = Number(leverage);
    const parsedMargin = Number(margin) || 0;

    if (!normalizedSymbol || !['LONG', 'SHORT'].includes(normalizedSide) || !['LIMIT', 'MARKET'].includes(normalizedOrderType) || !quantity || quantity <= 0 || !parsedLeverage || parsedLeverage <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid order payload' });
    }

    // Auto-fetch latest price from memory cache
    const cacheKey = `futures:${normalizedSymbol}`;
    const latestPriceData = binanceWS.priceCache.get(cacheKey);
    const entryPrice = normalizedOrderType === 'LIMIT' ? Number(price) : Number(latestPriceData ? latestPriceData.price : price);

    if (!entryPrice || entryPrice <= 0) {
      return res.status(400).json({ success: false, error: 'Market price is not available yet' });
    }

    if (normalizedOrderType === 'MARKET') {
      // 1. GỬI LỆNH MARKET LÊN BINANCE TESTNET (THẬT)
      try {
        // A. Cập nhật Đòn bẩy (Leverage) lên Binance trước khi đánh lệnh
        await binanceService._request('futures', 'POST', '/leverage', {
          symbol: normalizedSymbol,
          leverage: parsedLeverage
        }, true);

        // B. Đánh Lệnh
        await binanceService.placeOrder('futures', {
          symbol: normalizedSymbol,
          side: normalizedSide === 'LONG' ? 'BUY' : 'SELL', // Binance format
          type: 'MARKET',
          quantity: quantity.toFixed(3) // Định dạng số thập phân của hợp đồng
        }, entryPrice);
      } catch (binanceError) {
        // Log lỗi rõ ràng từ Binance
        const errMsg = binanceError.response?.data?.msg || binanceError.message;
        logger.error(`[MẠNG TESTNET] Lỗi từ Binance Futures: ${errMsg}`);

        let userFacingError = `Binance Testnet Từ Chối: ${errMsg}`;
        if (errMsg.includes('Margin is insufficient')) {
          userFacingError = `Ví Testnet không đủ số dư USDT (Margin). Hãy giảm số lượng hoặc nạp thêm USDT testnet.`;
        }

        throw new Error(userFacingError);
      }
    }

    // 2. MARKET khớp ngay; LIMIT đi vào sổ lệnh local và sẽ khớp khi giá Binance chạm điều kiện.
    const result = await tradingEngine.openPosition(userData.id, normalizedSymbol, normalizedSide, entryPrice, parsedLeverage, parsedMargin, quantity, normalizedOrderType);

    // Broadcast immediately so UI updates
    const [positions, orders] = await Promise.all([
      tradingEngine.getPositions(userData.id),
      tradingEngine.getOpenOrders(userData.id)
    ]);
    wss.clients.forEach(client => {
      // Only broadcast to the specific user who owns the positions
      if (client.readyState === WebSocket.OPEN && client.userId === userData.id) {
        client.send(JSON.stringify({ event: 'position_update', data: positions }));
        client.send(JSON.stringify({ event: 'order_update', data: orders }));
      }
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/positions/close', async (req, res) => {
  try {
    const userData = getUserFromRequest(req);
    if (!userData) return res.status(401).json({ success: false, error: 'Invalid token' });

    const { id } = req.body;

    // Tìm position để lấy thông tin đóng
    const posToClose = await tradingEngine.getPositionById(userData.id, id);
    if (!posToClose) {
      return res.status(404).json({ success: false, error: 'Position not found' });
    }

    // Gửi lệnh đóng ngược chiều lên Binance
    const cacheKey = `futures:${posToClose.symbol?.toUpperCase()}`;
    const latestPriceData = binanceWS.priceCache.get(cacheKey);
    const exitPrice = latestPriceData ? latestPriceData.price : posToClose.entry_price;

    try {
      await binanceService.placeOrder('futures', {
        symbol: posToClose.symbol.toUpperCase(),
        side: posToClose.side === 'LONG' ? 'SELL' : 'BUY', // Đánh ngược chiều để đóng
        type: 'MARKET',
        quantity: Number(posToClose.amount).toFixed(3)
      }, exitPrice);
    } catch (binanceError) {
      logger.error(`[MẠNG TESTNET] Lỗi đóng lệnh Binance: ${binanceError.message}`);
      throw new Error(`Lỗi Đóng Lệnh Binance: ${binanceError.message}`);
    }

    // Nếu Binance đóng thành công, xóa local
    await tradingEngine.closePosition(id);

    // Broadcast immediately
    const positions = await tradingEngine.getPositions(userData.id);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.userId === userData.id) {
        client.send(JSON.stringify({ event: 'position_update', data: positions }));
      }
    });

    res.json({ success: true, data: positions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/orders/open', async (req, res) => {
  try {
    const userData = getUserFromRequest(req);
    if (!userData) return res.status(401).json({ success: false, error: 'Invalid token' });

    const orders = await tradingEngine.getOpenOrders(userData.id);
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders/cancel', async (req, res) => {
  try {
    const userData = getUserFromRequest(req);
    if (!userData) return res.status(401).json({ success: false, error: 'Invalid token' });

    const order = await tradingEngine.cancelOrder(userData.id, req.body.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const orders = await tradingEngine.getOpenOrders(userData.id);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.userId === userData.id) {
        client.send(JSON.stringify({ event: 'order_update', data: orders }));
      }
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

server.listen(PORT, () => {
  logger.info(`Hybrid Server listening on port ${PORT}`);
  
  // Khởi động Background Worker theo dõi hàng đợi Blockchain Transactions (cứ mỗi 10 giây query 1 lần)
  const transactionWorker = require('./workers/transactionWorker');
  transactionWorker.start(10000);

  // Tự động seed dữ liệu Social Feed nếu DB trống
  socialFeedSeeder.seedIfEmpty();

  // Khởi động Binance Crawler Worker (60 phút một lần)
  const binanceCrawlerWorker = require('./workers/binanceCrawlerWorker');
  binanceCrawlerWorker.start(3600000); 
});

module.exports = { server, app, globalEvents };
