import { RouteProp } from '@react-navigation/native';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';

export type paramsTransactions = {
    transactionData: TransactionHistoryDataType;
};
export type NFTConfirmationSendType = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.NFTConfirmationSend
>;
