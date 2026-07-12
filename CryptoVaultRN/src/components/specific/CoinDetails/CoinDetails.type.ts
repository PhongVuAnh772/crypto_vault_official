import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { TransactionType } from "src/core/enum/TransactionType";
import { HistorySectionDataType } from "src/core/type/HistorySectionDataType";
import { AppThemeType } from "src/core/type/ThemeType";
import { TransactionHistoryDataType } from "src/core/type/TransactionHistoryDataType";

export interface ChartPoint {
  timestamp: number; // Unix timestamp
  value: number; // price
}

export type CoinDetailsType = {
  coinGeckoId?: string;
  name?: string;
  networkName?: string;
  onBack?: () => void;
  icon: React.JSX.Element;
  isTransactionHistoryLoading: boolean;
  isCoinDetailsLoading?: boolean;
  onCloseTypeBottomSheet?: () => void;
  refreshing: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onShowTypeBottomSheet?: () => void;
  typeSelect?: TransactionType;
  changeTypeSelect?: (type: TransactionType) => void;
  balanceTitle: string;
  balanceCurrencyTitle: string;
  titleWithI18n?: string;
  titleScreen?: string;
  sendAction?: () => void;
  receiveAction?: () => void;
  sectionData?: HistorySectionDataType[];
  renderItem?: ({
    item,
    index,
    section,
  }: {
    item: TransactionHistoryDataType;
    index: number;
    section: HistorySectionDataType;
  }) => React.JSX.Element;
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  sectionSeparatorComponent?: React.ComponentType<any> | null;
  ListFooterComponent?:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ComponentType<any>
    | null;
  viewMoreHistory?: () => void;
  hideSendAction?: boolean;
  faucetAction?: () => void;
  refModalShowType?: React.RefObject<BottomSheetModalMethods>;
};

export type LoadingViewType = {
  viewMoreHistory?: () => void;
};
export type CoinHeaderType = {
  onSendPress: () => void;
  onReceivePress: () => void;
  headerTitle: string;
  logo: React.ReactNode;
  balanceTitle: string;
  balanceCurrencyTitle: string;
  onBackPress: () => void;
  theme: AppThemeType;
  data: HistorySectionDataType[];
  renderItem: (info: {
    item: TransactionHistoryDataType;
    index: number;
    section: HistorySectionDataType;
  }) => React.ReactElement;
  renderSectionHeader: (info: {
    section: HistorySectionDataType;
  }) => React.ReactElement;
  ItemSeparatorComponent?: React.ComponentType<any> | null;
  ListFooterComponent?:
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ComponentType<any>
    | null;
  onLoadMore?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
  viewMoreHistory?: () => void;
  ButtonActionView: React.ComponentType<any>;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  hideSendAction?: boolean;
};

export interface TokenBalanceCardProps {
  logo: any; // require(".../tether.png")
  name: string; // "Tether USD"
  change: number; // -0.03
  usdValue: string; // "$0.78"
  balance: string; // "0.77616 USDT"
}

export type ListButtonTokenTrackingProps = {
  onSendPress?: () => void;
  onReceivePress?: () => void;
  onSwapPress?: () => void;
  onBuyPress?: () => void;
  onFaucetPress?: () => void;
};
