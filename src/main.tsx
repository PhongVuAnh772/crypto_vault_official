import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import useAppTheme from "hooks/useAppThemeHook";
import React from "react";
import { StatusBar } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigator from "./navigation";
import { useTonConnectRemoteBridge } from "hooks/useTonConnectRemoteBridge";
import useInitializeWalletKit from "hooks/useInitializeWalletKit";
import useWalletKitEventsManager from "hooks/useWalletKitEventsManager";

const Main = () => {
  const { paperTheme, fonts, barStyle } = useAppTheme();
  useTonConnectRemoteBridge();
  const initialized = useInitializeWalletKit();
  useWalletKitEventsManager(initialized);
  return (
    <PaperProvider theme={{ ...paperTheme, fonts }}>
      <BottomSheetModalProvider>
        <StatusBar barStyle={barStyle} />
        <AppNavigator />
      </BottomSheetModalProvider>
    </PaperProvider>
  );
};

export default Main;
