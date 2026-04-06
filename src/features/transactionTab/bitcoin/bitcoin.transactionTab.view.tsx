import { t } from "i18next";
import React from "react";
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HistoryItemComponent from "src/components/specific/HistoryItemComponent/HistoryItemComponent.view";
import { TransactionStatusType, TransactionType } from "src/core/enum/TransactionType";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import { HistorySectionDataType } from "src/core/type/HistorySectionDataType";
import { TransactionHistoryDataType } from "src/core/type/TransactionHistoryDataType";
import BitcoinUtils from "src/core/utils/bitcoinUtils";
import Utils from "src/core/utils/commonUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { LoadingTransactionView, SeeMoreTransactionView } from "../components";
import useBitcoinTransactionTab from "./bitcoin.transactionTab.hook";
import { useStyles } from "./bitcoin.transactionTab.styles";

const BitcoinTransactionTab: React.FC<
  RootNavigationType & {
    setShowTypeModal: (value: boolean) => void;
    typeSelect: TransactionType;
  }
> = ({ navigation, typeSelect }) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);

  const {
    transactionHistory,
    refreshing,
    onRefresh,
    onGoToDetails,
    loading,
    viewMoreHistory,
    protocolLogo,
  } = useBitcoinTransactionTab({ navigation, typeSelect });

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: HistorySectionDataType;
  }) => (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );

  const renderHistoryItem = ({
    item,
    index,
    section,
  }: {
    item: TransactionHistoryDataType;
    index: number;
    section: HistorySectionDataType;
  }) => {
    const isReceive = item.type === TransactionType.Receive;
    const topItem = index === 0;
    const bottomItem = index === section.data.length - 1;
    const totalAmount =
      item?.amountSend + (item.adminFee ?? 0) + (item.fee ?? 0);
    const amountTitle = `${isReceive ? "+" : "-"} ${Utils.formattedBalanceCurrency(
      parseFloat(BitcoinUtils.getBitcoinFromSatoshi(totalAmount))
    )} ${t(LanguageKey.currency_bitcoin)}`;

    return (
      <HistoryItemComponent
        itemKey={item?.txHash}
        transactionType={item.type ?? TransactionType.Receive}
        onPress={() => onGoToDetails(item)}
        containerStyle={[
          bottomItem ? styles.bottomItem : null,
          topItem ? styles.topItem : null,
        ]}
        createdAt={item.createdAt}
        address={item.toAddress}
        amountTitle={amountTitle}
        status={item.status ?? TransactionStatusType.Pending}
        logoUri={protocolLogo}
      />
    );
  };

  return (
    <>
      {transactionHistory.length > 0 ? (
        <SectionList
          style={styles.maxHeigh}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.text_on_surface_text_high}
              colors={[theme.colors.text_on_surface_text_high]}
            />
          }
          sections={transactionHistory}
          renderItem={renderHistoryItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[appStyles.pB50]}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item?.txHash ?? ""}
          ListFooterComponent={
            <SeeMoreTransactionView handleViewMore={viewMoreHistory} />
          }
        />
      ) : (
        <LoadingTransactionView
          isTransactionHistoryLoading={loading}
          onRefresh={onRefresh}
          refreshing={refreshing}
          viewMoreHistory={viewMoreHistory}
        />
      )}
    </>
  );
};

export default BitcoinTransactionTab;
