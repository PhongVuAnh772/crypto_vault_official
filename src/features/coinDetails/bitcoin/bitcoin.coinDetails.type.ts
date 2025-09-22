import {
    IBitcoinDataRes,
    IBitcoinFullDataRes,
} from 'src/core/services/BitcoinServices/type';

export type BitcoinSliceType = {
    bitcoinData?: IBitcoinDataRes;
    bitcoinFullData?: IBitcoinFullDataRes;
    maxAmount?: number;
    isBitcoinDataLoading: boolean;
    isTransactionHistoryLoading: boolean;
    isBitcoinMaxAmountLoading: boolean;
    bitcoinTransactionData?: TransactionDataType;
    showModalConfirm: boolean;
    isLoadingPushTransaction: boolean;
    isPushTransactionFailure: boolean;
    networkFee?: NetworkFee;
    showDustError: boolean;
    reloadBitcoinData: boolean;
    pushBitcoinHashErrorExists: boolean;
    pushBitcoinHashErrorDust: boolean;
    pushBitcoinOtherError?: string;
    getTransactionDataLimitError?: boolean;
};

type NetworkFee = {
    low_fee_per_kb?: number;
    medium_fee_per_kb?: number;
    high_fee_per_kb?: number;
};

export type INetworkFeeRes = {
    low_fee_per_kb?: number;
    medium_fee_per_kb?: number;
    high_fee_per_kb?: number;
};

export type TransactionDataType = {
    base64EncodedTransaction: string;
    amountSend: number;
    fee: number;
    adminFee: number;
    adminPercent: number;
    toAddress: string;
    fromAddress: string;
    adminAddress: string;
};

export type ListFooterComponentBitcoinType = {
    showSeeMore: boolean;
    viewMoreHistory?: () => void;
};
