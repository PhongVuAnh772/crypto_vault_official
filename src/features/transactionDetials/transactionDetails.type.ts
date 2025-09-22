import { AppThemeType } from 'src/core/type/ThemeType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';

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
