import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
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
import TonConnectLayout from "./features/tonConnect";
import WalletConnectModal from "./features/walletConnect/indext";
import AppNavigator from "./navigation";

const Main = () => {
  const { paperTheme, fonts, barStyle } = useAppThemeHook();
  const { isModalShow, isWebViewShowing, enablePassword } = useRequirePinCode();

  useRemoveConfig();
  useNotification();
  useForceUpdate();
  useTonConnectRemoteBridge();
  useDeepLinkListener();
  useKeyboard();
  const initialized = useInitializeWalletKit();
  useWalletKitEventsManager(initialized);

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
