import React from "react";
import { FlatList, View } from "react-native";
import { ScreenWrapper } from "src/components";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  CollectionDetailNFT,
  LoadingListNFTOwnView,
  RenderNFTYouOwnListNew,
} from "./NFTYouOwn.component";
import { useNFTYouOwn } from "./NFTYouOwn.hook";
import { useStyles } from "./NFTYouOwn.style";
import { ItemCollectionDetail } from "./NFTYouOwn.type";

const NFTYouOwnList: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    theme,
    dataClaimable,
    dataGetOwned,
    commonBackAction,
    loading,
    t,
    NFTSelectedModal,
    handleOpenNFTSelectedModal,
    handleCloseNFTSelectedModal,
    actionAddingToMyCollection,
    itemYouOwnSelected,
    setItemYouOwnSelected,
    handleAddNFT,
    setLoadingHandle,
    loadingHandle,
    checkingExistingInCollection,
    isExistingInCollection,
    handleGetImage,
    image,
    canvasRef,
    actionHideStatus,
  } = useNFTYouOwn({
    navigation,
  });

  const styles = useStyles(theme);
  return (
    <ScreenWrapper
      enableHeader
      paddingTop
      backAction={commonBackAction}
      headerTitleWithI18n={LanguageKey.NFT_you_own}
      headerTextVariant={TextVariantKeys.titleLarge}
      backgroundColor={theme.colors.surface_surface_default}
    >
      {dataGetOwned?.length > 0 ? (
        <View style={styles.container}>
          <View style={[styles.projectContainer, styles.project]}>
            <FlatList
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              data={dataGetOwned}
              renderItem={({ item }) => (
                <RenderNFTYouOwnListNew
                  item={item}
                  theme={theme}
                  dataClaimable={dataClaimable}
                  handleOpenNFTSelectedModal={handleOpenNFTSelectedModal}
                  t={t}
                  loading={loading}
                  inModal={true}
                />
              )}
              keyExtractor={(item, index) => item.nftId?.toString()}
            />
          </View>
        </View>
      ) : (
        <LoadingListNFTOwnView isLoading={loading} />
      )}
      {itemYouOwnSelected && (
        <CollectionDetailNFT
          information={itemYouOwnSelected}
          actionCollecting={actionAddingToMyCollection}
          cancelAction={handleCloseNFTSelectedModal}
          statusModal={NFTSelectedModal}
          theme={theme}
          handleSubmitImport={handleAddNFT}
          setItemYouOwnSelected={
            setItemYouOwnSelected as (item: ItemCollectionDetail | null) => void
          }
          loadingHandle={loadingHandle}
          setLoadingHandle={setLoadingHandle}
          checkingExistingInCollection={checkingExistingInCollection}
          isExistingInCollection={isExistingInCollection}
          handleGetImage={handleGetImage}
          image={image}
          canvasRef={canvasRef}
          actionHideStatus={actionHideStatus}
        />
      )}
    </ScreenWrapper>
  );
};

export default NFTYouOwnList;
