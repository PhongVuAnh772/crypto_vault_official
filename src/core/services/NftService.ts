import { sendGet, sendPost } from 'src/core/network/requests';
import { NftItem, NftUtility } from 'src/types/nft';

class NftService {
  async getAllNfts(network: 'testnet' | 'mainnet'): Promise<NftItem[]> {
    const response = await sendGet<{ success: boolean; data: NftItem[] }>({
      endpoint: `/api/v1/nft/nfts?network=${network}`,
    });
    return response.data.data;
  }

  async getUserNfts(address: string, network: 'testnet' | 'mainnet'): Promise<NftItem[]> {
    const response = await sendGet<{ success: boolean; data: NftItem[] }>({
      endpoint: `/api/v1/nft/user-nfts?address=${address}&network=${network}`,
    });
    return response.data.data;
  }

  async getUtility(address: string, network: 'testnet' | 'mainnet'): Promise<NftUtility> {
    const response = await sendGet<{ success: boolean; data: NftUtility }>({
      endpoint: `/api/v1/nft/utility?address=${address}&network=${network}`,
    });
    return response.data.data;
  }

  async prepareMint(ownerAddress: string, metadata: any, network: 'testnet' | 'mainnet') {
    return await sendPost({
      endpoint: '/api/v1/nft/mint',
      body: { ownerAddress, metadata, network },
    });
  }

  async prepareListing(sellerAddress: string, nftAddress: string, price: number, type: 'SALE' | 'AUCTION', network: 'testnet' | 'mainnet') {
    return await sendPost({
      endpoint: '/api/v1/nft/list',
      body: { sellerAddress, nftAddress, price, type, network },
    });
  }
}

export default new NftService();
