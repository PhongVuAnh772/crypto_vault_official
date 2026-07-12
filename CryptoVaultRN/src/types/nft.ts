export type NftItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  type?: 'SALE' | 'AUCTION';
  owner?: string;
  highestBid?: number;
};

export type NftUtility = {
  fee_discount: number;
  reward_multiplier: number;
  premium_unlocked: boolean;
};
