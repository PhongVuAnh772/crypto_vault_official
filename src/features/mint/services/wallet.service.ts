import { mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV4 } from "@ton/ton";
import { TonClientService } from "./tonClient.service";

export class WalletService {
  static async open(mnemonic: string[], testnet = true) {
    const keyPair = await mnemonicToPrivateKey(mnemonic);

    const wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: keyPair.publicKey,
    });

    const client = TonClientService.get(testnet);
    const contract = client.open(wallet);

    return { contract, keyPair };
  }

  static async waitSeqno(wallet: Awaited<ReturnType<typeof WalletService.open>>, seqno: number) {
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      if ((await wallet.contract.getSeqno()) === seqno + 1) break;
    }
  }
}
