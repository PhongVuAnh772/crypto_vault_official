import React from "react";
import { TouchableOpacity, View } from "react-native";
import AppButton from "src/components/common/AppButton";
import AppImage from "src/components/common/AppImage";
import AppSkeletonLoading from "src/components/common/AppSkeletonLoading";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import {
  AddDocumentSvgIcon,
  ArrowRightSvgIcon,
} from "src/core/constants/AppIconsSvg";
import { appImages } from "src/core/constants/AppImages";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import NFTCollectionStyle from "../evm/NFTCollection.style";
import {
  HeaderCollectionRenderingProps,
  ListEmpty,
  LoadingWrapperProps,
} from "../evm/NFTCollection.type";

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading,
  children,
  skeletonHeight = 20,
  skeletonWidth = 100,
  containerSkeleton,
}) => {
  if (loading) {
    return (
      <View style={containerSkeleton}>
        <AppSkeletonLoading width={skeletonWidth} height={skeletonHeight} />
      </View>
    );
  }
  return <>{children}</>;
};

const ListNFTEmpty: React.FC<ListEmpty> = ({ onPress }) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        NFTCollectionStyle.center,
        NFTCollectionStyle.flex1,
        NFTCollectionStyle.listEmptyContainer,
      ]}
    >
      <View style={NFTCollectionStyle.emptyIconWrap}>
        <AddDocumentSvgIcon color={appColors.neutral.n500} />
      </View>
      <View style={NFTCollectionStyle.pv12}>
        <AppText
          titleWithI18n={LanguageKey.nft_no_nfts_yet}
          variant={TextVariantKeys.titleLarge}
          textColor={theme.colors.text_on_surface_text_medium}
        />
      </View>
      <View style={NFTCollectionStyle.mbt15}>
        <AppText
          titleWithI18n={LanguageKey.nft_dont_see_your_nft}
          variant={TextVariantKeys.bodyRMedium}
          textColor={theme.colors.text_on_surface_text_medium}
        />
      </View>
      <View style={[appStyles.fullWidth]}>
        <AppButton
          onPress={onPress}
          titleWithI18n={LanguageKey.nft_import_nfts}
          textVariant={TextVariantKeys.bodyMMedium}
          textColor={appColors.neutral.white}
          styles={NFTCollectionStyle.importNFTbutton}
        />
      </View>
    </View>
  );
};

const SeparatorCollection = () => {
  return <View style={NFTCollectionStyle.separator} />;
};

const HeaderCollectionRendering = ({
  imageUri,
  setLoadingImage,
  isLoading,
  loading,
  title,
  isHideViewAll,
  handlePressViewAll,
  length,
}: HeaderCollectionRenderingProps) => {
  const theme = useAppTheme();

  return (
    <View
      style={[
        NFTCollectionStyle.collectionHeader,
      ]}
    >
      <View style={NFTCollectionStyle.headerLeft}>
        <View style={NFTCollectionStyle.avatarFrame}>
          <AppImage
            uri={imageUri}
            height={40}
            width={40}
            setIsLoading={setLoadingImage}
            isLoading={isLoading}
            defaultImage={appImages.NFTDefault}
          />
        </View>

        <LoadingWrapper
          loading={loading}
          skeletonWidth={100}
          containerSkeleton={[
            NFTCollectionStyle.flex1,
            NFTCollectionStyle.collectionTitleWrap,
          ]}
        >
          <View style={[NFTCollectionStyle.collectionTitleWrap]}>
            <AppText
              title={title}
              variant={TextVariantKeys.bodyMMedium}
              textColor={theme.colors.text_on_surface_text_high}
            >
              <AppText
                title={` (${length?.toString() || ""})`}
                variant={TextVariantKeys.bodyMMedium}
                textColor={theme.colors.text_on_surface_text_high}
              />
            </AppText>
          </View>
        </LoadingWrapper>
      </View>
      {isHideViewAll && (
        <LoadingWrapper loading={loading} skeletonWidth={100}>
          <TouchableOpacity
            onPress={handlePressViewAll}
            style={NFTCollectionStyle.viewAllButton}
          >
            <AppText
              titleWithI18n={LanguageKey.common_view_all}
              variant={TextVariantKeys.bodyMSmall}
              textColor={theme.colors.text_on_surface_text_light}
              styles={NFTCollectionStyle.viewAllText}
            />
            <ArrowRightSvgIcon
              color={theme.colors.text_on_surface_text_light}
            />
          </TouchableOpacity>
        </LoadingWrapper>
      )}
    </View>
  );
};

export {
  HeaderCollectionRendering,
  ListNFTEmpty,
  LoadingWrapper,
  SeparatorCollection,
};
