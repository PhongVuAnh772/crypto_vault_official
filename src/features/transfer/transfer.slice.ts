import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import ReduxKey from 'src/core/enum/ReduxKey';
import Slip0044 from 'src/core/enum/Slip0044';
import { RootState } from 'src/core/redux/store';
import { TransferSliceType } from './transfer.type';

const initialState: TransferSliceType = {};

export const transferSlice = createSlice({
    name: 'transferSlice',
    initialState: initialState,
    reducers: {
        setTransferSlip0044: (state, action: PayloadAction<Slip0044>) => {
            state.transferSlip0044 = action.payload;
        },
        resetTransferSlice: () => initialState,
    },
});

export const { resetTransferSlice, setTransferSlip0044 } =
    transferSlice.actions;

export const getTransferSlip0044 = (state: RootState) =>
    state?.transferSlice.transferSlip0044;

const TransferConfig = {
    key: ReduxKey.transferSlice,
    storage: AsyncStorage,
    blacklist: ['transferSlip0044'],
};

const transferSliceReducer = persistReducer(
    TransferConfig,
    transferSlice.reducer,
);

export default transferSliceReducer;
