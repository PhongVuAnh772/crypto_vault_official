import { Quote } from "../entities/Quote";
import { TradeIntent } from "../entities/TradeIntent";

export interface QuoteInput {
  chainId: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageBps: number;
}

export interface BuildTransactionInput {
  chainId: number;
  walletAddress: string;
  routeId: string;
  slippageBps: number;
  deadlineSec: number;
}

export interface DexRepository {
  getQuote(input: QuoteInput): Promise<Quote>;
  buildTransaction(input: BuildTransactionInput): Promise<TradeIntent>;
  getIntent(intentId: string): Promise<TradeIntent>;
}

