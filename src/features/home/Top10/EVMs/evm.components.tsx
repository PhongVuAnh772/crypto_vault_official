import React from 'react';
import { FlatList, View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import { NotFoundSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import { LoadingWrapper } from '../../bottomTab/explore/explore.component';
import useStyle from './evm.styles';
import { RenderTopItemProps } from './evm.type';

const HeaderListTopEVMs: React.FC = () => {
    const theme = useAppTheme();
    const styles = useStyle(theme);
    return (
        <View style={styles.headerContainer}>
            <AppText
                titleWithI18n={'#'}
                variant={TextVariantKeys.bodyMSmall}
                textColor={theme.colors.text_on_surface_text_light}
            />
            <View style={[appStyles.flex1, styles.marketCapHeader]}>
                <AppText
                    titleWithI18n={LanguageKey.top_5_tokens_market_cap}
                    variant={TextVariantKeys.bodyMSmall}
                    textColor={theme.colors.text_on_surface_text_light}
                />
            </View>
            <AppText
                titleWithI18n={LanguageKey.top_5_tokens_price}
                variant={TextVariantKeys.bodyMSmall}
                textColor={theme.colors.text_on_surface_text_light}
            />
        </View>
    );
};

const RenderTopItem = ({
    item,
    index,
    loadingImages,
    setLoadingImages,
    handleFiatConverted,
}: RenderTopItemProps) => {
    const theme = useAppTheme();
    const styles = useStyle(theme);
    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                appStyles.justifyContentBetween,
                styles.tokenItem,
            ]}>
            <AppText
                titleWithI18n={index}
                variant={TextVariantKeys.bodyMSmall}
                textColor={theme.colors.text_on_surface_text_light}
            />
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.alignItemsCenter,
                    appStyles.flex1,
                    styles.pdH12,
                    { paddingLeft: Number(index) < 10 ? 16 : 8 },
                ]}>
                <AppImage
                    uri={item.logo ?? ''}
                    styleImage={styles.imageToken}
                    isLoading={loadingImages[index]?.loading}
                    setIsLoading={setLoadingImages}
                    skeletonRadius={100}
                    bonusId={item.name}
                    defaultImage={appImages.logo}
                />
                <View>
                    <AppText
                        title={item.symbol && item.symbol.toUpperCase()}
                        variant={TextVariantKeys.bodyMMedium}
                        styles={styles.name}
                        textColor={theme.colors.text_on_surface_text_high}
                    />
                    <AppText
                        title={`$${Utils.formatMarketCap(
                            Number(item.market_cap_usd),
                        )}`}
                        variant={TextVariantKeys.bodyMSmall}
                        styles={styles.fiat}
                        textColor={theme.colors.text_on_surface_text_light}
                    />
                </View>
            </View>
            <AppText
                titleWithI18n={handleFiatConverted(Number(item.usd_price))}
                variant={TextVariantKeys.labelMedium}
                textColor={
                    Number(item.usd_price_24hr_change) < 0
                        ? theme.colors.text_on_surface_text_brand_2
                        : theme.colors.text_on_surface_text_medium_high
                }
                styles={appStyles.textAlignRight}
            />
        </View>
    );
};

const EmptyView = () => {
    const theme = useAppTheme();

    return (
        <View
            style={[
                appStyles.alignItemsCenter,
                appStyles.flexGrow1,
                appStyles.justifyContentCenter,
                appStyles.mbt70,
            ]}>
            <View style={[appStyles.mbt10]}>
                <NotFoundSvgIcon />
            </View>
            <AppText
                titleWithI18n={LanguageKey.No_asset_found_title}
                textColor={theme.colors.text_on_surface_text_medium}
                variant={TextVariantKeys.bodyRMedium}
            />
        </View>
    );
};

const LoadingView = () => {
    const theme = useAppTheme();
    const styles = useStyle(theme);

    const renderItemLoading = () => {
        return (
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.alignItemsCenter,
                    appStyles.justifyContentBetween,
                    styles.tokenLoadingItem,
                ]}>
                <LoadingWrapper
                    loading={true}
                    skeletonWidth={10}
                    containerSkeleton={appStyles.ml10}
                    skeletonHeight={20}>
                    <View />
                </LoadingWrapper>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                        appStyles.flex1,
                        styles.pdH12,
                    ]}>
                    <LoadingWrapper
                        loading={true}
                        skeletonWidth={24}
                        containerSkeleton={appStyles.ml10}
                        skeletonHeight={24}>
                        <View />
                    </LoadingWrapper>
                    <View>
                        <LoadingWrapper
                            loading={true}
                            skeletonWidth={70}
                            containerSkeleton={appStyles.ml10}
                            skeletonHeight={20}>
                            <View />
                        </LoadingWrapper>
                        <LoadingWrapper
                            loading={true}
                            skeletonWidth={50}
                            containerSkeleton={[appStyles.ml10, appStyles.mt8]}
                            skeletonHeight={20}>
                            <View />
                        </LoadingWrapper>
                    </View>
                </View>
                <LoadingWrapper
                    loading={true}
                    skeletonWidth={60}
                    containerSkeleton={appStyles.ml10}
                    skeletonHeight={20}>
                    <View />
                </LoadingWrapper>
            </View>
        );
    };

    return (
        <View style={styles.loadingContainer}>
            <FlatList
                data={Array.from({ length: 10 }, (_, i) => i + 1)}
                renderItem={renderItemLoading}
                scrollEnabled={false}
                ItemSeparatorComponent={() => (
                    <View style={styles.listContentContainer} />
                )}
                ListHeaderComponent={<HeaderListTopEVMs />}
            />
        </View>
    );
};
export { EmptyView, HeaderListTopEVMs, LoadingView, RenderTopItem };
