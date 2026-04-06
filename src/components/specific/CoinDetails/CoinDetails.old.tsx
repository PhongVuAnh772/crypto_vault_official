import React from "react";
import { TouchableOpacity, View } from "react-native";
import AppText from "src/components/common/AppText";
import TypeModal from "src/components/homeComponents/TypeModal/TypeModal";
import appColors from "src/core/constants/AppColors";
import { ArrowDownSvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { HistorySectionDataType } from "src/core/type/HistorySectionDataType";
import BottomSheetModalGorhom from "../BottomSheetModalGorhom/BottomSheetModalGorhom.view";
import { useCoinDetails } from "./CoinDetails.hook";
import useStyles from "./CoinDetails.styles";
import { CoinDetailsType } from "./CoinDetails.type";

const CoinDetails: React.FC<CoinDetailsType> = ({
  isTransactionHistoryLoading,
  refreshing,
  onRefresh,
  onCloseTypeBottomSheet,
  typeSelect,
  changeTypeSelect,
  balanceTitle,
  balanceCurrencyTitle,
  sendAction,
  receiveAction,
  onShowTypeBottomSheet,
  sectionData,
  icon,
  titleWithI18n,
  titleScreen,
  renderItem,
  onLoadMore,
  ItemSeparatorComponent,
  ListFooterComponent,
  viewMoreHistory,
  onBack,
  refModalShowType,
  hideSendAction,
}) => {
  const { theme, backAction, typeSelectTitle, handleScroll, data } =
    useCoinDetails({
      typeSelect: typeSelect,
      onBack,
      onLoadMore,
    });
  const styles = useStyles(theme);
  const Header = () => (
    <TouchableOpacity
      style={[styles.typeContainer]}
      onPress={onShowTypeBottomSheet}
    >
      <AppText
        titleWithI18n={typeSelectTitle}
        textColor={theme.colors.surface_surface_high}
        variant={TextVariantKeys.labelMedium}
      />
      <View style={styles.iconArrowDown}>
        <ArrowDownSvgIcon color={theme.colors.surface_surface_high} />
      </View>
    </TouchableOpacity>
  );
  const renderSectionHeader = ({
    section: { title },
  }: {
    section: HistorySectionDataType;
  }) => (
    <View style={[styles.header]}>
      <AppText
        title={title}
        variant={
          TextVariantKeys.labelMedium
        }
        textColor={
          appColors.neutral.n500
        }
      />
    </View>
  );

  if (!data || data.length === 0) return null;

  return (
    <>
      <BottomSheetModalGorhom refModal={refModalShowType} snapPoints={["30"]}>
        <TypeModal
          closeModal={onCloseTypeBottomSheet}
          typeSelect={typeSelect}
          setTyeSelect={changeTypeSelect}
        />
      </BottomSheetModalGorhom>
      {/* <CoinDetailComponent
          handleScroll={handleScroll}
          ButtonActionView={Header}
          data={sectionData}
          renderItem={({ item, index, section }) =>
            renderItem({ index, item, section })
          }
          renderSectionHeader={renderSectionHeader}
          balanceCurrencyTitle={balanceCurrencyTitle}
          balanceTitle={balanceTitle}
          headerTitle={titleScreen || titleWithI18n || ""}
          onReceivePress={receiveAction}
          onSendPress={sendAction}
          logo={icon}
          onBackPress={backAction}
          theme={theme}
          ItemSeparatorComponent={ItemSeparatorComponent}
          ListFooterComponent={ListFooterComponent}
          onLoadMore={onLoadMore}
          refreshing={refreshing}
          onRefresh={onRefresh}
          isLoading={isTransactionHistoryLoading}
          viewMoreHistory={viewMoreHistory}
          hideSendAction={hideSendAction}
        /> */}

    </>
  );
};

export default CoinDetails;
