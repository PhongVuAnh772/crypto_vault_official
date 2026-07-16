import { mnemonicToPrivateKey } from "@ton/crypto";
import { WalletContractV5R1 } from "@ton/ton";
import { TonClientService } from "./tonClient.service";

export class WalletService {
  static async open(mnemonic: string[]) {
  const keyPair = await mnemonicToPrivateKey(mnemonic);

  const wallet = WalletContractV5R1.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
    walletId: {
      networkGlobalId: -239,
    },
  });

  const client = TonClientService.get();
  const contract = client.open(wallet);

  return { contract, keyPair };
}
}
