import { DexRepository, QuoteInput, BuildTransactionInput } from "../../domain/repositories/DexRepository";
import { DexApiClient } from "../../infra/api/dexApiClient";

export class DexRepositoryImpl implements DexRepository {
  constructor(private readonly apiClient: DexApiClient) {}

  async getQuote(input: QuoteInput) {
    const payload = await this.apiClient.getQuote(input);
    return payload;
  }

  async buildTransaction(input: BuildTransactionInput) {
    const payload = await this.apiClient.buildTransaction(input);
    return payload;
  }

  async getIntent(intentId: string) {
    const payload = await this.apiClient.getIntent(intentId);
    return payload;
  }
}

