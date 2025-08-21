import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";

import accountSliceReducer from "./slices/app.slice";
import authLockSliceReducer from "./slices/auth.slice";
import NFTSliceReducer from "./slices/nft.slice";
import localTokenReducerExport from "./slices/token.slice";
import walletConnectSliceReducer from "./slices/walletConnect.slice";
import tonConnectSliceReducer from "./slices/tonConnect.slice";

const rootReducer = combineReducers({
  authLock: authLockSliceReducer,
  account: accountSliceReducer,
  nft: NFTSliceReducer,
  tokenLocal: localTokenReducerExport,
  walletConnect: walletConnectSliceReducer,
  tonConnect: tonConnectSliceReducer,
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  version: 1,
  whitelist: ["authLock"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
