import { ethers } from "ethers";

const DEFAULT_FALLBACK_RPCS: Record<number, string[]> = {
  1: [
    "https://cloudflare-eth.com",
    "https://eth.llamarpc.com",
    "https://rpc.ankr.com/eth"
  ],
  11155111: [
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://1rpc.io/sepolia",
    "https://rpc.ankr.com/eth_sepolia",
    "https://sepolia.gateway.tenderly.co"
  ],
  56: [
    "https://bsc-dataseed.binance.org/",
    "https://binance.llamarpc.com",
    "https://bsc-dataseed1.defibit.io/"
  ],
  97: [
    "https://data-seed-prebsc-1-s1.binance.org:8545/",
    "https://data-seed-prebsc-2-s1.binance.org:8545/",
    "https://data-seed-prebsc-1-s2.binance.org:8545/"
  ],
  137: [
    "https://polygon-rpc.com",
    "https://polygon.llamarpc.com",
    "https://rpc-mainnet.maticvigil.com"
  ],
  80002: [
    "https://rpc-amoy.polygon.technology",
    "https://polygon-amoy.drpc.org"
  ]
};

export class RpcFallbackProvider {
  private urls: string[];
  private currentIndex: number = 0;

  constructor(urls: string[], private chainId?: number) {
    const inputUrls = urls.filter(url => url && (url.startsWith('http') || url.startsWith('ws')));
    const fallbackUrls = chainId && DEFAULT_FALLBACK_RPCS[chainId] ? DEFAULT_FALLBACK_RPCS[chainId] : [];
    
    // Combine and deduplicate
    const combined = [...inputUrls];
    for (const fbUrl of fallbackUrls) {
      if (!combined.includes(fbUrl)) {
        combined.push(fbUrl);
      }
    }
    this.urls = combined;
  }

  async getProvider(): Promise<ethers.JsonRpcProvider | null> {
    if (this.urls.length === 0) return null;

    // Try current provider first
    for (let i = 0; i < this.urls.length; i++) {
      const url = this.urls[this.currentIndex];
      try {
        // If chainId is provided, we use it to prevent auto-detection which can be slow/fail
        const provider = new ethers.JsonRpcProvider(url, this.chainId, {
          staticNetwork: this.chainId ? true : undefined,
        });

        // Quick check if provider is alive
        await Promise.race([
          provider.getBlockNumber(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);

        return provider;
      } catch (error) {
        console.warn(`RPC Fallback: ${url} failed.`, error);
        // Move to next RPC
        this.currentIndex = (this.currentIndex + 1) % this.urls.length;
      }
    }

    return null;
  }

  async getHealthyRpcUrl(): Promise<string> {
    if (this.urls.length === 0) return "";
    for (let i = 0; i < this.urls.length; i++) {
      const url = this.urls[this.currentIndex];
      try {
        const provider = new ethers.JsonRpcProvider(url, this.chainId, {
          staticNetwork: this.chainId ? true : undefined,
        });
        await Promise.race([
          provider.getBlockNumber(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        return url;
      } catch (error) {
        console.warn(`RPC Fallback URL check: ${url} failed.`, error);
        this.currentIndex = (this.currentIndex + 1) % this.urls.length;
      }
    }
    return this.urls[0] || "";
  }
}

export default RpcFallbackProvider;
