import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppImage from 'src/components/common/AppImage';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import {
    AddDocumentSvgIcon,
    ArrowRightSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import NFTCollectionStyle from '../evm/NFTCollection.style';
import {
    HeaderCollectionRenderingProps,
    ListEmpty,
    LoadingWrapperProps,
} from '../evm/NFTCollection.type';

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
                <AppSkeletonLoading
                    width={skeletonWidth}
                    height={skeletonHeight}
                />
            </View>
        );
    }
    return <>{children}</>;
};

const ListNFTEmpty: React.FC<ListEmpty> = ({ onPress }) => {
    const theme = useAppTheme();
    const newUI = GlobalUtils.getEnableRedXNewTheme();

    return (
        <View
            style={[
                NFTCollectionStyle.center,
                NFTCollectionStyle.flex1,
                NFTCollectionStyle.listEmptyContainer,
            ]}>
            <AddDocumentSvgIcon
                color={newUI ? appColors.neutral.black : appColors.neutral.n500}
            />
            <View style={NFTCollectionStyle.pv12}>
                <AppText
                    titleWithI18n={LanguageKey.nft_no_nfts_yet}
                    variant={TextVariantKeys.titleLarge}
                    textColor={
                        newUI
                            ? appColors.neutral.black
                            : theme.colors.text_on_surface_text_medium
                    }
                />
            </View>
            <View style={NFTCollectionStyle.mbt15}>
                <AppText
                    titleWithI18n={LanguageKey.nft_dont_see_your_nft}
                    variant={TextVariantKeys.bodyRMedium}
                    textColor={
                        newUI
                            ? appColors.neutral.black
                            : theme.colors.text_on_surface_text_medium
                    }
                />
            </View>
            <View style={[appStyles.fullWidth]}>
                {newUI ? (
                    <AppButtonSVG
                        onPress={onPress}
                        titleWithI18n={LanguageKey.nft_import_nfts}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        backgroundColor={appColors.neutral.black}
                        SvgView={SvgView.button}
                        buttonHeight={48}
                    />
                ) : (
                    <AppButton
                        onPress={onPress}
                        titleWithI18n={LanguageKey.nft_import_nfts}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        styles={NFTCollectionStyle.importNFTbutton}
                    />
                )}
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
                NFTCollectionStyle.flexRow,
                NFTCollectionStyle.justifyContentBetween,
                NFTCollectionStyle.alignItemsCenter,
                NFTCollectionStyle.pB15,
            ]}>
            <AppImage
                uri={imageUri}
                height={32}
                width={32}
                setIsLoading={setLoadingImage}
                isLoading={isLoading}
                defaultImage={appImages.NFTDefault}
            />

            <LoadingWrapper
                loading={loading}
                skeletonWidth={100}
                containerSkeleton={[
                    NFTCollectionStyle.flex1,
                    NFTCollectionStyle.pH12,
                ]}>
                <View
                    style={[NFTCollectionStyle.flex1, NFTCollectionStyle.pH12]}>
                    <AppText
                        title={title}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_high}>
                        <AppText
                            title={` (${length?.toString() || ''})`}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={theme.colors.text_on_surface_text_high}
                        />
                    </AppText>
                </View>
            </LoadingWrapper>
            {isHideViewAll && (
                <LoadingWrapper loading={loading} skeletonWidth={100}>
                    <TouchableOpacity
                        onPress={handlePressViewAll}
                        style={[
                            NFTCollectionStyle.flexRow,
                            NFTCollectionStyle.justifyContentBetween,
                            NFTCollectionStyle.alignItemsCenter,
                        ]}>
                        <AppText
                            titleWithI18n={LanguageKey.common_view_all}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
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
