import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import ReduxKey from 'src/core/enum/ReduxKey';
import SelectTokenAction from 'src/core/enum/SelectTokenAction';
import { RootState } from 'src/core/redux/store';
import MoralisService from 'src/core/services/Moralis';
import { GetPriceTokenParams } from 'src/core/services/Moralis/type';
import { compareAddressesEVM } from 'src/core/utils/evmUtils';
import { ListCryptoDataType } from '../home.type';
import {
    GetBalanceNativeParamsThunk,
    GetBalanceTokenParamsThunk,
    HomeSliceType,
} from './types';

const initialState: HomeSliceType = {
    listCryptoData: [],
};

export const updateCryptoBalance = createAsyncThunk(
    'home/updateCryptoBalance',
    async (newBalance: number, { getState }) => {
        const state = getState() as RootState;
        const currentList = state.home.listCryptoData;
        const selectedCryptoId = state.home.selectedCryptoDataId;

        const selectedCrypto = currentList.find(e => e.id === selectedCryptoId);

        if (!selectedCrypto || selectedCrypto.balance === newBalance) {
            return null;
        }

        const isNative = selectedCrypto.isNative;

        const updatedList = currentList.map(item =>
            item.id === selectedCrypto.id
                ? {
                      ...item,
                      balance: isNative ? newBalance : item.balance,
                      balanceToken: isNative ? item.balanceToken : newBalance,
                  }
                : item,
        );

        return {
            updatedList,
            updatedSelectedCrypto: { ...selectedCrypto, balance: newBalance },
        };
    },
);

export const getBalanceTokensEVM = createAsyncThunk(
    'home/getBalanceTokensEVM',
    async (
        { walletAddress, params }: GetBalanceTokenParamsThunk,
        { rejectWithValue },
    ) => {
        const moralis = new MoralisService();
        const response = await moralis.getBalanceTokens(walletAddress, params);

        if (response.status !== 200) {
            return rejectWithValue(response.data);
        }
        return response.data;
    },
);

export const getPriceTokenEVM = createAsyncThunk(
    'home/getPriceTokenEVM',
    async (params: GetPriceTokenParams, { rejectWithValue }) => {
        const moralis = new MoralisService();
        const response = await moralis.getPriceToken(params);

        if (response.status !== 200) {
            return rejectWithValue(response.data);
        }
        return response.data;
    },
);

export const getBalanceNativeEVM = createAsyncThunk(
  "home/getBalanceNativeEVM",
  async (
    { walletAddress, params }: GetBalanceNativeParamsThunk,
    { rejectWithValue }
  ) => {
    try {
      const moralis = new MoralisService();
      const response = await moralis.getNativeBalance(walletAddress, params);
    
      if (response.status !== 200 || !response.data) {

        return rejectWithValue(response.data);
      }
      if (!("balance" in response.data)) {
        return rejectWithValue(response.data);
      }
      console.log(`response.data.balance ${response.data.balance}`);
      return {
        balance: response.data.balance, // string
      };
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);


export const homeSlice = createSlice({
    name: 'homeSlice',
    initialState: initialState,
    reducers: {
        setSelectTokenAction: (
            state,
            action: PayloadAction<SelectTokenAction>,
        ) => {
            state.selectTokenAction = action.payload;
        },
        setListCryptoDataSyn: (
            state,
            action: PayloadAction<ListCryptoDataType[]>,
        ) => {
            const newList = action.payload;
            const oldList = state.listCryptoData;
            const currentSelectedCryptoId = state.selectedCryptoDataId;
            const currentCryptoData = oldList.find(
                e => e.id === currentSelectedCryptoId,
            );
            const newSelectedCryptoData = newList.find(
                e =>
                    e.name === currentCryptoData?.name &&
                    e.symbol === currentCryptoData?.symbol &&
                    e.decimal === currentCryptoData?.decimal,
            );
            if (newSelectedCryptoData) {
                state.selectedCryptoDataId = newSelectedCryptoData?.id;
            }
            state.listCryptoData = newList;
        },
        setSelectedCryptoDataId: (state, action: PayloadAction<string>) => {
            state.selectedCryptoDataId = action.payload;
        },
        resetHomeSlice: () => initialState,
    },
    extraReducers: builder => {
        builder.addCase(updateCryptoBalance.fulfilled, (state, action) => {
            if (action.payload) {
                state.listCryptoData = action.payload.updatedList;
                state.selectedCryptoDataId =
                    action.payload.updatedSelectedCrypto.id;
            }
        });
    },
});

export const {
    resetHomeSlice,
    setSelectTokenAction,
    setListCryptoDataSyn,
    setSelectedCryptoDataId,
} = homeSlice.actions;

export const selectorSelectedCryptoDataId = (state: RootState) =>
    state?.home?.selectedCryptoDataId;
export const selectorListCryptoData = (state: RootState) =>
    state?.home?.listCryptoData;
export const selectorSelectTokenAction = (state: RootState) =>
    state?.home?.selectTokenAction;
export const getHomeState = (state: RootState) => state.home;

const HomeConfig = {
    key: ReduxKey.home,
    storage: AsyncStorage,
    blacklist: ['selectTokenAction', 'setSelectedCryptoDataId'],
};

const homeSliceReducer = persistReducer(HomeConfig, homeSlice.reducer);

export default homeSliceReducer;
