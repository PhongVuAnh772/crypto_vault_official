import { t } from "i18next";
import React from "react";
import { View, Linking } from "react-native";
import { useSelector } from "react-redux";
import CoinDetails from "src/components/specific/CoinDetails/CoinDetails.view";
import HistoryItemComponent from "src/components/specific/HistoryItemComponent/HistoryItemComponent.view";
import { TonSvgIcon } from "src/core/constants/AppIconsSvg";
import {
  TransactionStatusType,
  TransactionType,
} from "src/core/enum/TransactionType";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { getIsTestnet } from "src/core/redux/slice/app.slice";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import { HistorySectionDataType } from "src/core/type/HistorySectionDataType";
import { TransactionHistoryDataType } from "src/core/type/TransactionHistoryDataType";
import TonUtils from "src/core/utils/tonUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  ItemSeparatorComponent,
  ListFooterComponent,
} from "./ton.coinDetails.components";
import { useTon } from "./ton.coinDetails.hook";
import useStyles from "./ton.coinDetails.styles";

const TonScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const isTestnet = useSelector(getIsTestnet);
  const {
    tonBalanceString,
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
    showTypeBottomSheetRef,
  } = useTon({
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
    const multipleTransactionData = item.multipleTransactionData;

    const marginBottomStyle = isNeedMarginBottom ? appStyles.mbt10 : null;

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
      return (
        <View style={marginBottomStyle} key={item?.txHash}>
          {filterAdminFeeAction?.map((currentTransaction, index) => {
            const isFirstItem = index === 0;
            const isLastItem = index === filterAdminFeeAction.length - 1;
            const totalAmount =
              currentTransaction?.amountSend +
              (currentTransaction.adminFee ?? 0) +
              (currentTransaction.fee ?? 0);
            const isReceive =
              currentTransaction.type === TransactionType.Receive;
            const amountTitle = `${isReceive ? "+" : "-"} ${TonUtils.formatTonBalance(
              TonUtils.formatBigNumber(
                String(totalAmount ?? 0),
                currentTransaction.decimal
              )
            )} ${t(LanguageKey.currency_ton)}`;

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
      const totalAmount =
        item?.amountSend + (item.adminFee ?? 0) + (item.fee ?? 0);
      const isReceive = item.type === TransactionType.Receive;
      const amountTitle = `${isReceive ? "+" : "-"} ${TonUtils.formatTonBalance(
        TonUtils.formatBigNumber(String(totalAmount ?? 0), item.decimal)
      )} ${t(LanguageKey.currency_ton)}`;

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
      coinGeckoId="the-open-network"
      name="TON"
      networkName={isTestnet ? "TON Testnet" : "TON Mainnet"}
      refModalShowType={showTypeBottomSheetRef}
      icon={<TonSvgIcon width={50} height={50} />}
      isTransactionHistoryLoading={isTonGetTransactionsLoading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onCloseTypeBottomSheet={onCloseTypeBottomSheet}
      typeSelect={typeSelect}
      changeTypeSelect={changeTypeSelect}
      balanceTitle={tonBalanceString}
      balanceCurrencyTitle={balanceCurrencyTitle}
      sendAction={goToSendScreen}
      receiveAction={goToReceiveScreen}
      faucetAction={isTestnet ? () => Linking.openURL("tg://resolve?domain=testgiver_ton_bot").catch(() => Linking.openURL("https://t.me/testgiver_ton_bot")) : undefined}
      onShowTypeBottomSheet={onShowTypeBottomSheet}
      sectionData={transactionData}
      titleWithI18n={LanguageKey.ton_coin_title}
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
    />
  );
};

export default TonScreen;
