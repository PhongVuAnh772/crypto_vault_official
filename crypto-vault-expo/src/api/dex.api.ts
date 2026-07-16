import { apiClient } from './client';

export interface DexQuoteResponse {
  expectedOutput: string;
  priceImpact: string;
  dexPrice: number;
  binancePrice: number;
  deviationPercent: number;
  warning: string | null;
}

export interface SwapBuildRequest {
  userAddress: string;
  amountIn: string | number;
  tokenInSymbol: string;
  tokenOutSymbol: string;
  slippage?: number;
}

export interface SwapBuildResponse {
  to: string;
  data: string;
  value: string;
  amountOutMin: string;
  gasEstimate: string;
}

export const DexApi = {
  /**
   * Gọi báo giá (Quote) để xem tỷ giá trượt chênh lệch ra sao.
   */
  getQuote: async (tokenInSymbol: string, tokenOutSymbol: string, amount: string): Promise<DexQuoteResponse> => {
    const res = await apiClient.get('/api/dex/quote', {
      params: { tokenInSymbol, tokenOutSymbol, amount }
    });
    return res.data;
  },

  /**
   * Yêu cầu Backend cấu trúc một lệnh Gửi Hex Data Blockchain
   */
  buildSwapTransaction: async (payload: SwapBuildRequest): Promise<SwapBuildResponse> => {
    const res = await apiClient.post('/api/dex/swap/build', payload);
    return res.data;
  }
};
