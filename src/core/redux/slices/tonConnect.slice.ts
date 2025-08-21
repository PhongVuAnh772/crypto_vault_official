import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Address } from "@ton/core";
import { RootState } from "src/core/redux/store";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { persistReducer } from "redux-persist";
import ReduxKey from "src/core/enum/ReduxKey";

import {
  decodeURl,
  MessageSSE,
  RemoveInjectConnectionType,
  RemoveRemoteConnectionType,
  SaveAppConnectionType,
  TonConnectBridgeType,
  TonConnectType,
} from "../type/tonConnect.type";
import {
  generateAppHashFromUrl,
  getFixedLastSlashUrl,
} from "src/utils/tonConnectUtils";

const initialState: TonConnectType = {
  showModalConnect: false,
  type: "",
  url: undefined,
  connectedApps: {
    mainnet: {},
    testnet: {},
  },
  listenerMessageSSE: {
    activeRequest: false,
    from: undefined,
    request: undefined,
  },
  dAppBrowse: [],
};

export const tonConnectSlice = createSlice({
  name: "tonConnectSlice",
  initialState: initialState,
  reducers: {
    setModalConnect: (state, action: PayloadAction<boolean>) => {
      state.showModalConnect = action.payload;
    },
    setURL: (state, action: PayloadAction<decodeURl>) => {
      state.url = action.payload;
    },
    setType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
    saveAppConnection: (
      state,
      action: PayloadAction<SaveAppConnectionType>
    ) => {
      const { chainName, address, appData, connection } = action.payload;
      const walletAddress = Address.parse(address).toRawString();
      const connectedApps = state.connectedApps[chainName];
      if (!connectedApps[walletAddress]) {
        connectedApps[walletAddress] = {};
      }
      const hash = generateAppHashFromUrl(appData.url ?? "");
      const alreadyConnectedApp = connectedApps[walletAddress][hash];

      if (alreadyConnectedApp) {
        connectedApps[walletAddress][hash] = {
          ...alreadyConnectedApp,
          ...appData,
          iconUrl: appData.iconUrl ?? alreadyConnectedApp.iconUrl,
          autoConnectDisabled:
            alreadyConnectedApp.autoConnectDisabled &&
            connection?.type !== TonConnectBridgeType.Injected,
          connections: connection
            ? [...alreadyConnectedApp.connections, connection]
            : alreadyConnectedApp.connections,
        };
      } else {
        connectedApps[walletAddress][hash] = {
          ...appData,
          connections: connection ? [connection] : [],
        };
      }
    },
    setMessageSSE: (state, action: PayloadAction<MessageSSE>) => {
      state.listenerMessageSSE = action.payload;
    },
    removeInjectConnection: (
      state,
      action: PayloadAction<RemoveInjectConnectionType>
    ) => {
      const { chainName, address, url } = action.payload;
      const fixedUrl = getFixedLastSlashUrl(url);

      if (state.connectedApps[chainName]?.[address]) {
        const keys = Object.keys(state.connectedApps[chainName][address] || {});
        const apps = Object.values(
          state.connectedApps[chainName][address] || {}
        );

        const index = apps.findIndex((app) =>
          fixedUrl.startsWith(getFixedLastSlashUrl(app.url ?? ""))
        );

        if (index !== -1) {
          const hash = keys[index];

          if (state.connectedApps[chainName][address]?.[hash]) {
            state.connectedApps[chainName][address][hash].connections =
              state.connectedApps[chainName][address][hash].connections.filter(
                (connection) =>
                  connection.type !== TonConnectBridgeType.Injected
              );
            if (
              state.connectedApps[chainName][address][hash].connections
                .length === 0
            ) {
              delete state.connectedApps[chainName][address][hash];
            }
            if (
              Object.keys(state.connectedApps[chainName][address]).length === 0
            ) {
              delete state.connectedApps[chainName][address];
            }
          }
        }
      }
    },
    removeRemoteConnection: (
      state,
      action: PayloadAction<RemoveRemoteConnectionType>
    ) => {
      const { chainName, address, url, clientSessionId } = action.payload;
      const fixedUrl = getFixedLastSlashUrl(url);

      if (state.connectedApps[chainName]?.[address]) {
        const keys = Object.keys(state.connectedApps[chainName][address] || {});
        const apps = Object.values(
          state.connectedApps[chainName][address] || {}
        );

        const index = apps.findIndex((app) =>
          fixedUrl.startsWith(getFixedLastSlashUrl(app.url ?? ""))
        );

        if (index !== -1) {
          const hash = keys[index];

          if (state.connectedApps[chainName][address]?.[hash]) {
            state.connectedApps[chainName][address][hash].connections =
              state.connectedApps[chainName][address][hash].connections.filter(
                (connection) =>
                  !(
                    connection.type === TonConnectBridgeType.Remote &&
                    connection.clientSessionId === clientSessionId
                  )
              );
            if (
              state.connectedApps[chainName][address][hash].connections
                .length === 0
            ) {
              delete state.connectedApps[chainName][address][hash];
            }
          }
        }
      }
    },
    saveDAppBrowse: (state, action: PayloadAction<string>) => {
      const alreadySave = state.dAppBrowse.find(
        (item) => item === action.payload
      );
      if (!alreadySave) {
        state.dAppBrowse.push(action.payload);
      }
    },
    removeDAppBrowse: (state, action: PayloadAction<string>) => {
      const index = state.dAppBrowse.findIndex(
        (item) => item === action.payload
      );
      state.dAppBrowse.splice(index, 1);
    },
  },
  extraReducers: (build) => {},
});

export const {
  setModalConnect,
  setType,
  setURL,
  saveAppConnection,
  saveDAppBrowse,
  removeDAppBrowse,
  setMessageSSE,
  removeRemoteConnection,
  removeInjectConnection,
} = tonConnectSlice.actions;

export const getShowModalConnect = (state: RootState) => {
  const walletConnectData = state.tonConnect;
  return walletConnectData.showModalConnect;
};
export const getType = (state: RootState) => {
  const walletConnectData = state.tonConnect;
  return walletConnectData.type;
};
export const getURL = (state: RootState) => {
  const walletConnectData = state.tonConnect;
  return walletConnectData.url;
};
export const getAppConnection = (state: RootState) => {
  const walletConnectData = state.tonConnect;
  return walletConnectData;
};
export const getActiveRequest = (state: RootState) => {
  const activeRequest = state.tonConnect.listenerMessageSSE.activeRequest;
  return activeRequest;
};
export const getMessageSSE = (state: RootState) => {
  const response = state.tonConnect.listenerMessageSSE;
  return response;
};
export const getDAppBrowse = (state: RootState) => {
  const response = state.tonConnect.dAppBrowse;
  return response;
};
const tonConnectPersistConfig = {
  key: ReduxKey.TonConnect,
  storage: AsyncStorage,
  blacklist: ["showModalConnect", "url", "type", "listenerMessageSSE"],
};

const tonConnectSliceReducer = persistReducer(
  tonConnectPersistConfig,
  tonConnectSlice.reducer
);
export default tonConnectSliceReducer;
