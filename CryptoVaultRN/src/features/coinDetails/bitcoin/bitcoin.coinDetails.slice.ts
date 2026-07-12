import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import bitcoinConstants from 'src/core/constants/BitCoinConstants';
import EnvConfig from 'src/core/constants/EnvConfig';
import AppToastType from 'src/core/enum/AppToastType';
import ReduxKey from 'src/core/enum/ReduxKey';
import Slip0044 from 'src/core/enum/Slip0044';
import AppI18Next from 'src/core/locales';
import LanguageKey from 'src/core/locales/LanguageKey';
import NativeBitcoinModules from 'src/core/modules/BitcoinModules/NativeBitcoinModules';
import { sendGet } from 'src/core/network/requests';
import { getIsTestnet } from "src/core/redux/slice/app.selector";
import { RootState } from 'src/core/redux/store';
import BitcoinServices from 'src/core/services/BitcoinServices';
import {
    BitcoinErrorType,
    IBitcoinDataRes,
    IBitcoinFullDataRes,
    IBlockcypherErrorRes,
    IPushBitcoinTransaction,
    Itxrefs,
} from 'src/core/services/BitcoinServices/type';
import { handleServicesError } from 'src/core/services/ErrorHandleServices/errorHandleServices';
import { pushErrorEventToAnalytics } from 'src/core/services/FirebaseAnalytics';
import { ThirdPartyService } from 'src/core/services/FirebaseAnalytics/type';
import BitcoinUtils from 'src/core/utils/bitcoinUtils';
import Utils from 'src/core/utils/commonUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { updateCryptoBalance } from 'src/features/home/slice/home.slice';
import {
    BitcoinSliceType,
    INetworkFeeRes,
    TransactionDataType,
} from './bitcoin.coinDetails.type';

const initialState: BitcoinSliceType = {
    bitcoinData: undefined,
    bitcoinFullData: undefined,
    maxAmount: undefined,
    bitcoinTransactionData: undefined,
    networkFee: undefined,
    pushBitcoinOtherError: undefined,
    isBitcoinDataLoading: false,
    isTransactionHistoryLoading: true,
    isBitcoinMaxAmountLoading: false,
    showModalConfirm: false,
    isLoadingPushTransaction: false,
    isPushTransactionFailure: false,
    showDustError: false,
    reloadBitcoinData: false,
    pushBitcoinHashErrorExists: false,
    pushBitcoinHashErrorDust: false,
    getTransactionDataLimitError: false,
};

// MARK: Network Fee

export const getNetworkFee = createAsyncThunk(
  "/home/getNetworkFee",
    async (_, { getState, rejectWithValue }) => {
      try {
        const state = getState() as RootState;
        const isTestnet = getIsTestnet(state);
        const res = await fetch(`https://api.blockcypher.com/v1/btc/${isTestnet ? 'test3' : 'main'}`);
        const data = await res.json();

      return {
        high_fee_per_kb: data.high_fee_per_kb,
        medium_fee_per_kb: data.medium_fee_per_kb,
        low_fee_per_kb: data.low_fee_per_kb,
      };
    } catch (e) {
      return rejectWithValue(e);
    }
  },
);


// MARK: Bitcoin get data

export const getBitcoinData = createAsyncThunk(
    '/bitcoin/getBitcoinData',
    async (
        {
            bitcoinAddress,
            includeGetMaxAmount = true,
        }: { bitcoinAddress: string; includeGetMaxAmount?: boolean },
        { rejectWithValue, dispatch, getState },
    ) => {
        try {
            const state = getState() as RootState;
            const isTestnet = getIsTestnet(state);
            const bitcoinServices = new BitcoinServices();
            const getBitcoinDataRes =
                await bitcoinServices.getBitcoinData(bitcoinAddress, isTestnet);
            if (getBitcoinDataRes.isSuccess) {
                const data = getBitcoinDataRes.data as IBitcoinDataRes;
                if (includeGetMaxAmount) {
                    dispatch(
                        bitcoinGetMaxAmount({
                            currentBitcoinUTXO: data.txrefs,
                        }),
                    );
                }

                if (data.final_balance) {
                    dispatch(
                        updateCryptoBalance(
                            parseFloat(
                                BitcoinUtils.getBitcoinFromSatoshi(
                                    data.final_balance,
                                ),
                            ),
                        ),
                    );
                }
                return data;
            } else {
                const data = getBitcoinDataRes.data as IBlockcypherErrorRes;
                handleServicesError({
                    error: data.error + '',
                    thirdPartyName: ThirdPartyService.BlockCypher,
                });
                return rejectWithValue(data?.error);
            }
        } catch (error: any) {
            handleServicesError({
                error: error + '',
                thirdPartyName: ThirdPartyService.BlockCypher,
            });
            return rejectWithValue(error?.response);
        }
    },
);

// MARK: Bitcoin get full data for transaction history

export const getBitcoinFullData = createAsyncThunk(
    '/bitcoin/getBitcoinFullData',
    async (
        { bitcoinAddress }: { bitcoinAddress: string },
        { rejectWithValue, dispatch, getState },
    ) => {
        try {
            const state = getState() as RootState;
            const isTestnet = getIsTestnet(state);
            const bitcoinServices = new BitcoinServices();

            if (bitcoinAddress) {
                const getBitcoinDataRes =
                    await bitcoinServices.getBitcoinFullData(bitcoinAddress, isTestnet);

                if (getBitcoinDataRes.isSuccess) {
                    const data = getBitcoinDataRes.data as IBitcoinFullDataRes;
                    if (data.final_balance) {
                        dispatch(
                            updateCryptoBalance(
                                parseFloat(
                                    BitcoinUtils.getBitcoinFromSatoshi(
                                        data.final_balance,
                                    ),
                                ),
                            ),
                        );
                    }
                    return data;
                } else {
                    const data = getBitcoinDataRes.data as IBlockcypherErrorRes;
                    dispatch(setGetTransactionDataLimitError(true));
                    handleServicesError({
                        error: data.error + '',
                        thirdPartyName: ThirdPartyService.BlockCypher,
                    });
                    return rejectWithValue(data?.error);
                }
            } else {
                Utils.showToast({
                    msg: AppI18Next.t(LanguageKey.common_server_busy),
                    type: AppToastType.error,
                });
            }
        } catch (error: any) {
            pushErrorEventToAnalytics({
                error: error + '',
                thirdPartyName: ThirdPartyService.BlockCypher,
            });
            return rejectWithValue(error?.response);
        }
    },
);

// MARK: Bitcoin get max

export const bitcoinGetMaxAmount = createAsyncThunk(
    '/bitcoin/bitcoinGetMaxAmount',
    async (
        {
            currentBitcoinUTXO,
        }: {
            currentBitcoinUTXO?: Itxrefs[];
        },
        { getState, rejectWithValue },
    ) => {
        try {
            const bitcoinModule = new NativeBitcoinModules();
            const rootState = getState() as RootState;
            const accountState = rootState.account;
            const protocolListsWithSupportedTokensFromBE =
                accountState.protocolListsWithSupportedTokensFromBE;
            const bitcoinProtocolData =
                protocolListsWithSupportedTokensFromBE?.find(
                    e => e.slip0044 === Slip0044.Bitcoin,
                );
            const high_fee_per_kb =
                rootState.bitcoin.networkFee?.high_fee_per_kb;
            const bitcoinUTXO =
                rootState.bitcoin.bitcoinData?.txrefs ?? currentBitcoinUTXO;
            const balance = rootState.bitcoin.bitcoinData?.balance ?? 0;

            const utxoDataFormRN = BitcoinUtils.convertUtxoData(
                bitcoinUTXO ?? [],
            );

            if (utxoDataFormRN.length === 0) {
                return rejectWithValue('Empty data');
            }
            const byteFee = WalletUtils.getByteFeeFromFeePerKb(high_fee_per_kb);
            const adminPercent = bitcoinProtocolData?.coinTransferFee ?? 0;

            const adminFee =
                adminPercent === 0
                    ? 0
                    : BitcoinUtils.getAdminFee({
                          amountSend: balance,
                          adminPercent: adminPercent,
                          byteFee: byteFee,
                      });

            console.log('=============================================');
            console.log('BitcoinGetMaxAmount');
            console.log('Balance :', balance);
            console.log('Admin Percent :', adminPercent);
            console.log('Byte Fee :', byteFee);
            console.log('Admin Fee :', adminFee);
            console.log('spendSizeBytes :',bitcoinConstants.spendSizeBytes.P2PKH);
            
            console.log('=============================================');

            try {
                const maxAmount = await bitcoinModule.bitcoinGetMaxAmount({
                    byteFee,
                    utxoDataFormRN,
                    adminFee,
                    spendSizeBytes: bitcoinConstants.spendSizeBytes.P2PKH,
                });
                if (maxAmount && maxAmount < 0) {
                    return 0;
                }
                return maxAmount;
            } catch (error) {
                console.log('Get Bitcoin Max Amount catch error: ', error);
            }
        } catch (error: any) {
            return rejectWithValue(error?.response);
        }
    },
);

// MARK: Bitcoin transaction

export const createBitcoinTransaction = createAsyncThunk(
    '/bitcoin/createBitcoinTransaction',
    async (
        {
            fromAddress,
            toAddress,
            amountSend,
            adminPercent,
            adminAddress,
        }: {
            fromAddress: string;
            toAddress: string;
            amountSend: number;
            adminPercent: number;
            adminAddress: string;
        },
        { getState, rejectWithValue, dispatch },
    ) => {
        try {
            const bitcoinModule = new NativeBitcoinModules();
            const rootState = getState() as RootState;
            const selectAccountId = rootState.account.selectAccountId;
            const account = (rootState.account.accountLists ?? []).find(
                e => e.id === selectAccountId,
            );
            const mnemonic = account?.mnemonic ?? '';
            const high_fee_per_kb =
                rootState.bitcoin.networkFee?.high_fee_per_kb;

            const bitcoinUTXO = rootState.bitcoin.bitcoinData?.txrefs;

            const utxoDataFormRN = BitcoinUtils.convertUtxoData(
                bitcoinUTXO ?? [],
            );

            const byteFee = WalletUtils.getByteFeeFromFeePerKb(high_fee_per_kb);

            const adminFee =
                adminPercent === 0
                    ? 0
                    : BitcoinUtils.getAdminFee({
                          amountSend: amountSend,
                          adminPercent: adminPercent,
                          byteFee: byteFee,
                      });

            console.log('=============================================');
            console.log('CreateBitcoinTransaction');
            console.log('balance', amountSend);
            console.log('adminPercent', adminPercent);
            console.log('adminAddress', adminAddress);
            console.log('byteFee', byteFee);
            console.log('adminFee', adminFee);
            console.log('=============================================');

            try {
                const state = getState() as RootState;
                const isTestnet = getIsTestnet(state);
                const successCreateTransaction =
                    await bitcoinModule.bitcoinTransaction({
                        env: isTestnet ? 'development' : 'production',
                        mnemonic,
                        toAddress,
                        amountSend,
                        byteFee,
                        adminAddress: adminAddress,
                        adminFee,
                        utxoDataFormRN,
                        spendSizeBytes: bitcoinConstants.spendSizeBytes.P2PKH,
                    });
                if (successCreateTransaction) {
                    console.log(
                        'Transaction base64 encoded: ',
                        successCreateTransaction.base64EncodedTransaction,
                    );
                    console.log('Fee: ', successCreateTransaction.fee);

                    dispatch(
                        setBitcoinTransactionData({
                            amountSend: amountSend,
                            fee: successCreateTransaction.fee,
                            base64EncodedTransaction:
                                successCreateTransaction.base64EncodedTransaction,
                            adminPercent: adminPercent,
                            adminFee,
                            toAddress,
                            fromAddress: fromAddress ?? '',
                            adminAddress: adminAddress,
                        }),
                    );
                    dispatch(setShowModalConfirm(true));
                }
            } catch (error: any) {
                console.log('Bitcoin Transaction native error', typeof error);
                if (error as string) {
                    const newError = error as string;
                    if (newError?.toLocaleLowerCase()?.includes('dust')) {
                        dispatch(setShowDustError(true));
                    }
                }
                Utils.showToast({
                    msg: error,
                    type: AppToastType.error,
                });
                console.log('Bitcoin Transaction error', error);
            }
        } catch (error: any) {
            console.log('Bitcoin Transaction catch error', error);
            return rejectWithValue(error?.response);
        }
    },
);

// MARK: Push Bitcoin transaction

export const pushBitcoinTransactionAction = createAsyncThunk(
    '/bitcoin/pushBitcoinTransactionAction',
    async (
        { bitcoinAddress }: { bitcoinAddress: string },
        { getState, rejectWithValue, dispatch },
    ) => {
        try {
            const rootState = getState() as RootState;
            const bitcoinTransactionData =
                rootState.bitcoin.bitcoinTransactionData;

            const bitcoinServices = new BitcoinServices();

            const tx = bitcoinTransactionData?.base64EncodedTransaction;

            if (tx) {
                const state = getState() as RootState;
                const isTestnet = getIsTestnet(state);
                const pushBitcoinTransactionActionRes =
                    await bitcoinServices.pushBitcoinTransactionAction(
                        bitcoinTransactionData?.base64EncodedTransaction,
                        isTestnet
                    );
                if (pushBitcoinTransactionActionRes.isSuccess) {
                    const data =
                        pushBitcoinTransactionActionRes.data as IPushBitcoinTransaction;
                    dispatch(getBitcoinData({ bitcoinAddress }));
                    return data;
                } else {
                    const data =
                        pushBitcoinTransactionActionRes.data as BitcoinErrorType;
                    return rejectWithValue(data.error);
                }
            } else {
                return rejectWithValue(undefined);
            }
        } catch (error: any) {
            return rejectWithValue(error?.response);
        }
    },
);

export const bitcoinSlice = createSlice({
    name: 'bitcoinSlice',
    initialState: initialState,
    reducers: {
        setBitcoinTransactionData: (
            state,
            action: PayloadAction<TransactionDataType>,
        ) => {
            state.bitcoinTransactionData = action.payload;
        },
        setShowModalConfirm: (state, action: PayloadAction<boolean>) => {
            state.showModalConfirm = action.payload;
        },
        setMaxAmount: (state, action: PayloadAction<number>) => {
            state.maxAmount = action.payload;
        },
        setIsBitcoinMaxAmount: (state, action: PayloadAction<boolean>) => {
            state.isBitcoinMaxAmountLoading = action.payload;
        },
        setIsPushTransactionFailure: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.isPushTransactionFailure = action.payload;
        },
        setShowDustError: (state, action: PayloadAction<boolean>) => {
            state.showDustError = action.payload;
        },
        setReloadBitcoinData: (state, action: PayloadAction<boolean>) => {
            state.reloadBitcoinData = action.payload;
        },
        setGetTransactionDataLimitError: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.getTransactionDataLimitError = action.payload;
        },
        setIsTransactionHistoryLoading: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.isTransactionHistoryLoading = action.payload;
        },
        clearBitcoinTransactionData: state => {
            state.bitcoinData = undefined;
            state.bitcoinFullData = undefined;
        },
        resetBitcoinSlice: () => initialState,
    },
    extraReducers: builder => {
        builder
            .addCase(pushBitcoinTransactionAction.pending, state => {
                state.isLoadingPushTransaction = true;
            })
            .addCase(pushBitcoinTransactionAction.fulfilled, state => {
                state.showModalConfirm = false;
                state.isLoadingPushTransaction = false;
                state.reloadBitcoinData = true;
            })
            .addCase(pushBitcoinTransactionAction.rejected, (state, action) => {
                const errorString = action.payload as string;
                if (Utils.isString(errorString) && errorString !== '') {
                    const checkErrorExistsResult =
                        BitcoinUtils.checkPushExistErrorAndGetHash(errorString);
                    if (checkErrorExistsResult) {
                        state.pushBitcoinHashErrorExists = true;
                        state.pushBitcoinOtherError = checkErrorExistsResult;
                    } else {
                        const checkErrorDust =
                            BitcoinUtils.checkPushDustErrorAndGetHash(
                                errorString,
                            );
                        if (checkErrorDust) {
                            state.pushBitcoinHashErrorDust = true;
                            state.pushBitcoinOtherError = checkErrorDust;
                        } else {
                            state.pushBitcoinOtherError = errorString;
                        }
                    }
                }
                state.isPushTransactionFailure = true;
                state.isLoadingPushTransaction = false;
            })
            .addCase(bitcoinGetMaxAmount.fulfilled, (state, action) => {
                state.isBitcoinMaxAmountLoading = false;
                state.maxAmount = action.payload;
            })
            .addCase(bitcoinGetMaxAmount.rejected, state => {
                state.isBitcoinMaxAmountLoading = false;
                state.maxAmount = 0;
            })
            .addCase(getBitcoinFullData.pending, (state, _) => {
                state.isTransactionHistoryLoading = true;
                state.getTransactionDataLimitError = false;
            })
            .addCase(getBitcoinFullData.fulfilled, (state, action) => {
                const payload = action.payload;
                state.isTransactionHistoryLoading = false;
                state.bitcoinFullData = payload;
            })
            .addCase(getBitcoinFullData.rejected, state => {
                state.isTransactionHistoryLoading = false;
            })
            .addCase(getBitcoinData.pending, (state, _) => {
                state.isBitcoinMaxAmountLoading = true;
                state.isBitcoinDataLoading = true;
            })
            .addCase(getBitcoinData.fulfilled, (state, action) => {
                const payload = action.payload;
                state.isBitcoinDataLoading = false;
                state.bitcoinData = payload;
            })
            .addCase(getBitcoinData.rejected, state => {
                state.isBitcoinDataLoading = false;
            })
            .addCase(getNetworkFee.fulfilled, (state, action) => {
                const payload = action.payload;
                state.networkFee = {
                    low_fee_per_kb: payload?.medium_fee_per_kb,
                    medium_fee_per_kb: payload?.medium_fee_per_kb,
                    high_fee_per_kb: payload?.high_fee_per_kb,
                };
            });
    },
});

export const selectorIsTransactionHistoryLoading = (state: RootState) =>
    state.bitcoin.isTransactionHistoryLoading;
export const selectorBitcoinFullData = (state: RootState) =>
    state.bitcoin.bitcoinFullData;
export const selectorBitcoinFullDataTxs = (state: RootState) =>
    state.bitcoin.bitcoinFullData?.txs;
export const selectorIsLoadingPushTransaction = (state: RootState) =>
    state.bitcoin.isLoadingPushTransaction;
export const selectorShowModalConfirm = (state: RootState) =>
    state.bitcoin.showModalConfirm;
export const selectorBitcoinTransactionData = (state: RootState) =>
    state.bitcoin.bitcoinTransactionData;
export const selectorIsBitcoinMaxAmountLoading = (state: RootState) =>
    state.bitcoin.isBitcoinMaxAmountLoading;
export const selectorIsBitcoinDataLoading = (state: RootState) =>
    state.bitcoin.isBitcoinDataLoading;
export const selectorMaxAmount = (state: RootState) => state.bitcoin.maxAmount;
export const selectorBitcoinData = (state: RootState) => {
    return state.bitcoin.bitcoinData;
};
export const getBTCAddress = (state: RootState) =>
    state.bitcoin.bitcoinData?.address;
export const getBTCBalance = (state: RootState) =>
    state.bitcoin.bitcoinData?.balance;
export const getBTCFinalBalance = (state: RootState) =>
    state.bitcoin.bitcoinData?.final_balance;
export const getBTCUnconfirmedBalance = (state: RootState) =>
    state.bitcoin.bitcoinData?.unconfirmed_balance;
export const getBitcoinUTXO = (state: RootState) => {
    return state.bitcoin.bitcoinData?.txrefs;
};
export const getUnconfirmedUTXO = (state: RootState) => {
    return state.bitcoin.bitcoinData?.unconfirmed_txrefs;
};
export const getIsPushTransactionFailure = (state: RootState) => {
    return state.bitcoin.isPushTransactionFailure;
};
export const selectorShowDustError = (state: RootState) => {
    return state.bitcoin.showDustError;
};
export const selectorReloadBitcoinData = (state: RootState) => {
    return state.bitcoin.reloadBitcoinData;
};
export const selectorPushBitcoinHashErrorExists = (state: RootState) => {
    return state.bitcoin.pushBitcoinHashErrorExists;
};
export const selectorPushBitcoinHashErrorDust = (state: RootState) => {
    return state.bitcoin.pushBitcoinHashErrorDust;
};
export const selectorPushBitcoinOtherError = (state: RootState) => {
    return state.bitcoin.pushBitcoinOtherError;
};
export const selectorGetTransactionDataLimitError = (state: RootState) => {
    return state.bitcoin.getTransactionDataLimitError;
};

export const {
    setBitcoinTransactionData,
    setShowModalConfirm,
    resetBitcoinSlice,
    setIsBitcoinMaxAmount,
    setMaxAmount,
    setIsPushTransactionFailure,
    setShowDustError,
    setReloadBitcoinData,
    setGetTransactionDataLimitError,
    clearBitcoinTransactionData,
    setIsTransactionHistoryLoading,
} = bitcoinSlice.actions;

const bitcoinPersistConfig = {
    key: ReduxKey.bitcoin,
    storage: AsyncStorage,
    blacklist: [
        'showDustError',
        'showModalConfirm',
        'isPushTransactionFailure',
        'pushBitcoinHashErrorExists',
        'pushBitcoinHashErrorDust',
        'pushBitcoinOtherError',
        'bitcoinData',
        'bitcoinFullData',
        'isTransactionHistoryLoading',
    ],
};

const bitcoinSliceReducer = persistReducer(
    bitcoinPersistConfig,
    bitcoinSlice.reducer,
);

export default bitcoinSliceReducer;
