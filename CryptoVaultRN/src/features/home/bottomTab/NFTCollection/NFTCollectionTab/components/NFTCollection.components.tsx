import React from "react";
import { TouchableOpacity, View, Image, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
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
  return (
    <View style={localStyles.emptyCardFrame}>
      {/* 3D Box Illustration */}
      <Image
        source={appImages.nftIllustration}
        style={localStyles.illustrationImage}
        resizeMode="contain"
      />

      {/* Texts */}
      <AppText
        title="Chưa có NFT nào"
        variant={TextVariantKeys.titleLarge}
        textColor="#FFFFFF"
        styles={localStyles.emptyTitle}
      />
      <AppText
        title={"Bạn chưa sở hữu NFT nào.\nThêm NFT đầu tiên vào bộ sưu tập\nđể bắt đầu nhé!"}
        variant={TextVariantKeys.bodyRMedium}
        textColor="#B3C2D8"
        styles={localStyles.emptySubtitle}
      />

      {/* Gradient Import Button */}
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={localStyles.buttonWrapper}>
        <LinearGradient
          colors={['#5A3FFF', '#8C3BFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={localStyles.importButton}
        >
          <View style={localStyles.plusCircle}>
            <Feather name="plus" size={14} color="#6A56FD" />
          </View>
          <AppText
            title="Nhập NFT"
            variant={TextVariantKeys.bodyMMedium}
            textColor="#FFFFFF"
            styles={localStyles.buttonText}
          />
        </LinearGradient>
      </TouchableOpacity>

      {/* Security alert banner inside card */}
      <View style={localStyles.securityBanner}>
        <View style={localStyles.shieldIconBg}>
          <Feather name="shield" size={16} color="#9E86FF" />
          <View style={localStyles.shieldCheck}>
            <Feather name="check" size={7} color="#07051A" />
          </View>
        </View>
        <View style={localStyles.securityTextCol}>
          <Text style={localStyles.securityTitle}>NFT của bạn được bảo vệ an toàn</Text>
          <Text style={localStyles.securitySubtitle}>Chỉ bạn mới có quyền truy cập và quản lý.</Text>
        </View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  emptyCardFrame: {
    paddingHorizontal: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  illustrationImage: {
    width: 200,
    height: 200,
    marginTop: 10,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#B3C2D8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  importButton: {
    flexDirection: 'row',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  plusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(158, 134, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  shieldIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(158, 134, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shieldCheck: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9E86FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityTextCol: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9E86FF',
    marginBottom: 2,
  },
  securitySubtitle: {
    fontSize: 11,
    color: '#B3C2D8',
  },
});

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
