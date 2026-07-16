import { RouteProp } from '@react-navigation/native';
import { SwapStatus } from 'src/core/services/ChangeNow/types';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';

type Row = {
    title: string;
    value: string;
    value2?: string;
};
export type HistoryViewDetailTransactionProps = {
    rows: Row[];
    status: SwapStatus;
    swapFrom: string;
    swapTo: string;
    isComeFromConfirmation?: boolean;
};
export type HistoryViewDetailTransactionRouteProps = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.TransactionHistorySwapDetail
>;
