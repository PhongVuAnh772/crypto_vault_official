import {
  Address,
  beginCell,
  contractAddress,
  internal,
  SendMode,
  Cell,
  toNano,
  Sender,
} from "@ton/core";

import { encodeOffChainContent } from "../utils/ton.utils";
import { CollectionData, MintParams, OpenedWallet } from "../type/ton.types";

export class NftCollection {
  constructor(private readonly data: CollectionData) {}

  // =========================
  // STATE INIT
  // =========================
  async getCollectionData(provider: any) {
    const res = await provider.get("get_collection_data", []);

    const nextItemIndex = res.stack.readBigNumber();
    const contentCell = res.stack.readCell();
    const ownerAddress = res.stack.readAddress();

    return {
      nextItemIndex,
      ownerAddress,
      contentCell,
    };
  }
  static createFromAddress(address: Address): NftCollection {
    const dummy: CollectionData = {
      ownerAddress: address,
      nextItemIndex: 0,
      collectionContentUrl: "",
      commonContentUrl: "",
      royaltyAddress: address,
      royaltyPercent: 0,
    };

    const instance = new NftCollection(dummy);

    // override address getter runtime
    (instance as any)._externalAddress = address;

    return instance;
  }

  get stateInit() {
    return {
      code: this.createCodeCell(),
      data: this.createDataCell(),
    };
  }

  get address(): Address {
    return contractAddress(0, this.stateInit);
  }

  // =========================
  // DEPLOY
  // =========================

  async deploy(sender: Sender) {
    await sender.send({
      to: this.address,
      value: toNano("0.05"),
      init: this.stateInit,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });
  }
  // =========================
  // MINT BODY (DOCS OP=2)
  // =========================

  createMintBody(p: MintParams): Cell {
    return beginCell()
      .storeUint(2, 32)
      .storeUint(p.queryId ?? 0, 64)
      .storeUint(p.itemIndex, 64)
      .storeCoins(toNano("0.02"))
      .storeRef(
        beginCell()
          .storeAddress(p.itemOwnerAddress)
          .storeRef(encodeOffChainContent(p.commonContentUrl))
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
          value: toNano("0.05"),
          body: this.createMintBody(params),
        }),
      ],
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });

    return seqno;
  }

  // =========================
  // DATA CELL — EXACT DOCS LAYOUT
  // =========================

  private createDataCell(): Cell {
    const d = this.data;

    // content cell
    const contentCell = beginCell()
      .storeRef(encodeOffChainContent(d.collectionContentUrl))
      .storeRef(encodeOffChainContent(d.commonContentUrl))
      .endCell();

    // ✅ NFT ITEM CODE — bắt buộc
    const NFT_ITEM_CODE = Cell.fromBase64(
      "te6cckECDQEAAdAAART/APSkE/S88sgLAQIBYgMCAAmhH5/gBQICzgcEAgEgBgUAHQDyMs/WM8WAc8WzMntVIAA7O1E0NM/+kAg10nCAJp/AfpA1DAQJBAj4DBwWW1tgAgEgCQgAET6RDBwuvLhTYALXDIhxwCSXwPg0NMDAXGwkl8D4PpA+kAx+gAxcdch+gAx+gAw8AIEs44UMGwiNFIyxwXy4ZUB+kDUMBAj8APgBtMf0z+CEF/MPRRSMLqOhzIQN14yQBPgMDQ0NTWCEC/LJqISuuMCXwSED/LwgCwoAcnCCEIt3FzUFyMv/UATPFhAkgEBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7AAH2UTXHBfLhkfpAIfAB+kDSADH6AIIK+vCAG6EhlFMVoKHeItcLAcMAIJIGoZE24iDC//LhkiGOPoIQBRONkchQCc8WUAvPFnEkSRRURqBwgBDIywVQB88WUAX6AhXLahLLH8s/Im6zlFjPFwGRMuIByQH7ABBHlBAqN1viDACCAo41JvABghDVMnbbEDdEAG1xcIAQyMsFUAfPFlAF+gIVy2oSyx/LPyJus5RYzxcBkTLiAckB+wCTMDI04lUC8ANqhGIu",
    );

    // royalty
    const royaltyBase = 1000;
    const royaltyFactor = Math.floor(d.royaltyPercent * royaltyBase);

    const royaltyCell = beginCell()
      .storeUint(royaltyFactor, 16)
      .storeUint(royaltyBase, 16)
      .storeAddress(d.royaltyAddress)
      .endCell();

    return beginCell()
      .storeAddress(d.ownerAddress)
      .storeUint(d.nextItemIndex, 64)
      .storeRef(contentCell)
      .storeRef(NFT_ITEM_CODE) // ❗❗❗ thiếu cái này
      .storeRef(royaltyCell)
      .endCell();
  }

  // =========================
  // COLLECTION CODE
  // =========================

  private createCodeCell(): Cell {
    const CODE =
      "te6cckECFAEAAh8AART/APSkE/S88sgLAQIBYgkCAgEgBAMAJbyC32omh9IGmf6mpqGC3oahgsQCASAIBQIBIAcGAC209H2omh9IGmf6mpqGAovgngCOAD4AsAAvtdr9qJofSBpn+pqahg2IOhph+mH/SAYQAEO4tdMe1E0PpA0z/U1NQwECRfBNDUMdQw0HHIywcBzxbMyYAgLNDwoCASAMCwA9Ra8ARwIfAFd4AYyMsFWM8WUAT6AhPLaxLMzMlx+wCAIBIA4NABs+QB0yMsCEsoHy//J0IAAtAHIyz/4KM8WyXAgyMsBE/QA9ADLAMmAE59EGOASK3wAOhpgYC42Eit8H0gGADpj+mf9qJofSBpn+pqahhBCDSenKgpQF1HFBuvgoDoQQhUZYBWuEAIZGWCqALnixJ9AQpltQnlj+WfgOeLZMAgfYBwGyi544L5cMiS4ADxgRLgAXGBEuAB8YEYGYHgAkExIREAA8jhXU1DAQNEEwyFAFzxYTyz/MzMzJ7VTgXwSED/LwACwyNAH6QDBBRMhQBc8WE8s/zMzMye1UAKY1cAPUMI43gED0lm+lII4pBqQggQD6vpPywY/egQGTIaBTJbvy9AL6ANQwIlRLMPAGI7qTAqQC3gSSbCHis+YwMlBEQxPIUAXPFhPLP8zMzMntVABgNQLTP1MTu/LhklMTugH6ANQwKBA0WfAGjhIBpENDyFAFzxYTyz/MzMzJ7VSSXwXiN0CayQ==";

    return Cell.fromBase64(CODE);
  }
}
