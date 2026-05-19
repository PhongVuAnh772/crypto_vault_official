const { ethers } = require('ethers');
const logger = require('../utils/logger');

// Uniswap V2 Router 02 Address (Sepolia Testnet)
const UNISWAP_ROUTER_ADDRESS = ethers.getAddress('0xc532a74256d3db42d0fe72a79e0273a447475895');
const UNISWAP_ROUTER_ABI = [
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)'
];

class UniswapService {
  constructor() {
    // Mặc định dùng Sepolia RPC công khai nếu không có trong env
    const rpcUrl = process.env.EVM_RPC_URL || 'https://rpc.ankr.com/eth_sepolia';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async getQuote(amountIn, tokenIn, tokenOut) {
    try {
      const router = new ethers.Contract(UNISWAP_ROUTER_ADDRESS, UNISWAP_ROUTER_ABI, this.provider);
      const amountInWei = ethers.parseEther(amountIn.toString());
      const path = [ethers.getAddress(tokenIn), ethers.getAddress(tokenOut)];
      
      const amountsOut = await router.getAmountsOut(amountInWei, path);
      return ethers.formatUnits(amountsOut[1], 18); // Giả định tokenOut có 18 decimals
    } catch (error) {
      logger.error('Uniswap Quote Error:', error);
      throw error;
    }
  }

  // Hàm này trả về dữ liệu giao dịch để Frontend tự ký bằng ví (như WalletConnect)
  async getSwapTransactionData(userAddress, amountIn, tokenIn, tokenOut, slippage = 0.5) {
    try {
      const recipient = ethers.getAddress(userAddress);
      const amountInWei = ethers.parseEther(amountIn.toString());
      const quote = await this.getQuote(amountIn, tokenIn, tokenOut);
      
      // Tính toán amountOutMin dựa trên slippage
      const amountOutMin = ethers.parseEther(
        (parseFloat(quote) * (1 - slippage / 100)).toString()
      );

      const path = [ethers.getAddress(tokenIn), ethers.getAddress(tokenOut)];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 phút

      const routerInterface = new ethers.Interface(UNISWAP_ROUTER_ABI);
      
      // Nếu tokenIn là Native ETH
      const data = routerInterface.encodeFunctionData('swapExactETHForTokens', [
        amountOutMin,
        path,
        recipient,
        deadline
      ]);

      return {
        to: UNISWAP_ROUTER_ADDRESS,
        data: data,
        value: amountInWei.toString(),
        estimatedOutput: quote
      };
    } catch (error) {
      logger.error('Uniswap Swap Data Error:', error);
      throw error;
    }
  }
}

module.exports = new UniswapService();
