import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { ScreenWrapper } from "src/components";
import appColors from "src/core/constants/AppColors";
import { MoreDynamicIconSvg } from "src/core/constants/AppIconsSvg";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  BottomSheetNFTArchiving,
  NFTCollectionLoadingStat,
  NFTItemStats,
} from "./NFTCollectionStats.component";
import useNFTCollectionStats from "./NFTCollectionStats.hook";
import NFTCollectionStyle from "./NFTCollectionStats.style";
const NFTCollectionStats = ({ navigation, route }: RootNavigationType) => {
  const {
    collectionAddress,
    headerTitle,
    isArchived,
    possibleSpam,
    collection,
  } = route.params;
  const theme = useAppTheme();
  const styles = NFTCollectionStyle(theme);
  const {
    detailNFTsByCollection,
    isInitialLoading,
    navigateToNFTUnAddedDetail,
    refreshing,
    onRefresh,
    handlingFetchEVMPagination,
    enablePagination,
    selectedProtocol,
    t,
    modalArchiving,
    onHideModalArchiving,
    onShowModalArchiving,
    handleRightAction,
  } = useNFTCollectionStats({
    navigation,
    collectionAddress,
    archived: isArchived,
    collectionData: collection,
  });
  return (
    <ScreenWrapper
      headerTitle={headerTitle ?? t(LanguageKey.nft_unnamed_collection)}
      maxFontSizeMultiplier={1.4}
      enableHeader
      enableWidthLimit
      paddingTop
      styleWidthLimitContainer={styles.headerStyle}
      backgroundColor={theme.colors.surface_surface_default}
      iconRight={
        possibleSpam ? (
          <MoreDynamicIconSvg
            onPress={onShowModalArchiving}
            height={26}
            width={26}
            color={appColors.neutral.n800}
          />
        ) : null
      }
      subStyle={[appStyles.flex1]}
    >
      <View style={[appStyles.flex1]}>
        {detailNFTsByCollection && detailNFTsByCollection.length > 0 ? (
          <View style={styles.container}>
            <FlatList
              data={detailNFTsByCollection}
              showsVerticalScrollIndicator={false}
              onEndReached={handlingFetchEVMPagination}
              onEndReachedThreshold={0.2}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListFooterComponent={
                enablePagination ? (
                  <View style={styles.mt15}>
                    <ActivityIndicator
                      color={appColors.main.tokyoRed}
                      size="small"
                    />
                  </View>
                ) : null
              }
              renderItem={({ item, index }) => (
                <NFTItemStats
                  item={item}
                  index={index}
                  onPress={navigateToNFTUnAddedDetail}
                  setIsLoading={() => {}}
                  selectedProtocol={selectedProtocol}
                  isLoading={false}
                  archived={isArchived}
                />
              )}
            />
          </View>
        ) : (
          <NFTCollectionLoadingStat loading={isInitialLoading} />
        )}
      </View>
      <BottomSheetNFTArchiving
        showModal={modalArchiving}
        onClose={onHideModalArchiving}
        onDelete={handleRightAction}
        onDismiss={onHideModalArchiving}
        isArchived={isArchived}
      />
    </ScreenWrapper>
  );
};

export default NFTCollectionStats;
