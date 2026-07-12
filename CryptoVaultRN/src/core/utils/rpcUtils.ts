import { ethers } from "ethers";

export class RpcFallbackProvider {
  private urls: string[];
  private currentIndex: number = 0;

  constructor(urls: string[], private chainId?: number) {
    this.urls = urls.filter(url => url && (url.startsWith('http') || url.startsWith('ws')));
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
}

export default RpcFallbackProvider;
