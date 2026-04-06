import {
  Address,
  beginCell,
  internal,
  SendMode,
  toNano,
  fromNano,
  OpenedContract,
  Sender,
  Contract,
} from "@ton/core";

import { TonClient, WalletContractV5R1 } from "@ton/ton";
import { TonApiClient } from "@ton-api/client";
import { ContractAdapter } from "@ton-api/ton-adapter";

import { NftCollection } from "./contracts/nftCollection";
import { waitSeqnoIncrease } from "./tx.utils";

class TonApiService {
  private static readonly apiClient = new TonApiClient({
    baseUrl: "https://tonapi.io",
    apiKey:
      "AEOBPSNAUIB7IZAAAAAJ4WOBCSRCBKM2IUD2BKZPBEPKOW4XUMDLCIRGPWCJYSTSOCKUMGI",
  });

  private static readonly adapter = new ContractAdapter(
    TonApiService.apiClient,
  );

  static openRead<T extends Contract>(contract: T): OpenedContract<T> {
    return this.adapter.open(contract);
  }


  private static readonly tonClient = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC",
    apiKey: "bab534075fdbdeb5dc0823588d81fb3dab99eecebe853cee1ffb8714e1d086f8",
  });

  static openWrite<T extends Contract>(contract: T): OpenedContract<T> {
    return this.tonClient.open(contract);
  }

  static async getCollectionData(address: Address) {
    const res = await TonApiService.apiClient.nft.getNftCollection(
      Address.parse(address.toString()),
    );

    return {
      address: res.address,
      nextItemIndex: BigInt(res.nextItemIndex),
      owner: res.owner?.address,
      rawContent: res.rawCollectionContent,
    };
  }
}

class CollectionDeployService {
  static async deploy(
    wallet: OpenedContract<WalletContractV5R1>,
    oldSeqno: number,
    sender: Sender,
    ownerAddress: Address,
    royaltyAddress: Address,
  ): Promise<string> {
    console.log("🚀 Deploying collection...");

    const collection = new NftCollection({
      ownerAddress,
      nextItemIndex: 0,
      collectionContentUrl: "ipfs://HASH/collection.json",
      commonContentUrl: "ipfs://HASH/",
      royaltyAddress,
      royaltyPercent: 0.05,
    });

    const openedCollection = TonApiService.openWrite(collection);

    await openedCollection.deploy(sender);
    await waitSeqnoIncrease(wallet, oldSeqno);


    console.log("✅ Collection deployed:", collection.address.toString());

    return collection.address.toString();
  }
}

export class MintFlow {
  static async mintNFT(params: {
    imageHash: string;
    name: string;
    description: string;
    publicKey: string;
    secretKey: Buffer;
    ownerAddress: string;
    collectionAddress?: string;
  }) {
    const metaUri = "ipfs://METADATA_HASH";

    const wallet = WalletContractV5R1.create({
      workchain: 0,
      publicKey: Buffer.from(params.publicKey, "base64"),
    });

    const openedWallet = TonApiService.openWrite(wallet);
    const sender = openedWallet.sender(params.secretKey);

    console.log("Wallet:", wallet.address.toString());

    const seqno = await openedWallet.getSeqno();
    const balance = await openedWallet.getBalance();

    console.log("Seqno:", seqno);
    console.log("Balance:", fromNano(balance), "TON");

    if (balance < toNano("0.1")) {
      throw new Error("Not enough TON");
    }

    let collectionAddr = params.collectionAddress;

    if (!collectionAddr) {
      collectionAddr = await CollectionDeployService.deploy(
        openedWallet,
        seqno,
        sender,
        Address.parse(params.ownerAddress),
        Address.parse(params.ownerAddress),
      );
    }

    console.log("Using collection:", collectionAddr);


    const contentCell = beginCell().storeBuffer(Buffer.from(metaUri)).endCell();

    const nftItemContent = beginCell()
      .storeAddress(Address.parse(params.ownerAddress))
      .storeRef(contentCell)
      .endCell();

    const collectionData = await TonApiService.getCollectionData(
      Address.parse(collectionAddr),
    );

    const nextIndex = collectionData.nextItemIndex;

    const body = beginCell()
      .storeUint(1, 32)
      .storeUint(0, 64)
      .storeUint(nextIndex, 64)
      .storeCoins(toNano("0.02"))
      .storeRef(nftItemContent)
      .endCell();

    const message = internal({
      to: Address.parse(collectionAddr),
      value: toNano("0.07"),
      body,
    });


    await openedWallet.sendTransfer({
      seqno,
      secretKey: params.secretKey,
      messages: [message],
      sendMode: SendMode.PAY_GAS_SEPARATELY,
    });

    console.log("✅ NFT Mint TX Sent");

    return {
      collectionAddress: collectionAddr,
      metadataUri: metaUri,
      index: nextIndex.toString(),
    };
  }
}
