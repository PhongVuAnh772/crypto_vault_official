import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { persistReducer } from 'redux-persist';
import AuthAction from 'src/core/enum/AuthAction';
import LanguageType from 'src/core/enum/LanguageType';
import ReduxKey from 'src/core/enum/ReduxKey';
import ThemeKey from 'src/core/enum/ThemeKey';
import { sendGet } from 'src/core/network/requests';
import AccountServices from 'src/core/services/AccountServices';
import { resetBitcoinSlice } from 'src/features/coinDetails/bitcoin/bitcoin.coinDetails.slice';
import { resetTonSlice } from 'src/features/coinDetails/ton/ton.coinDetails.slice';
import { resetHomeSlice } from 'src/features/home/slice/home.slice';
import { RootState } from '../store';
import { resetWalletSlice } from './account.slice';
import { AppSliceType, CryptosCurrencyType, SettingCurrencyType } from './type';

const initialState: AppSliceType = {
    timeLock: undefined,
    remoteConfigAppVersion: undefined,
    authAction: undefined,
    settingCurrency: undefined,
    cryptosCurrency: undefined,
    selectedCurrencySetting: undefined,
    baseCurrency: undefined,
    themeMode: ThemeKey.light,
    languageType: LanguageType.vi,
    requirePinCode: false,
    showForceUpdateModal: false,
    maxPinCodeAttempts: 5,
    failedPinAttempts: 0,
    forceUpdate: false,
    keepSplash: true,
    isFirstTime: true,
    isModalShow: false,
    enableFaceIdOrTouch: false,
    showModalConfirmTransaction: false,
    pressActionNoti: true,
    showModalSelectProtocol: false,
    showCommonErrorModal: false,
    updateBalance: false,
    webViewIsShowing: false,
    minFeeForJettonTransfer: undefined,
    blockJettonTransfer: false,
    blockTonNftTransfer: false,
    blockTonTransfer: false,
    blockBitcoinTransfer: false,
    actionFailedNeedToContact: '',
    tonAdminBounce: false,
    jettonAdminBounce: false,
    isLockoutLocalAuthentication: false,
    keyboardHeight: 0,
    swapGuidingShow: true,
    enablePassword: true,
};

export const defaultSettingCurrency = {
    name: 'Euro',
    rate: 1,
    symbol: 'EUR',
    sign: '€',
};

// MARK: Setting Currency

export const getSettingCurrency = createAsyncThunk(
  "/app/getSettingCurrency",
  async (_, { rejectWithValue, dispatch }) => {
    const MOCK_SETTING_CURRENCIES: SettingCurrencyType[] = [
      {
        name: "US Dollar",
        rate: 1,
        symbol: "USD",
        sign: "$",
      },
      {
        name: "Euro",
        rate: 0.92,
        symbol: "EUR",
        sign: "€",
      },
      {
        name: "Vietnamese Dong",
        rate: 25000,
        symbol: "VND",
        sign: "₫",
      },
      {
        name: "Japanese Yen",
        rate: 155,
        symbol: "JPY",
        sign: "¥",
      },
      {
        name: "British Pound",
        rate: 0.79,
        symbol: "GBP",
        sign: "£",
      },
    ];

    try {
      const res = await sendGet<SettingCurrencyType[]>({
        endPoint: "mobile/setting-currency",
      });

      const data = res?.data?.length ? res.data : MOCK_SETTING_CURRENCIES;

      // set base currency (rate === 1)
      const baseCurrency = data.find((e) => e.rate === 1);
      if (baseCurrency) {
        dispatch(setBaseCurrency(baseCurrency));
      }

      return data;
    } catch (error: any) {
      // fallback khi lỗi BE
      const baseCurrency = MOCK_SETTING_CURRENCIES.find((e) => e.rate === 1);
      if (baseCurrency) {
        dispatch(setBaseCurrency(baseCurrency));
      }

      return MOCK_SETTING_CURRENCIES;
      // ⛔ KHÔNG reject → app vẫn chạy
    }
  }
);

// MARK: Cryptos Currency
export const getCryptosCurrency = createAsyncThunk(
  "/app/getCryptosCurrency",
  async (_, { rejectWithValue }) => {
    try {
      const res = await sendGet<CryptosCurrencyType[]>({
        endPoint: "mobile/cryptos/currency",
      });

      if (res?.data && res.data.length > 0) {
        return res.data;
      }

      // ===== MOCK DATA (fallback) =====
      return [
        {
          name: "Bitcoin",
          price: 43000,
          slug: "bitcoin",
          symbol: "BTC",
        },
        {
          name: "Ethereum",
          price: 2300,
          slug: "ethereum",
          symbol: "ETH",
        },
        {
          name: "BNB",
          price: 310,
          slug: "binance-coin",
          symbol: "BNB",
        },
        {
          name: "Polygon",
          price: 0.78,
          slug: "polygon",
          symbol: "POL",
        },
        {
          name: "Toncoin",
          price: 2.35,
          slug: "toncoin",
          symbol: "TON",
        },
      ];
    } catch (error: any) {
      // ===== MOCK DATA khi API lỗi =====
      return [
        {
          name: "Bitcoin",
          price: 43000,
          slug: "bitcoin",
          symbol: "BTC",
        },
        {
          name: "Ethereum",
          price: 2300,
          slug: "ethereum",
          symbol: "ETH",
        },
        {
          name: "BNB",
          price: 310,
          slug: "binance-coin",
          symbol: "BNB",
        },
        {
          name: "Polygon",
          price: 0.78,
          slug: "polygon",
          symbol: "POL",
        },
        {
          name: "Toncoin",
          price: 2.35,
          slug: "toncoin",
          symbol: "TON",
        },
      ];
    }
  }
);


// MARK: Cryptos Currency
export const resetAllSlice = createAsyncThunk(
    '/app/getCryptosCurrency',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            dispatch(resetAppSlice());
            dispatch(resetHomeSlice());
            dispatch(resetTonSlice());
            dispatch(resetWalletSlice());
            dispatch(resetBitcoinSlice());
            return;
        } catch (error: any) {
            return rejectWithValue(error?.response);
        }
    },
);

// MARK: Add wallet.
export const changePinCode = createAsyncThunk(
    'app/changePinCode',
    async ({ pinCode }: { pinCode: string }, { getState, rejectWithValue }) => {
        try {
            const rootState = getState() as RootState;
            const accountLists = rootState.account.accountLists;
            const accountServices = new AccountServices();
            if (accountLists == null) {
                return rejectWithValue(null);
            }
            return await accountServices.saveAccountDataWithEncrypt(
                accountLists,
                pinCode,
            );
        } catch (error) {
            return rejectWithValue(error);
        }
    },
);

// MARK: App Slice

export const appSlice = createSlice({
    name: 'appSlice',
    initialState: initialState,
    extraReducers: builder => {
        builder
            .addCase(getSettingCurrency.rejected, () => {})
            .addCase(getSettingCurrency.fulfilled, (state, action) => {
                state.settingCurrency = action.payload;
            })
            .addCase(getCryptosCurrency.fulfilled, (state, action) => {
                state.cryptosCurrency = action.payload;
            });
    },
    reducers: {
        setKeepSplash: (state, action: PayloadAction<boolean>) => {
            state.keepSplash = action.payload;
        },
        setTheme: (state, action: PayloadAction<ThemeKey>) => {
            state.themeMode = action.payload;
        },
        changeLanguageType: (state, action: PayloadAction<LanguageType>) => {
            i18next.changeLanguage(action.payload);
            state.languageType = action.payload;
        },
        setRequirePinCode: (state, action: PayloadAction<boolean>) => {
            state.requirePinCode = action.payload;
        },
        setFailedPinAttempts: (state, action: PayloadAction<number>) => {
            state.failedPinAttempts = action.payload;
        },
        setMaxPinCodeAttempts: (state, action: PayloadAction<number>) => {
            state.maxPinCodeAttempts = action.payload;
        },
        setTimeLock: (state, action: PayloadAction<number | undefined>) => {
            state.timeLock = action.payload;
        },
        setForceUpdate: (state, action: PayloadAction<boolean>) => {
            state.forceUpdate = action.payload;
        },
        setRemoteConfigAppVersion: (state, action: PayloadAction<string>) => {
            state.remoteConfigAppVersion = action.payload;
        },
        setShowForceUpdateModal: (state, action: PayloadAction<boolean>) => {
            state.showForceUpdateModal = action.payload;
        },
        setIsFirstTime: (state, action: PayloadAction<boolean>) => {
            state.isFirstTime = action.payload;
        },
        setAuthAction: (state, action: PayloadAction<AuthAction>) => {
            state.authAction = action.payload;
        },
        setSelectedCurrencySetting: (
            state,
            action: PayloadAction<SettingCurrencyType>,
        ) => {
            state.selectedCurrencySetting = action.payload;
        },
        setBaseCurrency: (
            state,
            action: PayloadAction<SettingCurrencyType>,
        ) => {
            state.baseCurrency = action.payload;
        },
        setIsModalShow: (state, action: PayloadAction<boolean>) => {
            state.isModalShow = action.payload;
        },
        setEnableFaceIdOrTouch: (state, action: PayloadAction<boolean>) => {
            state.enableFaceIdOrTouch = action.payload;
        },
        setIsPressActionNoti: (state, action: PayloadAction<boolean>) => {
            state.pressActionNoti = action.payload;
        },
        setShowCommonErrorModal: (state, action: PayloadAction<boolean>) => {
            state.showCommonErrorModal = action.payload;
        },
        resetPinCodeData: state => {
            state.maxPinCodeAttempts = 5;
            state.failedPinAttempts = 0;
            state.timeLock = undefined;
        },
        resetAppSlice: () => initialState,
        setShowModalConfirmTransaction: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.showModalConfirmTransaction = action.payload;
        },
        setShowModalProtocol: (state, action: PayloadAction<boolean>) => {
            state.showModalSelectProtocol = action.payload;
        },
        setUpdateBalance: (state, action: PayloadAction<boolean>) => {
            state.updateBalance = action.payload;
        },
        setHeightBottomTab: (state, action: PayloadAction<number>) => {
            state.heightBottomTab = action.payload;
        },
        setWebviewShowing: (state, action: PayloadAction<boolean>) => {
            state.webViewIsShowing = action.payload;
        },
        setMinFeeForJettonTransfer: (
            state,
            action: PayloadAction<number | undefined>,
        ) => {
            state.minFeeForJettonTransfer = action.payload;
        },
        setBlockJettonTransfer: (state, action: PayloadAction<boolean>) => {
            state.blockJettonTransfer = action.payload;
        },
        setBlockTonNftTransfer: (state, action: PayloadAction<boolean>) => {
            state.blockTonNftTransfer = action.payload;
        },
        setBlockTonTransfer: (state, action: PayloadAction<boolean>) => {
            state.blockTonTransfer = action.payload;
        },
        setBlockBitcoinTransfer: (state, action: PayloadAction<boolean>) => {
            state.blockBitcoinTransfer = action.payload;
        },
        setActionFailedNeedToContact: (
            state,
            action: PayloadAction<string>,
        ) => {
            state.actionFailedNeedToContact = action.payload;
        },
        setTonAdminBounce: (state, action: PayloadAction<boolean>) => {
            state.tonAdminBounce = action.payload;
        },
        setJettonAdminBounce: (state, action: PayloadAction<boolean>) => {
            state.jettonAdminBounce = action.payload;
        },
        setLockoutLocalAuthentication: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.isLockoutLocalAuthentication = action.payload;
        },
        setKeyboardHeight: (state, action: PayloadAction<number>) => {
            state.keyboardHeight = action.payload;
        },
        setSwapGuidingShow: (state, action: PayloadAction<boolean>) => {
            state.swapGuidingShow = action.payload;
        },
        setEnablePassword: (state, action: PayloadAction<boolean>) => {
            state.enablePassword = action.payload;
        },
    },
});

export const {
    setJettonAdminBounce,
    setTonAdminBounce,
    setTheme,
    changeLanguageType,
    setRequirePinCode,
    resetAppSlice,
    resetPinCodeData,
    setMaxPinCodeAttempts,
    setFailedPinAttempts,
    setTimeLock,
    setForceUpdate,
    setRemoteConfigAppVersion,
    setShowForceUpdateModal,
    setKeepSplash,
    setIsFirstTime,
    setAuthAction,
    setSelectedCurrencySetting,
    setBaseCurrency,
    setIsModalShow,
    setEnableFaceIdOrTouch,
    setShowModalConfirmTransaction,
    setIsPressActionNoti,
    setShowModalProtocol,
    setShowCommonErrorModal,
    setUpdateBalance,
    setHeightBottomTab,
    setWebviewShowing,
    setBlockJettonTransfer,
    setBlockTonNftTransfer,
    setBlockTonTransfer,
    setBlockBitcoinTransfer,
    setMinFeeForJettonTransfer,
    setActionFailedNeedToContact,
    setLockoutLocalAuthentication,
    setKeyboardHeight,
    setSwapGuidingShow,
    setEnablePassword,
} = appSlice.actions;

export const getKeyboardHeight = (state: RootState) =>
    state?.app?.keyboardHeight;
export const getAuthAction = (state: RootState) => state?.app?.authAction;
export const getIsFirstTime = (state: RootState) => state?.app?.isFirstTime;
export const getKeepSplash = (state: RootState) => state?.app?.keepSplash;
export const getShowForceUpdateModal = (state: RootState) =>
    state?.app?.showForceUpdateModal;
export const getRemoteConfigAppVersion = (state: RootState) =>
    state?.app?.remoteConfigAppVersion;
export const getForceUpdate = (state: RootState) => state?.app?.forceUpdate;
export const getTimeLock = (state: RootState) => state?.app?.timeLock;
export const getFailedPinAttempts = (state: RootState) =>
    state?.app?.failedPinAttempts;
export const getMaxPinCodeAttempts = (state: RootState) =>
    state?.app?.maxPinCodeAttempts;
export const getThemeMode = (state: RootState) => state?.app?.themeMode;
export const getLanguageType = (state: RootState) => state?.app?.languageType;
export const getRequirePinCode = (state: RootState) =>
    state?.app?.requirePinCode;
export const selectorSettingCurrency = (state: RootState) =>
    state?.app?.settingCurrency;
export const selectorSelectedCurrencySetting = (state: RootState) =>
    state?.app?.selectedCurrencySetting;
export const selectorIsModalShow = (state: RootState) =>
    state?.app?.isModalShow;
export const selectorEnableFaceIdOrTouch = (state: RootState) =>
    state?.app?.enableFaceIdOrTouch;
export const getCryptoCurrencyState = (state: RootState) =>
    state?.app?.cryptosCurrency;
export const getShowModalConfirmTransaction = (state: RootState) =>
    state?.app?.showModalConfirmTransaction;
export const selectorIspressActionNoti = (state: RootState) =>
    state?.app?.pressActionNoti;
export const getMinFeeForJettonTransfer = (state: RootState) =>
    state?.app?.minFeeForJettonTransfer;
export const getBlockJettonTransfer = (state: RootState) =>
    state?.app?.blockJettonTransfer;
export const getBlockTonNftTransfer = (state: RootState) =>
    state?.app?.blockTonNftTransfer;
export const getBlockTonTransfer = (state: RootState) =>
    state?.app?.blockTonTransfer;
export const getBlockBitcoinTransfer = (state: RootState) =>
    state?.app?.blockBitcoinTransfer;
export const getShowCommonErrorModal = (state: RootState) =>
    state?.app?.showCommonErrorModal;
export const getTonAdminBounce = (state: RootState) =>
    state?.app?.tonAdminBounce;
export const getJettonAdminBounce = (state: RootState) =>
    state?.app?.jettonAdminBounce;
export const getUpdateBalance = (state: RootState) => state?.app?.updateBalance;
export const getHeightBottomTab = (state: RootState) =>
    state?.app?.heightBottomTab;
export const getWebViewShowing = (state: RootState) =>
    state?.app?.webViewIsShowing;
export const getAppState = (state: RootState) => state?.app;
export const getStateActionFailedNeedToContact = (state: RootState) =>
    state.app.actionFailedNeedToContact;
export const getLockoutLocalAuthentication = (state: RootState) =>
    state.app.isLockoutLocalAuthentication;
export const getSwapGuidingShow = (state: RootState) =>
    state.app.swapGuidingShow;
export const getEnablePassword = (state: RootState) =>
    state.app.enablePassword;
const appPersistConfig = {
    key: ReduxKey.app,
    storage: AsyncStorage,
    blacklist: [
        'requirePinCode',
        'showForceUpdateModal',
        'forceUpdate',
        'remoteConfigAppVersion',
        'keepSplash',
        'pressActionNoti',
        'showCommonErrorModal',
        'webViewIsShowing',
        'enablePassword'
    ],
};

const appSliceReducer = persistReducer(appPersistConfig, appSlice.reducer);

export default appSliceReducer;
