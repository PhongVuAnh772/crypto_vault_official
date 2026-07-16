import { Address, beginCell, toNano } from '@ton/core';
import TonConnectUtils from 'src/core/services/TonConnect/TonConnectUntil';

class TonNftRepository {
  /**
   * Send a transaction to mint an NFT
   * This is a simplified version, usually we send to the Collection contract
   */
  async mintNft(collectionAddress: string, itemOwnerAddress: string, contentUrl: string) {
    // In a real scenario, we build the Mint message payload
    const body = beginCell()
      .storeUint(1, 32) // op: mint
      .storeUint(0, 64) // query_id
      .storeAddress(Address.parse(itemOwnerAddress))
      .storeRef(beginCell().storeBuffer(Buffer.from(contentUrl)).endCell())
      .endCell();

    return {
      address: collectionAddress,
      amount: toNano('0.05').toString(),
      payload: body.toBoc().toString('base64'),
    };
  }

  /**
   * Prepare the purchase transaction
   */
  async buyNft(saleContractAddress: string, price: number) {
    const body = beginCell()
        .storeUint(0, 32) // op: buy (simplified or use specific op)
        .endCell();

    return {
      address: saleContractAddress,
      amount: toNano(price.toString()).toString(),
      payload: body.toBoc().toString('base64'),
    };
  }

  /**
   * Prepare bid transaction
   */
  async bidNft(auctionContractAddress: string, bidAmount: number) {
    const body = beginCell()
        .storeUint(1, 32) // op: bid
        .endCell();

    return {
      address: auctionContractAddress,
      amount: toNano(bidAmount.toString()).toString(),
      payload: body.toBoc().toString('base64'),
    };
  }
}

export default new TonNftRepository();
