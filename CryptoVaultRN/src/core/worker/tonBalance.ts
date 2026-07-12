import { Address, TonClient } from "@ton/ton";

type Params = {
  walletAddress: string;
  tokens: any[];
};

export const fetchTonBalances = async ({ walletAddress, tokens }: Params) => {
  const client = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
  });

  const result: Record<string, any> = {};

  for (const token of tokens) {
    // Native TON
    if (token.isNativeToken) {
      const balance = await client.getBalance(Address.parse(walletAddress));
      result["native"] = {
        balance: balance.toString(),
        usd_price: token.price || 0,
      };
    }

    // Jetton → bạn có thể mở rộng sau
  }

  return result;
};
