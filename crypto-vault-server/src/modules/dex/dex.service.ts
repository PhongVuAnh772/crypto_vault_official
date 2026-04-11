import axios from 'axios';
import { ethers } from 'ethers';
import { DexRepository } from './dex.repository';
import { SwapRequest, QuoteResponse, SwapDetails } from './dex.types';

// Uniswap V2 Router ABI (subset)
const ROUTER_ABI = [
  'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
];

export class DexService {
  private repository: DexRepository;
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.repository = new DexRepository();
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  }

  private normalizeSymbol(symbol: string): string {
    const map: Record<string, string> = {
      ETH: 'WETH',
      BTC: 'WBTC',
    };
    return map[symbol] || symbol;
  }

  async getBinancePrice(symbol: string): Promise<number> {
    try {
      const pair = `${symbol}USDT`;
      const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('Binance price fetch error:', error);
      throw new Error('Could not fetch price from Binance');
    }
  }

  async getUniswapQuote(amountIn: string, path: string[]): Promise<string> {
    const routerAddress = process.env.UNISWAP_ROUTER_ADDRESS as string;
    const router = new ethers.Contract(routerAddress, ROUTER_ABI, this.provider);
    
    // Assuming 18 decimals for simplicity in this example, but should be fetched from token metadata
    const amountInWei = ethers.parseUnits(amountIn, 18);
    const amountsOut = await router.getAmountsOut(amountInWei, path);
    const expectedOutWei = amountsOut[amountsOut.length - 1];
    
    return ethers.formatUnits(expectedOutWei, 18);
  }

  getSlippage(inputToken: string): number {
    if (inputToken === 'ETH') return 0.005; // 0.5%
    if (inputToken === 'BTC') return 0.01;  // 1%
    return 0.005; // Default 0.5%
  }

  async quote(request: SwapRequest): Promise<QuoteResponse> {
    const inputSymbol = this.normalizeSymbol(request.inputToken);
    const outputSymbol = this.normalizeSymbol(request.outputToken);

    const inputToken = await this.repository.getTokenBySymbol(inputSymbol);
    const outputToken = await this.repository.getTokenBySymbol(outputSymbol);

    if (!inputToken || !outputToken) {
      throw new Error('Token not supported');
    }

    const path = [inputToken.contract_address, outputToken.contract_address];
    const expectedOut = await this.getUniswapQuote(request.amount, path);
    
    const slippage = this.getSlippage(request.inputToken);
    const amountOutMin = (parseFloat(expectedOut) * (1 - slippage)).toString();

    return {
      expectedOut,
      amountOutMin,
      slippage,
      path,
    };
  }

  async initiateSwap(request: SwapRequest): Promise<SwapDetails> {
    const inputSymbol = this.normalizeSymbol(request.inputToken);
    const inputToken = await this.repository.getTokenBySymbol(inputSymbol);
    const outputToken = await this.repository.getTokenBySymbol(request.outputToken);

    if (!inputToken || !outputToken) {
        throw new Error('Token not supported');
    }

    // Validate Balance
    const balance = await this.repository.getUserBalance(request.userId, inputToken.id);
    if (balance < parseFloat(request.amount)) {
      throw new Error('Insufficient balance');
    }

    // Get Quote
    const quote = await this.quote(request);

    // Save to DB
    const swap = await this.repository.createSwap({
      userId: request.userId,
      inputTokenId: inputToken.id,
      outputTokenId: outputToken.id,
      amountIn: request.amount,
      expectedOut: quote.expectedOut,
      amountOutMin: quote.amountOutMin,
      path: quote.path,
    });

    // Get User Wallet for the chain
    const wallet = await this.repository.getWalletByUserAndChain(request.userId, inputToken.chain_id);
    if (!wallet) {
      throw new Error('User wallet not found for this chain');
    }

    // Create Job
    await this.repository.createTransactionJob(swap.id, {
      path: quote.path,
      amountIn: request.amount,
      amountOutMin: quote.amountOutMin,
      wallet: wallet.address,
      router: process.env.UNISWAP_ROUTER_ADDRESS as string,
    });

    return swap;
  }
}
