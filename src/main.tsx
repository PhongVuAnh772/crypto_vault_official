import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Address } from "@ton/core";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import CommonErrorModal from "./components/layout/CommonErrorModal";
import ForceUpdateModal from "./components/layout/ForceUpdateModal";
import RequirePinCodeLayout from "./components/layout/RequirePinCode/requirePinCode.view";
import { useTonConnectRemoteBridge } from "./core/hooks/TonConnectRemoteBridge";
import useAppThemeHook from "./core/hooks/useAppTheme";
import useDeepLinkListener from "./core/hooks/useDeepLinkListener";
import useForceUpdate from "./core/hooks/useForceUpdate";
import useInitializeWalletKit from "./core/hooks/useInitializeWalletKit";
import useKeyboard from "./core/hooks/useKeyboard";
import useNotification from "./core/hooks/useNotification";
import useRemoveConfig from "./core/hooks/useRemoteConfig";
import useRequirePinCode from "./core/hooks/useRequirePinCode";
import useWalletKitEventsManager from "./core/hooks/useWalletKitEventsManager";
import { useAppSelector } from "./core/redux/hooks";
import { useTonAddressData } from "./core/redux/slice/account.selector";
import { getIsTestnet } from "./core/redux/slice/app.selector";
import TonWalletVersion from "./core/enum/TonWalletVersion";
import TonConnectTransfer from "./core/services/TonTransactions/tonConnectTransfer";
import TonServices from "./core/services/TonServices";
import { setTonIsTestnet } from "./core/utils/tonNetwork";
import TonConnectLayout from "./features/tonConnect";
import { registerTonConnectRequest } from "./features/marketplace/services/tonConnectService";
import WalletConnectModal from "./features/walletConnect/indext";
import AppNavigator from "./navigation";

const Main = () => {
  const { paperTheme, fonts, barStyle } = useAppThemeHook();
  const { isModalShow, isWebViewShowing, enablePassword } = useRequirePinCode();
  const tonAddressData = useTonAddressData();
  const isTestnet = useAppSelector(getIsTestnet);

  useRemoveConfig();
  useNotification();
  useForceUpdate();
  useTonConnectRemoteBridge();
  useDeepLinkListener();
  useKeyboard();
  const initialized = useInitializeWalletKit();
  useWalletKitEventsManager(initialized);

  useEffect(() => {
    setTonIsTestnet(!!isTestnet);
  }, [isTestnet]);

  useEffect(() => {
    registerTonConnectRequest(async (tx) => {
      if (!tonAddressData?.address || !tonAddressData?.privateKey || !tonAddressData?.publicKey) {
        throw new Error("Không có ví TON khả dụng để ký giao dịch");
      }

      const tonServices = new TonServices();
      const tonTransfer = new TonConnectTransfer();
      const accountRes = await tonServices.getAccounts({
        address: Address.parse(tonAddressData.address),
      });
      if (!accountRes.isSuccess || !accountRes.data) {
        throw new Error("Không lấy được account TON hiện tại");
      }

      const transferData = await tonTransfer.createTransferTonConnect({
        privateKey: tonAddressData.privateKey,
        publicKey: tonAddressData.publicKey,
        version: (tonAddressData.version as TonWalletVersion) || TonWalletVersion.V5,
        fromAccountData: accountRes.data as any,
        estimateFee: false,
        param: tx.messages.map((m) => ({
          address: m.address,
          amount: m.amount,
          payload: m.payload,
        })),
      });

      if (!transferData?.transferData?.messageBOCString) {
        throw new Error("Không tạo được transaction TON");
      }

      const chainRes = await tonServices.sendMessageToBlockchain({
        boc: transferData.transferData.messageBOCString,
      });

      return {
        boc: transferData.transferData.messageBOCString,
        txHash: typeof chainRes?.data === "string" ? chainRes.data : undefined,
      };
    });
  }, [tonAddressData?.address, tonAddressData?.privateKey, tonAddressData?.publicKey, tonAddressData?.version]);

  return (
    <PaperProvider theme={{ ...paperTheme, fonts }}>
      <BottomSheetModalProvider>
        <StatusBar style={barStyle} />
        <AppNavigator />
        <CommonErrorModal />
        <ForceUpdateModal subVisible={!isModalShow} />
        <TonConnectLayout />
        <WalletConnectModal />
        <RequirePinCodeLayout
          subVisible={!isModalShow && enablePassword}
          isWebviewShowing={isWebViewShowing}
          isMainRequirePinCode
        />
      </BottomSheetModalProvider>
    </PaperProvider>
  );
};

export default Main;
