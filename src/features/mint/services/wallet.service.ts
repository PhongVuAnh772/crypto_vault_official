import { mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV4, WalletContractV5R1 } from "@ton/ton";
import { TonClientService } from "./tonClient.service";

export class WalletService {
  static async open(mnemonic: string[], testnet = false) {
    const keyPair = await mnemonicToPrivateKey(mnemonic);

    const wallet = WalletContractV5R1.create({
      workchain: 0,
      publicKey: keyPair.publicKey,
    });

    const client = TonClientService.get(testnet);
    const contract = client.open(wallet);

    return { contract, keyPair };
  }
}
