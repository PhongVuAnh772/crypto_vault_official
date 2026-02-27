import { Address, beginCell, internal, SendMode, toNano } from "@ton/core";
import { PinataService } from "./services/pinata.service";
import { WalletService } from "./services/wallet.service";
import { CollectionDeployService } from "./services/deploy.collection";

export class MintFlow {
  static async mintNFT(params: {
    imageUri: string;
    mnemonic: string[];
    name: string;
    description: string;
    collectionAddress?: string;
  }) {
    const imageHash = await PinataService.uploadFile(params.imageUri);
    // const imageHash = await PinataService.uploadFile(params.imageUri);
    const metadata = {
      name: params.name,
      description: params.description,
      image: `ipfs://${imageHash}`,
    };

    const metaHash = await PinataService.uploadJSON(metadata);
    const metaUri = `ipfs://${metaHash}`;

    const wallet = await WalletService.open(params.mnemonic);
    console.log(
      `wallet.contract.getBalance() ${wallet.contract.getBalance().then((e) => {
        console.log(e.toString());
      })}`,
    );
    const seqno = await wallet.contract.getSeqno();
    console.log(seqno);

    let collectionAddr = params.collectionAddress;

    if (!collectionAddr) {
      console.log("Deploying collection...");
      collectionAddr = await CollectionDeployService.deploy(params.mnemonic);
    }

    console.log("Using collection:", collectionAddr);

    const body = beginCell()
      .storeUint(1, 32)
      .storeUint(0, 64)
      .storeUint(Date.now(), 64)
      .storeCoins(toNano("0.02"))
      .storeAddress(wallet.contract.address)
      .storeRef(beginCell().storeBuffer(Buffer.from(metaUri)).endCell())
      .endCell();

    await wallet.contract.sendTransfer({
      seqno,
      secretKey: wallet.keyPair.secretKey,
      messages: [
        internal({
          to: Address.parse(collectionAddr.trim()),
          value: toNano("0.05"),
          body,
        }),
      ],
      sendMode: SendMode.CARRY_ALL_REMAINING_BALANCE,
    });

    return {
      collectionAddress: collectionAddr,
      imageHash,
      metadataHash: metaHash,
      metadataUri: metaUri,
    };
  }
}
