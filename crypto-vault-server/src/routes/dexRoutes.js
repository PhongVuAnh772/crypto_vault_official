const express = require('express');
const router = express.Router();
const uniswapService = require('../services/uniswapService');
const adsService = require('../services/adsService');
const logger = require('../utils/logger');

// ... (SYMBOL_TO_CONTRACT stays the same)

router.get('/quote', async (req, res) => {
  try {
    const { tokenInSymbol, tokenOutSymbol, amount, userId } = req.query;
    
    // ... (Addresses mapping stays the same)
    const tokenInAddr = SYMBOL_TO_CONTRACT[tokenInSymbol] || '0xWETHAddress';
    const tokenOutAddr = SYMBOL_TO_CONTRACT[tokenOutSymbol] || '0xUSDTAddress';

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

    res.json({
      expectedOutput: dexExpectedOut.toString(),
      priceImpact: deviationPercent.toFixed(4),
      dexPrice: dexImpliedPrice,
      binancePrice: binanceRefPrice,
      deviationPercent,
      hasBenefit: appliedDiscount > 0,
      discountValue: appliedDiscount,
      warning: deviationPercent > 5 ? "HIGH_DEVIATION" : null
    });
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
