import {AppThemeType} from 'src/core/type/ThemeType';
import {TransactionHistoryDataType} from 'src/core/type/TransactionHistoryDataType';
import {NFTTonData} from '../NFTImport/NFTTonImport.type';

export type DefaultTransactionViewType = {
    transactionData: TransactionHistoryDataType;
    isSendNFT: boolean;
    convertTitle: ({
        amount,
        gasFee,
        isNetworkFee,
    }: {
        amount: number;
        gasFee?: boolean;
        isNetworkFee?: boolean;
    }) => string;
    amountSend: number;
    onViewOnScan: () => void;
    isSuccess: boolean;
    theme: AppThemeType;
    copyAction: () => void;
};

export type NFTTonSendDetailType = {
    txHash: string;
    fromAddress: string;
    toAddress: string;
    adminFee: string;
    networkFee: string;
    nftData: NFTTonData;
    total: number;
};
