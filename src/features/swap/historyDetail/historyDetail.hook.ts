import { StackActions, useRoute } from '@react-navigation/native';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    HistoryViewDetailTransactionProps,
    HistoryViewDetailTransactionRouteProps,
} from './historyDetail.type';

const useHistoryDetailTransaction = ({ navigation }: RootNavigationType) => {
    const transactionData: HistoryViewDetailTransactionProps =
        useRoute<HistoryViewDetailTransactionRouteProps>().params;

    const handleClose = () => {
        if (transactionData.isComeFromConfirmation) {
            navigation.dispatch(StackActions.replace(HomeStackScreenKey.Swap));
        } else {
            navigation.goBack();
        }
    };
    return {
        handleClose,
        transactionData,
    };
};
export default useHistoryDetailTransaction;
