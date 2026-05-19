const express = require('express');
const crypto = require('crypto');

const createDexV1Router = ({
  binanceService,
  binanceWS,
  tradingEngine,
  getUserFromRequest,
  dexRouteResolver,
}) => {
  const router = express.Router();
  const db = require('../utils/db');
  let schemaReady = false;

  const ensureSchema = async () => {
    if (schemaReady) return;
    await db.query(`
      CREATE TABLE IF NOT EXISTS dex_trade_intents (
        intent_id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        chain_id INTEGER NOT NULL,
        wallet_address TEXT NOT NULL,
        route_id TEXT NOT NULL,
        token_in TEXT NOT NULL,
        token_out TEXT NOT NULL,
        amount_in NUMERIC(38, 18) NOT NULL,
        slippage_bps INTEGER NOT NULL,
        unsigned_tx JSONB NOT NULL,
        signed_tx TEXT,
        tx_hash TEXT,
        status VARCHAR(32) NOT NULL,
        error_code TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_dex_trade_intents_user_created ON dex_trade_intents(user_id, created_at DESC);`);
    schemaReady = true;
  };

  const readIntent = async (intentId) => {
    const res = await db.query(
      `SELECT intent_id, user_id, chain_id, wallet_address, route_id, token_in, token_out, amount_in, slippage_bps, tx_hash, status, error_code, created_at, updated_at
       FROM dex_trade_intents
       WHERE intent_id = $1`,
      [intentId]
    );
    return res.rows[0] || null;
  };

  router.get('/market/summary', async (req, res) => {
    try {
      const market = req.query.market === 'spot' ? 'spot' : 'futures';
      const symbol = String(req.query.symbol || '').toUpperCase();
      if (!symbol) return res.status(400).json({ error: 'symbol is required' });

      const ticker = await binanceService._request(market, 'GET', '/ticker/24hr', { symbol }, false);
      const cached = binanceWS.priceCache.get(`${market}:${symbol}`);
      return res.json({
        symbol,
        lastPrice: String(cached?.price || ticker.lastPrice),
        change24hPct: String(ticker.priceChangePercent),
        high24h: String(ticker.highPrice),
        low24h: String(ticker.lowPrice),
        volume24h: String(ticker.quoteVolume),
      });
    } catch (err) {
      return res.status(500).json({ error: err.response?.data?.msg || err.message });
    }
  });

  router.get('/account/trading', async (req, res) => {
    try {
      await ensureSchema();
      const userData = getUserFromRequest(req);
      if (!userData) return res.status(401).json({ error: 'invalid token' });
      const rows = await db.query(
        `SELECT
          COALESCE(t.symbol, t.name, 'UNKNOWN') AS symbol,
          COALESCE(b.available_balance, 0) AS available_balance,
          COALESCE(b.locked_balance, 0) AS locked_balance
         FROM balances b
         LEFT JOIN tokens t ON t.id = b.token_id
         WHERE b.user_id = $1
         ORDER BY symbol ASC`,
        [userData.id]
      );
      const balances = rows.rows.map((row) => ({
        symbol: String(row.symbol || 'UNKNOWN').toUpperCase(),
        available: String(row.available_balance || 0),
        locked: String(row.locked_balance || 0),
      }));
      const usdt = balances.find((item) => item.symbol === 'USDT');
      const availableMargin = Number(usdt?.available || 0);
      const walletBalance = availableMargin + Number(usdt?.locked || 0);
      return res.json({
        userId: userData.id,
        availableMargin: String(availableMargin),
        walletBalance: String(walletBalance),
        marginAsset: 'USDT',
        balances,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  router.get('/quotes', async (req, res) => {
    try {
      const tokenIn = String(req.query.tokenIn || '').toUpperCase();
      const tokenOut = String(req.query.tokenOut || '').toUpperCase();
      const amountIn = String(req.query.amountIn || '');
      if (!tokenIn || !tokenOut || !amountIn) return res.status(400).json({ error: 'tokenIn, tokenOut, amountIn are required' });

      const quotePayload = await dexRouteResolver.getQuote({
        tokenInSymbol: tokenIn,
        tokenOutSymbol: tokenOut,
        amount: amountIn,
      });

      const quoteId = crypto.randomUUID();
      const routeId = crypto.randomUUID();
      return res.json({
        quoteId,
        routeId,
        amountOut: String(quotePayload.expectedOutput),
        amountOutMin: String(quotePayload.expectedOutput),
        priceImpactBps: Math.round(Number(quotePayload.priceImpact || 0) * 100),
        gasEstimate: quotePayload.gasEstimate || null,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  router.post('/routes/compute', async (req, res) => {
    const { chainId, tokenIn, tokenOut, amountIn } = req.body || {};
    if (!chainId || !tokenIn || !tokenOut || !amountIn) {
      return res.status(400).json({ error: 'chainId, tokenIn, tokenOut, amountIn are required' });
    }
    return res.json({
      routeId: crypto.randomUUID(),
      candidates: [{ path: [String(tokenIn).toUpperCase(), String(tokenOut).toUpperCase()], amountOut: String(amountIn), gasEstimate: null }],
    });
  });

  router.post('/simulations', async (req, res) => {
    try {
      const { chainId, walletAddress, routeId, tokenIn, tokenOut, amountIn, slippageBps = 50 } = req.body || {};
      if (!chainId || !walletAddress || !routeId || !tokenIn || !tokenOut || !amountIn) {
        return res.status(400).json({ error: 'missing required fields' });
      }
      const quotePayload = await dexRouteResolver.getQuote({
        tokenInSymbol: String(tokenIn).toUpperCase(),
        tokenOutSymbol: String(tokenOut).toUpperCase(),
        amount: String(amountIn),
      });
      const impact = Number(quotePayload.priceImpact || 0);
      return res.json({
        success: true,
        gasUsed: null,
        warnings: impact > 3 ? ['HIGH_PRICE_IMPACT'] : [],
        errorCode: null,
        metadata: {
          routeId,
          expectedOutput: String(quotePayload.expectedOutput),
          slippageBps: Number(slippageBps),
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  router.post('/transactions/build', async (req, res) => {
    try {
      await ensureSchema();
      const userData = getUserFromRequest(req);
      if (!userData) return res.status(401).json({ error: 'invalid token' });

      const { chainId, walletAddress, routeId, tokenIn, tokenOut, amountIn, slippageBps = 50 } = req.body || {};
      if (!chainId || !walletAddress || !routeId || !tokenIn || !tokenOut || !amountIn) {
        return res.status(400).json({ error: 'missing required fields' });
      }

      const buildPayload = await dexRouteResolver.buildSwap({
        userAddress: walletAddress,
        amountIn: String(amountIn),
        tokenInSymbol: String(tokenIn).toUpperCase(),
        tokenOutSymbol: String(tokenOut).toUpperCase(),
        slippage: Number(slippageBps) / 100,
      });

      const intentId = crypto.randomUUID();
      await db.query(
        `INSERT INTO dex_trade_intents
          (intent_id, user_id, chain_id, wallet_address, route_id, token_in, token_out, amount_in, slippage_bps, unsigned_tx, status)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)`,
        [
          intentId,
          userData.id,
          Number(chainId),
          walletAddress,
          routeId,
          String(tokenIn).toUpperCase(),
          String(tokenOut).toUpperCase(),
          Number(amountIn),
          Number(slippageBps),
          JSON.stringify({
            to: buildPayload.to,
            data: buildPayload.data,
            value: String(buildPayload.value || '0'),
            gasLimit: buildPayload.gasEstimate || null,
            maxFeePerGas: null,
            maxPriorityFeePerGas: null,
            nonce: null,
          }),
          'awaiting_signature',
        ]
      );

      return res.json({
        intentId,
        unsignedTx: {
          to: buildPayload.to,
          data: buildPayload.data,
          value: String(buildPayload.value || '0'),
          gasLimit: buildPayload.gasEstimate || null,
          maxFeePerGas: null,
          maxPriorityFeePerGas: null,
          nonce: null,
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  router.post('/transactions/relay', async (req, res) => {
    try {
      await ensureSchema();
      const userData = getUserFromRequest(req);
      if (!userData) return res.status(401).json({ error: 'invalid token' });

      const { intentId, signedTx } = req.body || {};
      if (!intentId || !signedTx) return res.status(400).json({ error: 'intentId and signedTx are required' });
      const intent = await readIntent(intentId);
      if (!intent) return res.status(404).json({ error: 'intent not found' });
      if (intent.user_id !== userData.id) return res.status(403).json({ error: 'forbidden' });

      const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;
      const updateResult = await db.query(
        `UPDATE dex_trade_intents
         SET signed_tx = $1, tx_hash = $2, status = 'submitted', updated_at = NOW()
         WHERE intent_id = $3 AND user_id = $4`,
        [signedTx, txHash, intentId, userData.id]
      );
      if (updateResult.rowCount === 0) return res.status(404).json({ error: 'intent not found' });

      setTimeout(async () => {
        try {
          await db.query(`UPDATE dex_trade_intents SET status = 'pending', updated_at = NOW() WHERE intent_id = $1`, [intentId]);
        } catch (err) {}
      }, 500);
      setTimeout(async () => {
        try {
          await db.query(`UPDATE dex_trade_intents SET status = 'confirmed', updated_at = NOW() WHERE intent_id = $1`, [intentId]);
        } catch (err) {}
      }, 2000);

      return res.json({ txHash, status: 'submitted' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  router.get('/intents/:intentId', async (req, res) => {
    try {
      await ensureSchema();
      const userData = getUserFromRequest(req);
      if (!userData) return res.status(401).json({ error: 'invalid token' });
      const intent = await readIntent(req.params.intentId);
      if (!intent) return res.status(404).json({ error: 'intent not found' });
      if (intent.user_id && intent.user_id !== userData.id) return res.status(403).json({ error: 'forbidden' });
      return res.json({
        intentId: intent.intent_id,
        chainId: intent.chain_id,
        walletAddress: intent.wallet_address,
        routeId: intent.route_id,
        tokenIn: intent.token_in,
        tokenOut: intent.token_out,
        amountIn: String(intent.amount_in),
        txHash: intent.tx_hash,
        status: intent.status,
        errorCode: intent.error_code,
        createdAt: new Date(intent.created_at).getTime(),
        updatedAt: new Date(intent.updated_at).getTime(),
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  router.get('/realtime/replay', async (req, res) => {
    const { channel, fromCursor } = req.query;
    if (!channel || !fromCursor) return res.status(400).json({ error: 'channel and fromCursor are required' });
    return res.json({
      channel: String(channel),
      fromCursor: String(fromCursor),
      toCursor: String(fromCursor),
      events: [],
    });
  });

  return router;
};

module.exports = createDexV1Router;
