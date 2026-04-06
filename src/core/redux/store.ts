import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import devToolsEnhancer from "redux-devtools-expo-dev-plugin";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import localTokenReducerExport from "src/core/redux/slice/customToken/addCustomToken.slice";
import bitcoinSliceReducer from "src/features/coinDetails/bitcoin/bitcoin.coinDetails.slice";
import tonSliceReducer from "src/features/coinDetails/ton/ton.coinDetails.slice";
import exploreReducer from "src/features/home/bottomTab/explore/explore.slice";
import homeSliceReducer from "src/features/home/slice/home.slice";
import notificationReducer from "src/features/notifications/notification.slice";
import aboutUsDetailReducer from "src/features/setting/aboutusdetail/aboutus.detail.slice";
import contactSupportReducer from "src/features/setting/contact/contact.slice";
import faqReducer from "src/features/setting/faq/faq.slice";
import tonConnectReducer from "src/features/tonConnect/slice/tonConnect.slice";
import evmSendSlice from "src/features/transfer/evm/send.evm.slice";
import transferSliceReducer from "src/features/transfer/transfer.slice";
import walletConnectSliceReducer from "src/features/walletConnect/slice/walletConnect.slice";
import ReduxKey from "../enum/ReduxKey";
import accountSliceReducer from "./slice/account.slice";
import appSliceReducer from "./slice/app.slice";
import NFTReducer from "./slice/NFT/NFTImport.slice";
import NFTDataReducer from "./slice/NftData.slice";
import swapReducer from "./slice/swap/swap.slice";
import appConfigSliceReducer from "./slice/appConfig.slice";

const persistConfig = {
  storage: AsyncStorage,
  key: ReduxKey.root,
  blacklist: [
    ReduxKey.ton,
    ReduxKey.wallet,
    ReduxKey.account,
    ReduxKey.home,
    ReduxKey.app,
    ReduxKey.aboutUs,
    ReduxKey.contactSupport,
    ReduxKey.faq,
    ReduxKey.bitcoin,
    ReduxKey.explore,
    ReduxKey.transferSlice,
    ReduxKey.NFTReducer,
    ReduxKey.swap,
    ReduxKey.TonConnect,
    ReduxKey.walletConnect,
  ],
};

const rootReducer = combineReducers({
  app: appSliceReducer,
  appConfig: appConfigSliceReducer,
  bitcoin: bitcoinSliceReducer,
  home: homeSliceReducer,
  ton: tonSliceReducer,
  nftImport: NFTReducer,
  aboutUs: aboutUsDetailReducer,
  contactSupport: contactSupportReducer,
  faq: faqReducer,
  notifications: notificationReducer,
  account: accountSliceReducer,
  explore: exploreReducer,
  tokenLocal: localTokenReducerExport,
  evmSend: evmSendSlice,
  transferSlice: transferSliceReducer,
  NFTDataSlice: NFTDataReducer,
  swap: swapReducer,
  tonConnect: tonConnectReducer,
  walletConnect: walletConnectSliceReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: false,
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(devToolsEnhancer()),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;
