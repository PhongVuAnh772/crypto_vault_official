import { requestApi } from './apiClient';

export type MarketplaceNft = {
  id: string;
  nft_address?: string | null;
  collection_address?: string | null;
  owner_address?: string | null;
  name?: string | null;
  description?: string | null;
  image_url?: string | null;
  metadata_url?: string | null;
  status?: string | null;
  tx_hash?: string | null;
  attributes?: Array<{ trait_type: string; value: string }>;
  created_at?: string;
  updated_at?: string;
};

export const nftService = {
  walletLogin: async (walletAddress: string) =>
    requestApi<{ token: string; user: { id: string; wallet_address: string } }>('/auth/wallet-login', {
      method: 'POST',
      body: { wallet_address: walletAddress },
    }),

  createMetadata: async (params: {
    name: string;
    description?: string;
    image_url: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  }) =>
    requestApi<{ metadata_url: string; metadata: unknown }>('/nfts/metadata', {
      method: 'POST',
      auth: true,
      body: params,
    }),

  createNftRecord: async (params: Partial<MarketplaceNft>) =>
    requestApi<MarketplaceNft>('/nfts', {
      method: 'POST',
      auth: true,
      body: params,
    }),

  getMyNfts: async (ownerAddress: string) =>
    requestApi<MarketplaceNft[]>(`/nfts?owner_address=${encodeURIComponent(ownerAddress)}`),

  patchNft: async (id: string, payload: Partial<MarketplaceNft>) =>
    requestApi<MarketplaceNft>(`/nfts/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  syncNft: async (nftAddress: string, network?: 'testnet' | 'mainnet') =>
    requestApi<MarketplaceNft>(`/sync/nft/${encodeURIComponent(nftAddress)}`, {
      method: 'POST',
      auth: true,
      body: network ? { network } : undefined,
    }),
};
