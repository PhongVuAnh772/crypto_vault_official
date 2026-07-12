import { beginCell, toNano } from '@ton/core';
import { Buffer } from 'buffer';

type TonMessage = {
  address: string;
  amount: string;
  payload?: string;
};

type TonConnectTx = {
  validUntil: number;
  messages: TonMessage[];
};

type TonConnectRequestFn = (tx: TonConnectTx) => Promise<{ boc?: string; txHash?: string } | string | void>;

let tonConnectRequest: TonConnectRequestFn | null = null;

export const registerTonConnectRequest = (handler: TonConnectRequestFn) => {
  tonConnectRequest = handler;
};

const requireTonConnect = () => {
  if (!tonConnectRequest) {
    throw new Error('TonConnect chưa được khởi tạo cho luồng marketplace');
  }
  return tonConnectRequest;
};

export const tonConnectMarketplaceService = {
  async sendTransaction(tx: TonConnectTx) {
    const handler = requireTonConnect();
    return handler(tx);
  },

  async mintNft(params: {
    collectionAddress: string;
    ownerAddress: string;
    metadataUrl: string;
    itemIndex: number;
    mintValueTon?: string;
  }) {
    if (!params.collectionAddress) {
      throw new Error('Thiếu NFT_COLLECTION_ADDRESS');
    }
    const body = beginCell()
      .storeUint(2, 32)
      .storeUint(0, 64)
      .storeUint(params.itemIndex, 64)
      .storeCoins(toNano('0.02'))
      .storeRef(
        beginCell()
          .storeAddress(null)
          .storeRef(beginCell().storeBuffer(Buffer.from(params.metadataUrl)).endCell())
          .endCell(),
      )
      .endCell();

    return this.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [
        {
          address: params.collectionAddress,
          amount: toNano(params.mintValueTon || '0.07').toString(),
          payload: body.toBoc().toString('base64'),
        },
      ],
    });
  },

  async bidAuction(params: { auctionContractAddress: string; amountTon: number }) {
    const body = beginCell().storeUint(1, 32).storeUint(0, 64).endCell();
    return this.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 180,
      messages: [
        {
          address: params.auctionContractAddress,
          amount: toNano(String(params.amountTon)).toString(),
          payload: body.toBoc().toString('base64'),
        },
      ],
    });
  },

  async finalizeAuction(params: { auctionContractAddress: string }) {
    const body = beginCell().storeUint(2, 32).storeUint(0, 64).endCell();
    return this.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 180,
      messages: [
        {
          address: params.auctionContractAddress,
          amount: toNano('0.05').toString(),
          payload: body.toBoc().toString('base64'),
        },
      ],
    });
  },
};
