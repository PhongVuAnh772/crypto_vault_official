import { StyleProp, ViewStyle } from "react-native";
import { TransactionHistoryDataType } from "src/core/type/TransactionHistoryDataType";

export type HistoryItemType = {
    onPressHistoryItem: (item: TransactionHistoryDataType) => void;
    item: TransactionHistoryDataType;
    containerStyle?: StyleProp<ViewStyle>;
    isBitcoin?: boolean;
    isJetton?: boolean;
};