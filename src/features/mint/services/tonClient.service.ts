import { TonClient } from "@ton/ton";

export class TonClientService {
  private static client: TonClient;

  static get(testnet = true) {
    if (!this.client) {
      const base = testnet
        ? "https://testnet.toncenter.com"
        : "https://toncenter.com";

      this.client = new TonClient({
        endpoint: `${base}/api/v2/jsonRPC`,
        apiKey: process.env.TONCENTER_API_KEY,
      });
    }

    return this.client;
  }
}
