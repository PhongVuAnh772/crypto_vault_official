import "@walletconnect/react-native-compat";
import React from "react";
import { I18nextProvider } from "react-i18next";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-get-random-values"; // for web3
import "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import WatchlistContext from "src/components/specific/CoinDetails/Contexts/WatchlistContext";
import AppToast from "src/components/specific/ToastConfig";
import { SessionCryptoProvider } from "src/core/context/appContext";
import { persistor, store } from "src/core/redux/store";
import appStyles from "src/core/styles";
import Utils from "src/core/utils/commonUtils";
import Main from "src/main";
import "./reanimatedConfig";
import AppI18Next from "./src/core/locales";


import AdMobService from "src/features/admob/AdMobService";

function App() {
  LogBox.ignoreAllLogs();
  Utils.logConfig();

  React.useEffect(() => {
    AdMobService.init();
  }, []);

  return (
    <GestureHandlerRootView style={appStyles.flex1}>
      <Provider store={store}>
        <I18nextProvider i18n={AppI18Next}>
          <PersistGate loading={null} persistor={persistor}>
            <SessionCryptoProvider>
              <WatchlistContext>
                <Main />
              </WatchlistContext>
            </SessionCryptoProvider>
            <AppToast />
          </PersistGate>
        </I18nextProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
