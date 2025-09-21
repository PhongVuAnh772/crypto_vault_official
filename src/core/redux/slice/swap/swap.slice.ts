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

export const getListPairAvailableThunk = createAsyncThunk(
    'swap/getListPairAvailable',
    async (networks: string[], { rejectWithValue }) => {
        try {
            const result = await sendGet<CurrencyChangeNow[] | ErrorFromBEType>(
                {
                    endPoint: '/mobile/request-changenow/supported-tokens',
                    params: {
                        networks: networks.join(','),
                    },
                },
            );

            if (result.status !== 200) {
                return rejectWithValue(result.data);
            }

            return result.data as unknown as CurrencyChangeNow[];
        } catch (error) {
            console.log('🚀  getListPairAvailableThunk ~ error:', error);
            return rejectWithValue(error);
        }
    },
);

export const getImagePairThunk = createAsyncThunk(
    'swap/getImagePairThunk',
    async (_, { rejectWithValue }) => {
        try {
            const result = await sendGet<
                typeof initialState.images | ErrorFromBEType
            >({
                endPoint: '/mobile/request-changenow/image',
            });

            if (result.status !== 200) {
                return rejectWithValue(result.data);
            }

            return result.data as unknown as typeof initialState.images;
        } catch (error) {
            console.log('🚀 ~ error:', error);
            return rejectWithValue(error);
        }
    },
);
export const getIsShowSwapFromBE = createAsyncThunk(
    'swap/getIsShow',
    async (_, { rejectWithValue }) => {
        try {
            const result = await sendGet<boolean | ErrorFromBEType>({
                endPoint: '/mobile/master-data',
            });

            if (result.status !== 200) {
                return rejectWithValue(result.data);
            }
            return result.data as unknown as boolean;
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
