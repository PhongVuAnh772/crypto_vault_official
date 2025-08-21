// src/store/slices/authLockSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { persistReducer } from "redux-persist";
import ReduxKey from "src/core/enum/ReduxKey";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthLockState {
  enableFaceIdOrTouch: boolean;
  lockoutLocalAuthentication: boolean;
  isFirstTime: boolean;
  keepSplash: boolean;
  timeLockAuth?: number;
  maxPinCodeAttempts: number;
  failedPinAttempts: number;
  isAllModalShow: boolean;
  timeLock?: number;
  isLockoutLocalAuthentication: boolean;
  pin: string | null;
  requirePinCode: boolean;
}

const initialState: AuthLockState = {
  enableFaceIdOrTouch: false,
  lockoutLocalAuthentication: false,
  isFirstTime: true,
  keepSplash: true,
  timeLockAuth: undefined,
  maxPinCodeAttempts: 5,
  failedPinAttempts: 0,
  isAllModalShow: false,
  timeLock: undefined,
  isLockoutLocalAuthentication: false,
  pin: null,
  requirePinCode: false,
};

const authLockSlice = createSlice({
  name: "authLock",
  initialState,
  reducers: {
    setEnableFaceIdOrTouch: (state, action: PayloadAction<boolean>) => {
      state.enableFaceIdOrTouch = action.payload;
    },
    setLockoutLocalAuthentication: (state, action: PayloadAction<boolean>) => {
      state.lockoutLocalAuthentication = action.payload;
    },
    setKeepSplash: (state, action: PayloadAction<boolean>) => {
      state.keepSplash = action.payload;
    },
    resetAuthSlice: () => initialState,
    resetPinCodeData: (state) => {
      state.maxPinCodeAttempts = 5;
      state.failedPinAttempts = 0;
      state.timeLockAuth = undefined;
    },
    setFailedPinAttempts: (state, action: PayloadAction<number>) => {
      state.failedPinAttempts = action.payload;
    },
    setIsAllModalShow: (state, action: PayloadAction<boolean>) => {
      state.isAllModalShow = action.payload;
    },
    setMaxPinCodeAttempts: (state, action: PayloadAction<number>) => {
      state.maxPinCodeAttempts = action.payload;
    },
    setTimeLock: (state, action: PayloadAction<number | undefined>) => {
      state.timeLock = action.payload;
    },
    setPin: (state, action: PayloadAction<string | null>) => {
      state.pin = action.payload;
    },
    setRequirePinCode: (state, action: PayloadAction<boolean>) => {
      state.requirePinCode = action.payload;
    },
    setIsFirstTime: (state, action: PayloadAction<boolean>) => {
      state.isFirstTime = action.payload;
    },
  },
});

export const {
  setEnableFaceIdOrTouch,
  setLockoutLocalAuthentication,
  setKeepSplash,
  resetAuthSlice,
  resetPinCodeData,
  setIsAllModalShow,
  setMaxPinCodeAttempts,
  setFailedPinAttempts,
  setTimeLock,
  setRequirePinCode,
  setPin,
  setIsFirstTime,
} = authLockSlice.actions;

export const resetAllSlice = createAsyncThunk(
  "/app/getCryptosCurrency",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // dispatch(resetAppSlice());
      // dispatch(resetHomeSlice());
      // dispatch(resetTonSlice());
      // dispatch(resetWalletSlice());
      // dispatch(resetBitcoinSlice());
      dispatch(resetAuthSlice());
      return;
    } catch (error: any) {
      return rejectWithValue(error?.response);
    }
  }
);
export const getIsFirstTime = (state: RootState) =>
  state?.authLock?.isFirstTime;

export const getKeepSplash = (state: RootState) => state?.authLock?.keepSplash;
export const getTimeLock = (state: RootState) => state?.authLock?.timeLockAuth;
export const getFailedPinAttempts = (state: RootState) =>
  state?.authLock?.failedPinAttempts;
export const getMaxPinCodeAttempts = (state: RootState) =>
  state?.authLock?.maxPinCodeAttempts;
export const getIsAllModalShow = (state: RootState) =>
  state?.authLock?.isAllModalShow;
export const getLockoutLocalAuthentication = (state: RootState) =>
  state.authLock.isLockoutLocalAuthentication;
export const getRequirePinCode = (state: RootState) =>
  state?.authLock?.requirePinCode;
export const selectorEnableFaceIdOrTouch = (state: RootState) =>
  state?.authLock?.enableFaceIdOrTouch;

const ProtocolListConfig = {
  key: ReduxKey.app,
  storage: AsyncStorage,
  blacklist: [],
};

const authLockSliceReducer = persistReducer(
  ProtocolListConfig,
  authLockSlice.reducer
);

export default authLockSliceReducer;
