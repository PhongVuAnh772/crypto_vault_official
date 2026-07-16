import { OpenedContract } from "@ton/core";
import { WalletContractV5R1 } from "@ton/ton";

export async function waitSeqnoIncrease(
  wallet: OpenedContract<WalletContractV5R1>,
  oldSeqno: number,
) {
  for (let i = 0; i < 40; i++) {
    const seqno = await wallet.getSeqno();

    if (seqno > oldSeqno) {
      console.log("✅ Seqno updated:", seqno);
      return;
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  throw new Error("Seqno did not increase (tx failed)");
}
