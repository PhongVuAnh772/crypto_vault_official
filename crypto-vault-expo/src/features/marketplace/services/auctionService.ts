import { requestApi } from './apiClient';

export type Auction = {
  id: string;
  auction_contract_address?: string | null;
  nft_address: string;
  seller_address: string;
  current_bidder?: string | null;
  start_price: string | number;
  current_price: string | number;
  min_bid_step: string | number;
  start_time?: string | null;
  end_time: string;
  status: string;
  tx_hash?: string | null;
};

export type Bid = {
  id: string;
  auction_id: string;
  bidder_address: string;
  amount: string | number;
  tx_hash?: string | null;
  status: string;
  created_at: string;
};

export const auctionService = {
  createAuction: async (payload: Partial<Auction>) =>
    requestApi<Auction>('/auctions', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  getAuctions: async () => requestApi<Auction[]>('/auctions'),

  getAuctionDetail: async (id: string) => requestApi<Auction>(`/auctions/${id}`),

  patchAuction: async (id: string, payload: Partial<Auction>) =>
    requestApi<Auction>(`/auctions/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    }),

  bid: async (payload: { auction_id: string; bidder_address: string; amount: number; tx_hash?: string }) =>
    requestApi<Bid>('/bids', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  getBids: async (auctionId: string) => requestApi<Bid[]>(`/auctions/${auctionId}/bids`),

  syncAuction: async (contractAddress: string) =>
    requestApi<Auction>(`/sync/auction/${encodeURIComponent(contractAddress)}`, {
      method: 'POST',
      auth: true,
    }),
};

