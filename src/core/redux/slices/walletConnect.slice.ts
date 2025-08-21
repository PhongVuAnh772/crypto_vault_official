import AsyncStorage from "@react-native-async-storage/async-storage";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import ReduxKey from "src/core/enum/ReduxKey";
import { RootState } from "src/core/redux/store";
import { WalletConnectType } from "../type/walletConnect.type";

const initialState: WalletConnectType = {
  proposal: undefined,
  requestEvent: undefined,
  showModalConnect: false,
  type: "",
};

export const walletConnectSlice = createSlice({
  name: "walletConnectSlice",
  initialState: initialState,
  reducers: {
    setProposal: (state, action: PayloadAction<any>) => {
      state.proposal = action.payload;
    },
    setRequestEvent: (state, action: PayloadAction<any>) => {
      state.requestEvent = action.payload;
    },
    setModalConnect: (state, action: PayloadAction<boolean>) => {
      state.showModalConnect = action.payload;
    },
    setType: (state, action: PayloadAction<string>) => {
      state.type = action.payload;
    },
  },
  extraReducers: (build) => {},
});

export const { setProposal, setModalConnect, setType, setRequestEvent } =
  walletConnectSlice.actions;

export const getProposal = (state: RootState) => {
  const walletConnectData = state.walletConnect;
  return walletConnectData.proposal;
};
export const getRequestEvent = (state: RootState) => {
  const walletConnectData = state.walletConnect;
  return walletConnectData.requestEvent;
};
export const getShowModalConnect = (state: RootState) => {
  const walletConnectData = state.walletConnect;
  return walletConnectData.showModalConnect;
};
export const getType = (state: RootState) => {
  const walletConnectData = state.walletConnect;
  return walletConnectData.type;
};
const walletConnectConfig = {
  key: ReduxKey.walletConnect,
  storage: AsyncStorage,
  blacklist: ["showModalConnect", "proposal", "requestEvent", "type"],
};

const walletConnectSliceReducer = persistReducer(
  walletConnectConfig,
  walletConnectSlice.reducer
);
// Export the reducer without persistReducer
export default walletConnectSliceReducer;
