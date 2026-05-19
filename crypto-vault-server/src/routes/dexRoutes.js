const express = require('express');
const router = express.Router();
const uniswapService = require('../services/uniswapService');
const adsService = require('../services/adsService');
const logger = require('../utils/logger');

const SYMBOL_TO_CONTRACT = (() => {
  try {
    return JSON.parse(process.env.DEX_TOKEN_CONTRACTS || '{}');
  } catch (err) {
    logger.error('Invalid DEX_TOKEN_CONTRACTS JSON', err);
    return {};
  }
})();

const resolveTokenAddress = (symbol) => {
  const tokenSymbol = String(symbol || '').toUpperCase();
  const address = SYMBOL_TO_CONTRACT[tokenSymbol];
  if (!address) {
    throw new Error(`DEX token contract is not configured for ${tokenSymbol}`);
  }
  return address;
};

const getQuote = async ({ tokenInSymbol, tokenOutSymbol, amount, userId }) => {
  const tokenInAddr = resolveTokenAddress(tokenInSymbol);
  const tokenOutAddr = resolveTokenAddress(tokenOutSymbol);

  // 1. Quoter từ Smart Contract DEX
  const dexExpectedOutString = await uniswapService.getQuote(amount, tokenInAddr, tokenOutAddr);
  let dexExpectedOut = parseFloat(dexExpectedOutString);

  // 2. Định giá gốc từ Global Backend Cache (Binance)
  const binancePair = `${tokenInSymbol}${tokenOutSymbol}`;
  let binanceRefPrice = global.priceCache ? global.priceCache.get(binancePair) : null;
  
  if (!binanceRefPrice) {
    binanceRefPrice = dexExpectedOut / amount;
  }

  // 3. Hệ thống Spread & Benefit
  const dexImpliedPrice = dexExpectedOut / amount;
  let deviationPercent = Math.abs((dexImpliedPrice - binanceRefPrice) / binanceRefPrice) * 100;

  // A. Kiểm tra Benefit từ xem Quảng cáo
  let appliedDiscount = 0;
  if (userId) {
    const benefit = await adsService.getActiveBenefit(userId);
    if (benefit && benefit.type === 'SPREAD_DISCOUNT') {
      appliedDiscount = benefit.value; // Ví dụ: 0.3 (giảm 30% spread)
      
      // Giảm spread (deviation) để tạo perception giá tốt hơn
      const originalSpread = dexExpectedOut - (binanceRefPrice * amount);
      const newSpread = originalSpread * (1 - appliedDiscount);
      
      // Tính toán lại Output kỳ vọng (tốt hơn cho user)
      dexExpectedOut = (binanceRefPrice * amount) + newSpread;
      deviationPercent = deviationPercent * (1 - appliedDiscount);
    }
  }

  return {
    expectedOutput: dexExpectedOut.toString(),
    priceImpact: deviationPercent.toFixed(4),
    dexPrice: dexImpliedPrice,
    binancePrice: binanceRefPrice,
    deviationPercent,
    hasBenefit: appliedDiscount > 0,
    discountValue: appliedDiscount,
    warning: deviationPercent > 5 ? "HIGH_DEVIATION" : null
  };
};

router.get('/quote', async (req, res) => {
  try {
    const { tokenInSymbol, tokenOutSymbol, amount, userId } = req.query;
    const payload = await getQuote({ tokenInSymbol, tokenOutSymbol, amount, userId });
    res.json(payload);
  } catch (err) {
    // ... 
    logger.error('DEX Quote Error', err);
    res.status(500).json({ error: 'Quote DEX Engine Failed' });
  }
});

/**
 * [POST] /api/dex/swap/build
 * Input: Body { userAddress, amountIn, tokenInSymbol, tokenOutSymbol, slippage }
 */
const buildSwap = async ({ userAddress, amountIn, tokenInSymbol, tokenOutSymbol, slippage = 5 }) => {
  const tokenInAddr = resolveTokenAddress(tokenInSymbol);
  const tokenOutAddr = resolveTokenAddress(tokenOutSymbol);

  // Service Uniswap sẽ nén raw_bytes cho Transaction (Ký qua Mobile Keystore)
  const txPayload = await uniswapService.getSwapTransactionData(
    userAddress,
    amountIn,
    tokenInAddr,
    tokenOutAddr,
    slippage
  );

  return {
    to: txPayload.to,
    data: txPayload.data,
    value: txPayload.value,
    amountOutMin: txPayload.estimatedOutput.toString(),
    gasEstimate: txPayload.gasEstimate || null
  };
};

router.post('/swap/build', async (req, res) => {
  try {
    const payload = await buildSwap(req.body || {});
    res.json(payload);
  } catch (err) {
    logger.error('Build Swap DEX Error', err);
    res.status(500).json({ error: 'Failed to construct raw transaction' });
  }
});

router.getQuote = getQuote;
router.buildSwap = buildSwap;

module.exports = router;
