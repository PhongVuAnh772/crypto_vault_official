export interface SwapRequest {
  userId: string;
  inputToken: string;
  outputToken: string;
  amount: string;
}

export interface QuoteResponse {
  expectedOut: string;
  amountOutMin: string;
  slippage: number;
  path: string[];
}

export interface SwapDetails {
  id: string;
  userId: string;
  inputTokenId: string;
  outputTokenId: string;
  amountIn: string;
  expectedOut: string;
  amountOutMin: string;
  path: string[];
  status: string;
}

export interface TransactionJobPayload {
  path: string[];
  amountIn: string;
  amountOutMin: string;
  wallet: string;
  router: string;
}
