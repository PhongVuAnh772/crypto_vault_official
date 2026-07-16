import { StyleProp, ViewStyle } from 'react-native';
import {
    TransactionStatusType,
    TransactionType,
} from 'src/core/enum/TransactionType';

export type HistoryItemComponentType = {
    onPress: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    transactionType: TransactionType;
    status: TransactionStatusType;
    amountTitle: string;
    address?: string;
    createdAt?: string;
    customTitle?: string;
    itemKey?: React.Key | null;
    logoUri?: string;
    isNFTReceiveTransfer?: boolean;
};
