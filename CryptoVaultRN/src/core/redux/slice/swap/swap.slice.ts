import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { sendGet } from 'src/core/network/requests';
import { CurrencyChangeNow } from 'src/core/services/ChangeNow/types';
import { ErrorFromBEType } from 'src/core/services/ErrorHandler/error.type';
import { RootState } from '../../store';
import { SwapSlice } from './swap.type';

const initialState: SwapSlice = {
    images: {},
    listPairAvailable: [],
    pinCode: '',
    isShowPinCode: false,
    isShowFunction: false,
};

export const swapReducer = createSlice({
    name: 'swap',
    initialState: initialState,
    reducers: {
        setPinCodeForSwap: (state, action: PayloadAction<string>) => {
            state.pinCode = action.payload;
        },
        setShowPinCodeForAuthSwap: (state, action: PayloadAction<boolean>) => {
            state.isShowPinCode = action.payload;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(getListPairAvailableThunk.fulfilled, (state, action) => {
                const data = action.payload;
                state.listPairAvailable = data;
            })
            .addCase(getImagePairThunk.fulfilled, (state, action) => {
                const data = action.payload;
                state.images = data;
            })
            .addCase(getIsShowSwapFromBE.fulfilled, (state, action) => {
                const data = action.payload;
                state.isShowFunction = data;
            });
    },
});

export const { setPinCodeForSwap, setShowPinCodeForAuthSwap } =
    swapReducer.actions;

export const getListPairAvailableThunk = createAsyncThunk<
  CurrencyChangeNow[], // fulfilled payload
  string[], // argument
  { rejectValue: any }
>("swap/getListPairAvailable", async (networks, { rejectWithValue }) => {
  try {
    const result = await sendGet<CurrencyChangeNow[]>({
      endPoint: "https://api.changenow.io/v2/exchange/currencies",
      params: {
        active: true,
        network: networks.join(","),
      },
    });

    if (result.status !== 200 || !result.data) {
      return rejectWithValue(result);
    }

    // ✅ luôn return CurrencyChangeNow[]
    return result.data;
  } catch (error) {
    // ✅ catch BẮT BUỘC return
    return rejectWithValue(error);
  }
});

type ImagesMap = Record<string, string>;

type ChangeNowCurrency = {
  ticker: string;
  image?: string;
};


export const getImagePairThunk = createAsyncThunk<
  ImagesMap, // fulfilled payload
  void,
  { rejectValue: unknown }
>("swap/getImagePairThunk", async (_, { rejectWithValue }) => {
  try {
    const result = await sendGet<ChangeNowCurrency[]>({
      endPoint: "https://api.changenow.io/v2/exchange/currencies",
      params: {
        active: true,
      },
    });

    if (result.status !== 200 || !result.data) {
      return rejectWithValue(result);
    }

    // ✅ build images map
    const images: ImagesMap = {};

    result.data.forEach((item) => {
      if (item.ticker && item.image) {
        images[item.ticker.toLowerCase()] = item.image;
      }
    });

    return images;
  } catch (error) {
    console.log("🚀 getImagePairThunk error:", error);
    return rejectWithValue(error);
  }
});
export const getIsShowSwapFromBE = createAsyncThunk(
    'swap/getIsShow',
    async (_, { rejectWithValue }) => {
        try {
           
            return true;
        } catch (error) {
            console.log('🚀 ~ error:', error);
            return rejectWithValue(error);
        }
    },
);
export const getListPairAvailable = (state: RootState) =>
    state?.swap?.listPairAvailable;
export const getImagesPair = (state: RootState) => state?.swap?.images;
export const getIsShowPinCode = (state: RootState) =>
    state?.swap?.isShowPinCode;
export const getPinCodeForSwap = (state: RootState) => state?.swap?.pinCode;
export const getIsShowSwap = (state: RootState) => state?.swap?.isShowFunction;

const rezPointReducer = swapReducer.reducer;

export default rezPointReducer;
