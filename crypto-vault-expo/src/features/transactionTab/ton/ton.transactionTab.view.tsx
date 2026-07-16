import React from "react";
import {
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";
import { TransactionType } from "src/core/enum/TransactionType";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import appStyles from "src/core/styles";
import { HistorySectionDataType } from "src/core/type/HistorySectionDataType";
import { TransactionHistoryDataType } from "src/core/type/TransactionHistoryDataType";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  LoadingTransactionView,
  SeeMoreTransactionView,
} from "../components";
import { RenderTonHistoryItem } from "./ton.transactionTab.component";
import useTonTransactionTab from "./ton.transactionTab.hook";
import { useStyles } from "./ton.transactionTab.styles";

const TonTransactionTab: React.FC<
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
    currentWallet,
    selectedAddress,
  } = useTonTransactionTab({ navigation, typeSelect });
  const renderHistoryItem = ({
    item,
    section,
  }: {
    item: TransactionHistoryDataType;
    section: HistorySectionDataType;
  }) => {
    return (
      <RenderTonHistoryItem
        key={item.id}
        item={item}
        goToDetails={onGoToDetails}
        protocolLogo={protocolLogo}
        currentWallet={currentWallet}
        selectedAddress={selectedAddress}
        section={section}
      />
    );
  };

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: HistorySectionDataType;
  }) => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
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

export default TonTransactionTab;
