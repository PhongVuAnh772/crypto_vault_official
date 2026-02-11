import { Address, beginCell, internal, toNano } from "@ton/core";
import { PinataService } from "./services/pinata.service";
import { WalletService } from "./services/wallet.service";

export class MintFlow {
  static async mintNFT(params: {
    imageUri: string;
    mnemonic: string[];
    name: string;
    description: string;
    collectionAddress: string;
  }) {
    // =========================
    // STEP 1 — upload image
    // =========================

    const imageHash = await PinataService.uploadFile(params.imageUri);

    // =========================
    // STEP 2 — upload metadata
    // =========================

    const metadata = {
      name: params.name,
      description: params.description,
      image: `ipfs://${imageHash}`,
    };

    console.log(`imageHash ${imageHash}`);

    const metaHash = await PinataService.uploadJSON(metadata);
    const metaUri = `ipfs://${metaHash}`;

    // // =========================
    // // STEP 3 — open wallet
    // // =========================

    const wallet = await WalletService.open(params.mnemonic);

    const seqno = await wallet.contract.getSeqno();

    // // =========================
    // // STEP 4 — build mint body
    // // =========================
    // // op = 1 → mint (theo chuẩn tutorial TON)
    const body = beginCell()
      .storeUint(1, 32) // op code mint
      .storeUint(0, 64) // query id
      .storeAddress(wallet.contract.address)
      .storeRef(beginCell().storeBuffer(Buffer.from(metaUri)).endCell())
      .endCell();

    // // =========================
    // // STEP 5 — send tx
    // // =========================

    await wallet.contract.sendTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          to: Address.parse(params.collectionAddress),
          value: toNano("0.05"),
          body,
        }),
      ],
    });

    // // =========================
    // // STEP 6 — wait confirm
    // // =========================

    // await WalletService.waitSeqno(wallet, seqno);

    // return {
    //   imageHash,
    //   metadataHash: metaHash,
    //   metadataUri: metaUri,
    // };
  }
}
