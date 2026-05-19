import { CONFIG } from "src/core/constants/config";
import { QuoteInput, BuildTransactionInput } from "../../domain/repositories/DexRepository";

export class DexApiClient {
  constructor(private readonly accessToken?: string) {}

  private get headers() {
    const base: Record<string, string> = { "Content-Type": "application/json" };
    if (this.accessToken) base.Authorization = `Bearer ${this.accessToken}`;
    return base;
  }

  async getQuote(input: QuoteInput) {
    const query = new URLSearchParams({
      chainId: String(input.chainId),
      tokenIn: input.tokenIn,
      tokenOut: input.tokenOut,
      amountIn: input.amountIn,
      slippageBps: String(input.slippageBps),
    });
    const res = await fetch(`${CONFIG.API_BASE_URL}/v1/quotes?${query.toString()}`, { headers: this.headers });
    return res.json();
  }

  async buildTransaction(input: BuildTransactionInput) {
    const res = await fetch(`${CONFIG.API_BASE_URL}/v1/transactions/build`, {
      method: "POST",
      headers: { ...this.headers, "Idempotency-Key": `${input.walletAddress}-${Date.now()}` },
      body: JSON.stringify(input),
    });
    return res.json();
  }

  async getIntent(intentId: string) {
    const res = await fetch(`${CONFIG.API_BASE_URL}/v1/intents/${intentId}`, { headers: this.headers });
    return res.json();
  }
}

