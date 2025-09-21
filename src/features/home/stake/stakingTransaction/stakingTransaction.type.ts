import {RouteProp} from '@react-navigation/native';
import {HomeStackScreenKey} from 'src/navigation/enum/NavigationKey';
import {HomeStackParamListType} from 'src/navigation/stacks/type/HomeStackParamListType';

type TransactionData = {
    title: string;
    value: string;
    value2?: string;
};
export type StakingTransactionViewProps = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.StakingTransaction
>;
export type StakingTransactionParams = {
    data1: TransactionData[];
    data2: TransactionData[];
    lockAmount: string;
    lockAmountCurrency: string;
};
