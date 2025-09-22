import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Address } from '@ton/core';
import { persistReducer } from 'redux-persist';
import ReduxKey from 'src/core/enum/ReduxKey';
import TonEventType from 'src/core/enum/TonEventType';
import { sendGet } from 'src/core/network/requests';
import { AddressListItemType } from 'src/core/redux/slice/account.type';
import { RootState } from 'src/core/redux/store';
import { handleServicesError } from 'src/core/services/ErrorHandleServices/errorHandleServices';
import { ThirdPartyService } from 'src/core/services/FirebaseAnalytics/type';
import TonServices from 'src/core/services/TonServices';
import {
    GetTonTransactionsErrorType,
    JettonBalanceDataType,
    TonAccountsType,
    TonEvent,
    TonEventsDataType,
} from 'src/core/services/TonServices/type';
import Utils from 'src/core/utils/commonUtils';
import TonUtils from 'src/core/utils/tonUtils';
import { updateCryptoBalance } from 'src/features/home/slice/home.slice';
import { ErrorResponse } from 'src/features/home/slice/types';
import {
    GetTonEventsParams,
    PriceRedXResponse,
    TonSliceType,
} from './ton.coinDetails.type';

const initialState: TonSliceType = {
    balance: 0,
    isTonDataLoading: false,
    isJettonDataLoading: false,
    tonEvents: undefined,
    beforeLt: undefined,
    isGetEventsLoading: true,
    maxTonEventList: false,
    getEventsErrorLimit: false,
    jettonData: undefined,
};

// MARK: TON get data

export const getTonData = createAsyncThunk(
    '/ton/getTonData',
    async (
        {
            tonAddressData,
            decimal,
        }: {
            tonAddressData: AddressListItemType | undefined;
            decimal?: number;
        },
        { rejectWithValue, dispatch },
    ) => {
        try {
            if (tonAddressData) {
                const tonServices = new TonServices();
                const getTonDataRes = await tonServices.getAccounts({
                    address: Address.parse(tonAddressData.address),
                });
                if (getTonDataRes.isSuccess) {
                    const balance = parseFloat(
                        (
                            getTonDataRes.data as TonAccountsType
                        )?.balance.toString() ?? '0',
                    );
                    const tonBalance = TonUtils.formatBigNumber(
                        balance.toString(),
                        decimal,
                    );
                    const convertBalance =
                        Utils.truncateToSixDecimals(tonBalance);
                    dispatch(updateCryptoBalance(convertBalance));
                    return tonBalance;
                } else {
                    return rejectWithValue(undefined);
                }
            } else {
                return rejectWithValue(undefined);
            }
        } catch (error: any) {
            return rejectWithValue(error?.response);
        }
    },
);

// MARK: Get jetton

export const getJettons = createAsyncThunk(
    '/ton/getJettons',
    async (
        tonAddressData: AddressListItemType | undefined,
        { rejectWithValue },
    ) => {
        try {
            if (!tonAddressData) return rejectWithValue(undefined);

            const tonService = new TonServices();

            const jettonData = await tonService.getJettons({
                // address: 'UQAwr-aWE2fUrnqQyatWsHro9jRqsFFsgsY7SYOq_ZzA_z4V', // 75 Token
                // address: '0QBP1KmCTsjYfwPT0P7NwbUCqrcvkkIBLm7LZaOkYepQXta0',
                address: tonAddressData?.address,
            });
            const jettonDataRes = jettonData as JettonBalanceDataType;
            if (jettonDataRes?.balances) {
                return jettonDataRes;
            }
            return rejectWithValue(undefined);
        } catch (error) {
            return rejectWithValue(error);
        }
    },
);

// MARK: TON get events

export const getTonEvents = createAsyncThunk(
    '/ton/getTonEvents',
    async (
        {
            tonAddressData,
            isRefreshAction = false,
            currentBeforeLt,
            isJetton = false,
            jettonId,
            isAllEvents = false,
        }: GetTonEventsParams,
        { rejectWithValue, getState, dispatch },
    ) => {
        try {
            dispatch(setIsGetEventsLoading(true));
            const rootState = getState() as RootState;
            const tonState = rootState.ton;
            const maxTonEventList = tonState.maxTonEventList;
            const getEventsErrorLimit = tonState.getEventsErrorLimit;
            let tonEvents: TonEvent[] | undefined = [
                ...(tonState.tonEvents ?? []),
            ];
            let beforeLt = currentBeforeLt ?? tonState.beforeLt;
            if (isRefreshAction) {
                dispatch(setBeforeLt(undefined));
                dispatch(setTonEvents(undefined));
                beforeLt = undefined;
                tonEvents = [];
            }
            if (
                beforeLt === 0 ||
                tonEvents?.length > 50 ||
                (isJetton && tonEvents.length <= 100 && tonEvents.length > 0)
            ) {
                if (!maxTonEventList) {
                    dispatch(setMaxTonEventList(true));
                }
                console.log('Event list end or max size');
                dispatch(setIsGetEventsLoading(false));
                return rejectWithValue(undefined);
            }
            if (!tonAddressData) return rejectWithValue(undefined);
            const tonService = new TonServices();

            let event:
                | TonEventsDataType
                | GetTonTransactionsErrorType
                | undefined;
            if (isJetton) {
                if (jettonId) {
                    event = await tonService.getJettonEvents({
                        // address: 'UQAwr-aWE2fUrnqQyatWsHro9jRqsFFsgsY7SYOq_ZzA_z4V', // 75 Token
                        // address: '0QBP1KmCTsjYfwPT0P7NwbUCqrcvkkIBLm7LZaOkYepQXta0',
                        address: tonAddressData?.address,
                        jettonId: jettonId,
                        beforeLt: beforeLt,
                    });
                }
            } else {
                event = await tonService.getEvents({
                    // address: 'UQAwr-aWE2fUrnqQyatWsHro9jRqsFFsgsY7SYOq_ZzA_z4V', // 75 Token
                    // address: '0QBP1KmCTsjYfwPT0P7NwbUCqrcvkkIBLm7LZaOkYepQXta0',
                    address: tonAddressData?.address,
                    beforeLt: beforeLt,
                });
            }

            if (!event) {
                dispatch(setIsGetEventsLoading(false));
                return rejectWithValue(undefined);
            }
            const currentTonEventsData = event as TonEventsDataType;
            if (!currentTonEventsData?.events) {
                const currentTonEventsDataError =
                    event as GetTonTransactionsErrorType;
                if (currentTonEventsDataError.error) {
                    if (!getEventsErrorLimit) {
                        dispatch(setGetEventsErrorLimit(true));
                    }
                    handleServicesError({
                        error: currentTonEventsDataError.error + '',
                        thirdPartyName: ThirdPartyService.Ton,
                    });
                }
                dispatch(setIsGetEventsLoading(false));
                return rejectWithValue(undefined);
            }
            if (isJetton) {
                tonEvents = [...currentTonEventsData.events];
            } else if (isAllEvents) {
                tonEvents = [...currentTonEventsData.events];
            } else {
                currentTonEventsData.events?.forEach(e => {
                    const isTonTransfer = e?.actions.every(
                        item => item.type === TonEventType.TonTransfer,
                    );
                    if (isTonTransfer) {
                        (tonEvents ?? []).push(e);
                    }
                });
            }
            const finalEventData: TonEventsDataType = {
                events: tonEvents,
                next_from: currentTonEventsData?.next_from,
            };
            if (tonEvents.length < 10 && beforeLt === undefined && !isJetton) {
                dispatch(
                    getTonEvents({
                        tonAddressData,
                        currentBeforeLt: currentTonEventsData.next_from,
                    }),
                );
            } else {
                dispatch(setIsGetEventsLoading(false));
            }
            return finalEventData;
        } catch (error: any) {
            console.log('getTonEvents error', error);
            dispatch(setIsGetEventsLoading(false));
            return rejectWithValue(error?.response);
        }
    },
);

export const getRedXPrice = createAsyncThunk(
    '/ton/getRedXPrice',
    async (_, { rejectWithValue }) => {
        try {
            const redxPriceResponse = await sendGet<
                PriceRedXResponse | ErrorResponse
            >({
                endPoint: '/mobile/tokens/get-redx-price',
            });
            if (redxPriceResponse.status !== 200) {
                return rejectWithValue(undefined);
            }
            return redxPriceResponse.data as PriceRedXResponse;
        } catch (error) {
            return rejectWithValue(error);
        }
    },
);

export const tonSlice = createSlice({
    name: 'tonSlice',
    initialState: initialState,
    reducers: {
        setBeforeLt: (state, action: PayloadAction<number | undefined>) => {
            state.beforeLt = action.payload;
        },
        setTonEvents: (
            state,
            action: PayloadAction<TonEvent[] | undefined>,
        ) => {
            state.tonEvents = action.payload;
        },
        setIsGetEventsLoading: (state, action: PayloadAction<boolean>) => {
            state.isGetEventsLoading = action.payload;
        },
        setMaxTonEventList: (state, action: PayloadAction<boolean>) => {
            state.maxTonEventList = action.payload;
        },
        setGetEventsErrorLimit: (state, action: PayloadAction<boolean>) => {
            state.getEventsErrorLimit = action.payload;
        },
        resetTonSlice: () => initialState,
    },
    extraReducers: builder => {
        builder
            .addCase(getTonEvents.pending, (state, action) => {
                state.maxTonEventList = false;
                state.getEventsErrorLimit = false;
            })
            .addCase(getTonEvents.fulfilled, (state, action) => {
                const payload = action.payload;
                state.beforeLt = payload?.next_from;
                state.tonEvents = payload?.events;
            })
            .addCase(getTonData.pending, state => {
                state.isTonDataLoading = true;
            })
            .addCase(getTonData.rejected, state => {
                state.isTonDataLoading = false;
            })
            .addCase(getTonData.fulfilled, (state, action) => {
                const payload = action.payload;
                state.balance = payload;
                state.isTonDataLoading = false;
            })
            .addCase(getJettons.pending, state => {
                state.isJettonDataLoading = true;
            })
            .addCase(getJettons.rejected, state => {
                state.isJettonDataLoading = false;
            })
            .addCase(getJettons.fulfilled, (state, action) => {
                state.jettonData = action.payload;
                state.isJettonDataLoading = false;
            });
    },
});

export const selectorTonEvents = (state: RootState) => state?.ton?.tonEvents;
export const selectorIsGetEventsLoading = (state: RootState) =>
    state?.ton?.isGetEventsLoading;
export const selectorTonDataLoading = (state: RootState) =>
    state?.ton?.isTonDataLoading;
export const selectorJettonDataLoading = (state: RootState) =>
    state?.ton?.isJettonDataLoading;
export const selectorTonBalance = (state: RootState) => state?.ton?.balance;
export const selectorMaxTonEventList = (state: RootState) =>
    state?.ton?.maxTonEventList;
export const selectorGetEventsErrorLimit = (state: RootState) =>
    state?.ton?.getEventsErrorLimit;
export const selectorBeforeLt = (state: RootState) => state?.ton?.beforeLt;
export const selectorJettonData = (state: RootState) => state?.ton?.jettonData;

export const {
    resetTonSlice,
    setBeforeLt,
    setTonEvents,
    setIsGetEventsLoading,
    setMaxTonEventList,
    setGetEventsErrorLimit,
} = tonSlice.actions;

const TonConfig = {
    key: ReduxKey.ton,
    storage: AsyncStorage,
    blacklist: [
        'beforeLt',
        'isGetEventsLoading',
        'isJettonDataLoading',
        'tonEvents',
        'maxTonEventList',
        'jettonData',
    ],
};

const tonSliceReducer = persistReducer(TonConfig, tonSlice.reducer);

export default tonSliceReducer;
