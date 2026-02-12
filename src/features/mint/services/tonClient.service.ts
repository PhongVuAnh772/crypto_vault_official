import { TonClient } from "@ton/ton";

export class TonClientService {
  private static client: TonClient;

  static get(testnet = false) {
    if (!this.client) {
      const base = "https://toncenter.com";

      this.client = new TonClient({
        endpoint: `${base}/api/v2/jsonRPC`,
        apiKey:
          "bab534075fdbdeb5dc0823588d81fb3dab99eecebe853cee1ffb8714e1d086f8",
      });
    }

    return this.client;
  }
}
