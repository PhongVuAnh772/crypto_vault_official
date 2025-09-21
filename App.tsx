// @ts-nocheck
import "./src/utils/shim";

import "@exodus/patch-broken-hermes-typed-arrays";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-get-random-values";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import "react-native-url-polyfill/auto";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import appStyles from "src/core/styles";
import Main from "src/main";
import { SessionCryptoProvider } from "src/providers/SessionCryptoProvider";
import toastConfig from "src/utils/toastUtils";
import "./reanimatedConfig.ts";
import { persistor, store } from "./src/core/redux/store";

global.Buffer = Buffer;
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error("Caught global error:", error, isFatal);
});
export default function App() {
  const [publishableKey, setPublishableKey] = useState("");

  const fetchPublishableKey = async () => {
    try {
      const res = await fetch("http://localhost:3000/app/stripe-key");
      const { key } = await res.json();
      console.log(key, "res");
      setPublishableKey(key);
    } catch (err) {
      console.error("Error fetching publishable key", err);
    }
  };
  useEffect(() => {
    fetchPublishableKey();
  }, []);
  return (
    <GestureHandlerRootView style={appStyles.flex1}>
      <SessionCryptoProvider>
        <StripeProvider
          publishableKey={publishableKey}
          merchantIdentifier="merchant.com.phongvuanh772.CryptoVault"
          urlScheme="cryptovault"
        >
          <Provider store={store}>
            {/* <I18nextProvider i18n={i18next}> */}
            <PersistGate loading={null} persistor={persistor}>
              <Main />
              {/* <TonConnectLayout /> */}
              {/* <WalletConnectModal /> */}
            </PersistGate>
            {/* </I18nextProvider> */}
          </Provider>
        </StripeProvider>
      </SessionCryptoProvider>

      <Toast config={toastConfig} position="bottom" />
    </GestureHandlerRootView>
  );
}
