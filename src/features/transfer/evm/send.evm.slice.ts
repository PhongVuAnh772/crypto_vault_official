import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    SupportedNativeTokenWithProtocol,
    SupportedTokenItemWithProtocol,
} from 'src/core/redux/slice/customToken/addCustomToken.type';
import { RootState } from 'src/core/redux/store';
import MoralisService from 'src/core/services/Moralis';
import {
    APIResponseMoralis,
    GetWalletHistoryMoralisParamType,
} from 'src/core/services/Moralis/type';
import { EVMSendSlice } from './send.evm.type';

const initialState: EVMSendSlice = {
    currentToken: undefined,
    transactionHistoryLoading: false,
};

export const evmSendSlice = createSlice({
    name: 'evmSlice',
    initialState: initialState,
    reducers: {
        resetHomeSlice: () => initialState,
        handleChangeCurrentToken: (
            state,
            payload: PayloadAction<
                | SupportedTokenItemWithProtocol
                | SupportedNativeTokenWithProtocol
                | undefined
            >,
        ) => {
            state.currentToken = payload.payload;
        },
    },
    extraReducers: builder =>
        builder
            .addCase(getTransactionsHistoryEVM.pending, (state, action) => {
                state.transactionHistoryLoading = true;
            })
            .addCase(getTransactionsHistoryEVM.fulfilled, (state, action) => {
                state.transactionHistoryLoading = false;
            }),
});
export const getTransactionsHistoryEVM = createAsyncThunk(
    '/evmSlice/getWalletHistoryEVM',
    async (params: GetWalletHistoryMoralisParamType, { rejectWithValue }) => {
        const moralis = new MoralisService();
        const result = await moralis.getTransactionsHistory(
            params.walletAddress,
            params.data,
        );

        const { data = {} } = result || {};
        if ('message' in data) {
            return rejectWithValue(data);
        }
        return result.data as unknown as APIResponseMoralis;
    },
);

export const { handleChangeCurrentToken } = evmSendSlice.actions;
export const getEVMSendState = (state: RootState) => state.evmSend;
export const getTransactionsHistoryEVMState = (state: RootState) =>
    state.evmSend.walletHistory;

const evmSendSliceReducer = evmSendSlice.reducer;
export default evmSendSliceReducer;
