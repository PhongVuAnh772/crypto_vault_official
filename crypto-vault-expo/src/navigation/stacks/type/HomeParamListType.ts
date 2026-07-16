import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';

export type HomeParamListType = {
    reShowWalletModal: boolean;
};
export type TransactionDetailsProps = {
    transactionData: TransactionHistoryDataType;
    rateCurrency?: number;
    blockExplorerUrl?: string;
};
