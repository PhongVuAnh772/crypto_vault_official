import { ethers } from "ethers";
import RpcFallbackProvider from "../utils/rpcUtils";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

type Params = {
  rpcUrl: string;
  rpcUrls?: string[];
  walletAddress: string;
  tokens: {
    isNativeToken?: boolean;
    contractAddress?: string;
    price?: number;
    symbol?: string;
  }[];
  chainId?: number;
  chainName?: string;
};

export const fetchEvmBalances = async ({
  rpcUrl,
  rpcUrls,
  walletAddress,
  tokens,
  chainId = 1,
  chainName = "evm",
}: Params) => {
  console.log("🚀 fetchEvmBalances START");
  console.log("RPC:", rpcUrl);
  console.log("Wallet:", walletAddress);
  console.log("Tokens:", tokens.length);

  const result: Record<string, any> = {};
  let provider: ethers.JsonRpcProvider | null = null;

  try {
    const urls = rpcUrls && rpcUrls.length > 0 ? rpcUrls : [rpcUrl];
    const fallback = new RpcFallbackProvider(urls, chainId);
    provider = await fallback.getProvider();
    
    if (!provider) {
      throw new Error("No healthy RPC found");
    }

    // 🔥 TEST RPC NGAY
    const blockNumber = await provider.getBlockNumber();
    console.log("✅ RPC OK - block:", blockNumber);
  } catch (e) {
    console.log("❌ RPC INIT FAILED", e);
    throw e;
  }

  for (const token of tokens) {
    try {
      console.log("-----------------------------");
      console.log("🔍 Token:", token.symbol || token.contractAddress);

      // ✅ Native token
      if (token.isNativeToken) {
        const balance = await provider.getBalance(walletAddress);

        console.log("Native balance raw:", balance.toString());

        result["native"] = {
          balance: balance.toString(),
          usd_price: token.price || 0,
        };
        continue;
      }

      if (
        !token.contractAddress ||
        token.contractAddress === "0x0000000000000000000000000000000000000000" ||
        token.contractAddress.toLowerCase() === "0x0000000000000000000000000000000000000000"
      ) {
        console.log("⚠️ Zero address or empty address, skipping contract call");
        continue;
      }

      const contract = new ethers.Contract(
        token.contractAddress,
        ERC20_ABI,
        provider
      );

      const balance = await contract.balanceOf(walletAddress);

      console.log(`ERC20 balance ${token.symbol}:`, balance.toString());

      result[token.contractAddress.toLowerCase()] = {
        balance: balance.toString(),
        usd_price: token.price || 0,
      };
    } catch (tokenError: any) {
      if (
        tokenError?.message?.includes("cannot slice beyond data bounds") ||
        tokenError?.code === "BUFFER_OVERRUN"
      ) {
        console.log(
          `⚠️ Token contract ${token.symbol} (${token.contractAddress}) has no code deployed or returned empty response.`
        );
        result[token.contractAddress.toLowerCase()] = {
          balance: "0",
          usd_price: token.price || 0,
        };
      } else {
        console.log(
          "❌ TOKEN ERROR:",
          token.symbol || token.contractAddress,
          tokenError
        );
      }
    }
  }

  console.log("✅ fetchEvmBalances RESULT:", result);
  return result;
};
