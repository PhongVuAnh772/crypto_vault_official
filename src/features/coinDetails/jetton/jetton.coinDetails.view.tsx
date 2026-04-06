import React from "react";
import { View } from "react-native";
import AppImage from "src/components/common/AppImage";
import CoinDetails from "src/components/specific/CoinDetails/CoinDetails.view";
import HistoryItemComponent from "src/components/specific/HistoryItemComponent/HistoryItemComponent.view";
import {
  TransactionStatusType,
  TransactionType,
} from "src/core/enum/TransactionType";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import appStyles from "src/core/styles";
import { HistorySectionDataType } from "src/core/type/HistorySectionDataType";
import { TransactionHistoryDataType } from "src/core/type/TransactionHistoryDataType";
import Utils from "src/core/utils/commonUtils";
import TonUtils from "src/core/utils/tonUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  ItemSeparatorComponent,
  ListFooterComponent,
} from "./jetton.coinDetails.components";
import { useJetton } from "./jetton.coinDetails.hook";
import useStyles from "./jetton.coinDetails.styles";

const JettonScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    jettonBalanceString,
    goToSendScreen,
    refreshing,
    transactionData,
    isTonGetTransactionsLoading,
    onRefresh,
    typeSelect,
    changeTypeSelect,
    goToDetails,
    onCloseTypeBottomSheet,
    onShowTypeBottomSheet,
    goToReceiveScreen,
    loadMore,
    onLoadMore,
    balanceCurrencyTitle,
    viewMoreHistory,
    headerTitle,
    logo,
    showTypeBottomSheetRef,
  } = useJetton({
    navigation,
  });
  const theme = useAppTheme();

  const styles = useStyles(theme);

  const renderItem = ({
    item,
    section,
  }: {
    item: TransactionHistoryDataType;
    section: HistorySectionDataType;
  }) => {
    const sectionLength = section.data.length;
    const multipleItem = sectionLength > 1;
    const currentItemIndex = section.data.findIndex((e) => e === item);
    const isLastMainItem = currentItemIndex === sectionLength - 1;
    const isNeedMarginBottom = !isLastMainItem && multipleItem;
    const marginBottomStyle = isNeedMarginBottom ? appStyles.mbt10 : null;

    const multipleTransactionData = item.multipleTransactionData;
    const isCaseTwoTransactionsHaveAdminTransaction =
      multipleTransactionData?.length === 2 &&
      multipleTransactionData.some((e) => e.isAdminFee === true);

    const isMultipleTransaction =
      multipleTransactionData != null &&
      !isCaseTwoTransactionsHaveAdminTransaction;

    const filterAdminFeeAction = multipleTransactionData?.filter(
      (e) => !e?.isAdminFee
    );

    if (isMultipleTransaction) {
      const key = Utils.generateUniqueId();

      return (
        <View key={key} style={marginBottomStyle}>
          {filterAdminFeeAction?.map((currentTransaction, index) => {
            const isFirstItem = index === 0;
            const isLastItem = index === filterAdminFeeAction.length - 1;
            const totalAmount =
              currentTransaction?.amountSend +
              (currentTransaction.adminFee ?? 0);
            const isReceive =
              currentTransaction.type === TransactionType.Receive;

            const amountTitle = `${isReceive ? "+" : "-"} ${Utils.formattedBalanceCurrency(
              TonUtils.formatBigNumber(
                String(totalAmount ?? 0),
                currentTransaction.decimal
              )
            )} ${item.tokenSymbol ?? ""}`;

            return (
              <HistoryItemComponent
                key={`${index} ${item.id}`}
                itemKey={`${item.id} ${index}`}
                transactionType={
                  currentTransaction.type ?? TransactionType.Receive
                }
                onPress={() => goToDetails(currentTransaction)}
                containerStyle={[
                  isFirstItem ? styles.firstTransactionItemInSection : null,
                  isLastItem ? styles.lastTransactionItemInSection : null,
                ]}
                createdAt={currentTransaction.createdAt}
                address={currentTransaction.toAddress}
                amountTitle={amountTitle}
                status={
                  currentTransaction.status ?? TransactionStatusType.Pending
                }
              />
            );
          })}
        </View>
      );
    } else {
      const totalAmount = item?.amountSend + (item.adminFee ?? 0);
      const isReceive = item.type === TransactionType.Receive;
      const amountTitle = `${isReceive ? "+" : "-"} ${Utils.formattedBalanceCurrency(
        TonUtils.formatBigNumber(String(totalAmount ?? 0), item.decimal)
      )} ${item.tokenSymbol ?? ""}`;

      return (
        <HistoryItemComponent
          itemKey={item?.txHash}
          transactionType={item.type ?? TransactionType.Receive}
          onPress={() => goToDetails(item)}
          containerStyle={[styles.transactionContainer, marginBottomStyle]}
          createdAt={item.createdAt}
          address={item.toAddress}
          amountTitle={amountTitle}
          status={item.status ?? TransactionStatusType.Pending}
        />
      );
    }
  };

  return (
    <CoinDetails
      name={headerTitle}
      networkName="TON Network"
      refModalShowType={showTypeBottomSheetRef}
      icon={
        <AppImage uri={logo ?? ""} styleImage={appStyles.iconCircleSize50} />
      }
      isTransactionHistoryLoading={isTonGetTransactionsLoading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onCloseTypeBottomSheet={onCloseTypeBottomSheet}
      typeSelect={typeSelect}
      changeTypeSelect={changeTypeSelect}
      balanceTitle={jettonBalanceString}
      balanceCurrencyTitle={balanceCurrencyTitle}
      sendAction={goToSendScreen}
      receiveAction={goToReceiveScreen}
      onShowTypeBottomSheet={onShowTypeBottomSheet}
      sectionData={transactionData}
      titleWithI18n={headerTitle}
      onLoadMore={onLoadMore}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparatorComponent}
      ListFooterComponent={
        <ListFooterComponent
          loadMore={loadMore}
          viewMoreHistory={viewMoreHistory}
        />
      }
      viewMoreHistory={viewMoreHistory}
      hideSendAction={false}
    />
  );
};

export default JettonScreen;
