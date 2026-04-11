const express = require('express');
const router = express.Router();
const uniswapService = require('../services/uniswapService');
const logger = require('../utils/logger');
// requireAuth có thể chèn ở main server

// Bản đồ map Address giả định cho Ticker Binance -> Contract Erc20 (Cho DEMO, Production cần quét DB Token Address)
const SYMBOL_TO_CONTRACT = {
  'USDT': '0x55d398326f99059fF775485246999027B3197955', // Ví dụ
  'ETH': '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
};

/**
 * [GET] /api/dex/quote
 * Input: ?tokenInSymbol=ETH&tokenOutSymbol=USDT&amount=1
 * - Fetch rate Uniswap
 * - Combine with global.priceCache để chặn cướp giá/trượt giá
 */
router.get('/quote', async (req, res) => {
  try {
    const { tokenInSymbol, tokenOutSymbol, amount } = req.query;
    
    // Nếu production thì tra Database ở bảng Tokens, dùng mock cho Architecture:
    const tokenInAddr = SYMBOL_TO_CONTRACT[tokenInSymbol] || '0xWETHAddress';
    const tokenOutAddr = SYMBOL_TO_CONTRACT[tokenOutSymbol] || '0xUSDTAddress';

    // 1. Quoter từ Smart Contract DEX V2/V3
    const dexExpectedOutString = await uniswapService.getQuote(amount, tokenInAddr, tokenOutAddr);
    const dexExpectedOut = parseFloat(dexExpectedOutString);

    // 2. Định giá gốc từ Global Backend Cache (Binance Throttled)
    const binancePair = `${tokenInSymbol}${tokenOutSymbol}`; // E.g., ETHUSDT
    let binanceRefPrice = global.priceCache ? global.priceCache.get(binancePair) : null;
    
    // Fallback lỡ như Binance websocket giật hoặc không có stable coin chuẩn
    if (!binanceRefPrice) {
      binanceRefPrice = dexExpectedOut / amount; // Fallback lấy luôn giá DEX
    }

    // 3. Hệ thống Cảnh Báo An Toàn: Slippage (Trượt giá rỗng Pool)
    const dexImpliedPrice = dexExpectedOut / amount;
    const deviationPercent = Math.abs((dexImpliedPrice - binanceRefPrice) / binanceRefPrice) * 100;

    res.json({
      expectedOutput: dexExpectedOut.toString(),
      priceImpact: deviationPercent.toFixed(4), // Hiển thị % trượt giá
      dexPrice: dexImpliedPrice,
      binancePrice: binanceRefPrice,
      deviationPercent,
      warning: deviationPercent > 5 ? "HIGH_DEVIATION" : null // Quá 5% giá Binance, App sẽ bật Alert nháy đỏ!
    });
  } catch (err) {
    logger.error('DEX Quote Error', err);
    res.status(500).json({ error: 'Quote DEX Engine Failed' });
  }
});

/**
 * [POST] /api/dex/swap/build
 * Input: Body { userAddress, amountIn, tokenInSymbol, tokenOutSymbol, slippage }
 */
router.post('/swap/build', async (req, res) => {
  try {
    const { userAddress, amountIn, tokenInSymbol, tokenOutSymbol, slippage = 5 } = req.body;
    
    const tokenInAddr = SYMBOL_TO_CONTRACT[tokenInSymbol] || '0xWETHAddress';
    const tokenOutAddr = SYMBOL_TO_CONTRACT[tokenOutSymbol] || '0xUSDTAddress';

    // Service Uniswap sẽ nén raw_bytes cho Transaction (Ký qua Mobile Keystore)
    const txPayload = await uniswapService.getSwapTransactionData(
      userAddress,
      amountIn,
      tokenInAddr,
      tokenOutAddr,
      slippage
    );

    // Cung cấp Hex Data về cho React Native
    res.json({
        to: txPayload.to,
        data: txPayload.data,
        value: txPayload.value,      
        amountOutMin: txPayload.estimatedOutput.toString(),
        gasEstimate: "180000" // Hardcode mockup gas, thực tế gọi provider.estimateGas()
    });

  } catch (err) {
    logger.error('Build Swap DEX Error', err);
    res.status(500).json({ error: 'Failed to construct raw transaction' });
  }
});

module.exports = router;
