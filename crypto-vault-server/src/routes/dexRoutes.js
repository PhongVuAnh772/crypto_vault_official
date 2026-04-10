const express = require('express');
const router = express.Router();
const uniswapService = require('../services/uniswapService');

// Endpoint lấy báo giá từ Uniswap
router.get('/quote', async (req, res) => {
  try {
    const { amountIn, tokenIn, tokenOut } = req.query;
    if (!amountIn || !tokenIn || !tokenOut) {
      return res.status(400).json({ success: false, error: 'Missing parameters' });
    }
    const quote = await uniswapService.getQuote(amountIn, tokenIn, tokenOut);
    res.json({ success: true, quote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint chuẩn bị dữ liệu giao dịch để Frontend ký
router.post('/swap-data', async (req, res) => {
  try {
    const { userId, amountIn, tokenIn, tokenOut, slippage } = req.body;
    const txData = await uniswapService.getSwapTransactionData(userId, amountIn, tokenIn, tokenOut, slippage);
    res.json({ success: true, data: txData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
