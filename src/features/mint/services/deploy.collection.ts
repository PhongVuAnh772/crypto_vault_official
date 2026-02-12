import { NftCollection } from "../contracts/nftCollection";
import { WalletService } from "./wallet.service";

export class CollectionDeployService {
  static async deploy(mnemonic: string[]) {
    const wallet = await WalletService.open(mnemonic);

    const collection = new NftCollection({
      ownerAddress: wallet.contract.address,
      nextItemIndex: 0,
      collectionContentUrl: "ipfs://HASH/collection.json",
      commonContentUrl: "ipfs://HASH/",
      royaltyAddress: wallet.contract.address,
      royaltyPercent: 0.05,
    });

    console.log("Collection address:", collection.address.toString());

    const seqno = await collection.deploy(wallet);

    console.log("Collection deployed ✅");

    return collection.address.toString();
  }
}
