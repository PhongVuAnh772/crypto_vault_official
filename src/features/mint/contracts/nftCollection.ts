import {
  Address,
  beginCell,
  contractAddress,
  internal,
  SendMode,
  Cell,
} from "@ton/core";

import { encodeOffChainContent } from "../utils/ton.utils";
import { CollectionData, MintParams, OpenedWallet } from "../type/ton.types";

export class NftCollection {
  constructor(private data: CollectionData) {}

  get stateInit() {
    return {
      code: this.createCodeCell(),
      data: this.createDataCell(),
    };
  }

  get address(): Address {
    return contractAddress(0, this.stateInit);
  }

  // -------------------------
  // DEPLOY COLLECTION
  // -------------------------

  async deploy(wallet: OpenedWallet) {
    const seqno = await wallet.contract.getSeqno();

    await wallet.contract.sendTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          to: this.address,
          value: "0.2", // testnet deploy ok
          init: this.stateInit,
          body: beginCell().endCell(),
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });

    return seqno;
  }

  // -------------------------
  // MINT NFT
  // -------------------------

  createMintBody(p: MintParams): Cell {
    return beginCell()
      .storeUint(1, 32) // op mint
      .storeUint(p.queryId ?? 0, 64)
      .storeUint(p.itemIndex, 64)
      .storeCoins(p.amount)
      .storeRef(
        beginCell()
          .storeAddress(p.itemOwnerAddress)
          .storeRef(
            beginCell().storeBuffer(Buffer.from(p.commonContentUrl)).endCell(),
          )
          .endCell(),
      )
      .endCell();
  }

  async mint(wallet: OpenedWallet, params: MintParams) {
    const seqno = await wallet.contract.getSeqno();

    await wallet.contract.sendTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          to: this.address,
          value: "0.05",
          body: this.createMintBody(params),
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    });

    return seqno;
  }

  // -------------------------
  // DATA CELL — chuẩn spec
  // -------------------------

  private createDataCell(): Cell {
    const d = this.data;

    const royaltyCell = beginCell()
      .storeUint(d.royaltyPercent, 16)
      .storeUint(1000, 16)
      .storeAddress(d.royaltyAddress)
      .endCell();

    return beginCell()
      .storeAddress(d.ownerAddress)
      .storeUint(d.nextItemIndex, 64)
      .storeRef(
        beginCell()
          .storeRef(encodeOffChainContent(d.collectionContentUrl))
          .storeRef(
            beginCell().storeBuffer(Buffer.from(d.commonContentUrl)).endCell(),
          )
          .endCell(),
      )
      .storeRef(royaltyCell)
      .endCell();
  }

  // -------------------------
  // NFT COLLECTION CODE
  // -------------------------

  private createCodeCell(): Cell {
    const NFT_COLLECTION_CODE =
      "te6cckECFAEAAh8AART/APSkE/S88sgLAQIBYgkCAgEgBAMAJbyC32omh9IGmf6mpqGC3oahgsQCASAIBQIBIAcGAC209H2omh9IGmf6mpqGAovgngCOAD4AsAAvtdr9qJofSBpn+pqahg2IOhph+mH/SAYQAEO4tdMe1E0PpA0z/U1NQwECRfBNDUMdQw0HHIywcBzxbMyYAgLNDwoCASAMCwA9Ra8ARwIfAFd4AYyMsFWM8WUAT6AhPLaxLMzMlx+wCAIBIA4NABs+QB0yMsCEsoHy//J0IAAtAHIyz/4KM8WyXAgyMsBE/QA9ADLAMmAE59EGOASK3wAOhpgYC42Eit8H0gGADpj+mf9qJofSBpn+pqahhBCDSenKgpQF1HFBuvgoDoQQhUZYBWuEAIZGWCqALnixJ9AQpltQnlj+WfgOeLZMAgfYBwGyi544L5cMiS4ADxgRLgAXGBEuAB8YEYGYHgAkExIREAA8jhXU1DAQNEEwyFAFzxYTyz/MzMzJ7VTgXwSED/LwACwyNAH6QDBBRMhQBc8WE8s/zMzMye1UAKY1cAPUMI43gED0lm+lII4pBqQggQD6vpPywY/egQGTIaBTJbvy9AL6ANQwIlRLMPAGI7qTAqQC3gSSbCHis+YwMlBEQxPIUAXPFhPLP8zMzMntVABgNQLTP1MTu/LhklMTugH6ANQwKBA0WfAGjhIBpENDyFAFzxYTyz/MzMzJ7VSSXwXiN0CayQ==";

    return Cell.fromBase64(NFT_COLLECTION_CODE);
  }
}
