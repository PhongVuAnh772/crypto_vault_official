import { Address, OpenedContract } from "@ton/core";
import { WalletContractV4 } from "@ton/ton";
import { KeyPair } from "@ton/crypto";

export type OpenedWallet = {
  contract: OpenedContract<WalletContractV4>;
  keyPair: KeyPair;
};

export type CollectionData = {
  ownerAddress: Address;
  royaltyPercent: number;
  royaltyAddress: Address;
  nextItemIndex: number;
  collectionContentUrl: string;
  commonContentUrl: string;
};

export type MintParams = {
  queryId?: number;
  itemOwnerAddress: Address;
  itemIndex: number;
  amount: bigint;
  commonContentUrl: string;
};
