import { store } from "src/core/redux/store";
import VMType from "src/core/enum/VMType";
import { fetchEvmBalances } from "./evmBalance";
import { fetchTonBalances } from "./tonBalance";
import { updateNativeBalance } from "../redux/slice/customToken/addCustomToken.slice";

let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;

export const startBalanceWorker = () => {
  if (isRunning) return;
  isRunning = true;

  intervalId = setInterval(async () => {
    try {
      const state = store.getState();
      const { account } = state;

      const {
        accountLists,
        selectAccountId,
        selectedProtocolId,
        protocolListsWithSupportedTokensFromBE,
      } = account;

      if (
        !accountLists ||
        !selectAccountId ||
        !selectedProtocolId ||
        !protocolListsWithSupportedTokensFromBE
      )
        return;

      const protocol = protocolListsWithSupportedTokensFromBE.find(
        (p) => p._id === selectedProtocolId
      );
      const accountData = accountLists.find((a) => a.id === selectAccountId);

      if (!protocol || !accountData) return;

      const protocolData = accountData.protocolData.find(
        (p) => p._id === selectedProtocolId
      );
      if (!protocolData) return;

      const address = protocolData.addressList.find(
        (a) => a.id === protocolData.selectedAddressId
      )?.address;

      if (!address) return;

      let balances: Record<string, any> = {};

      if (protocol.VM !== VMType.EVM && protocol.VM !== VMType.Ton) return;

      if (protocol.VM === VMType.EVM) {
        balances = await fetchEvmBalances({
          rpcUrl: protocol.rpcUrl!,
          walletAddress: address,
          tokens: protocol.supportedToken,
        });
      }

      if (protocol.VM === VMType.Ton) {
        balances = await fetchTonBalances({
          walletAddress: address,
          tokens: protocol.supportedToken,
        });
      }

      store.dispatch(
        updateNativeBalance({
          walletAddress: address,
          protocolData: protocol,
          balance: balances.native.balance,
          usd_price: balances.native.usd_price,
        })
      );
    } catch (err) {
      console.error("Balance worker error", err);
    }
  }, 15_000); // ⏱ 15s
};

export const stopBalanceWorker = () => {
  if (intervalId) clearInterval(intervalId);
  isRunning = false;
};
