import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import persistReducer from 'redux-persist/es/persistReducer';
import ReduxKey from 'src/core/enum/ReduxKey';
import { getCurrentWalletAndProtocol } from 'src/core/redux/slice/customToken/addCustomToken.slice';
import { RootState } from 'src/core/redux/store';
import { StakingPool } from 'src/features/home/stake/types';
import { SaveStakingHistory, StakingStateType } from './staking.type';

const initialState: StakingStateType = {
    stakingPools: [],
    stakingHistory: {},
};

export const stakingReducer = createSlice({
    name: 'staking',
    initialState: initialState,
    reducers: {
        setStakingPools: (state, action: PayloadAction<StakingPool[]>) => {
            state.stakingPools = action.payload;
        },

        setSaveStakingHistory: (
            state,
            action: PayloadAction<SaveStakingHistory>,
        ) => {
            if (action.payload) {
                const { data, idAccount, walletAddressAndSlip0044 } =
                    action.payload;
                if (!state.stakingHistory[idAccount]) {
                    state.stakingHistory[idAccount] = {};
                }
                if (
                    !state.stakingHistory[idAccount][walletAddressAndSlip0044]
                ) {
                    state.stakingHistory[idAccount][walletAddressAndSlip0044] =
                        [];
                }
                const existingHistory =
                    state.stakingHistory[idAccount]?.[walletAddressAndSlip0044];
                existingHistory.unshift(data);
            }
        },
    },
});

export const { setStakingPools, setSaveStakingHistory } =
    stakingReducer.actions;

export const getStakingPools = (state: RootState) =>
    state?.staking?.stakingPools;

export const getStakingHistory = createSelector(
    [
        getCurrentWalletAndProtocol,
        (state: RootState) => state.staking.stakingHistory,
    ],
    (data, stakingHistory) => {
        if (!data) return [];
        const { currentProtocol, currentWallet, accountId } = data;
        if (!accountId) {
            return [];
        }
        return stakingHistory[accountId]?.[
            `${currentWallet.address}_${currentProtocol.slip0044}`
        ];
    },
);

const ProtocolListConfig = {
    key: ReduxKey.rezPoint,
    storage: AsyncStorage,
    blacklist: ['stakingPools', 'days'],
};

const rezPointReducer = persistReducer(
    ProtocolListConfig,
    stakingReducer.reducer,
);

export default rezPointReducer;
