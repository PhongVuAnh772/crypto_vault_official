import React from 'react';
import { FlatList, View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { NotFoundSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import { LoadingWrapper } from '../../bottomTab/explore/explore.component';
import useStyle from './tokens.styles';
import {
    HeaderListTopEVMsProps,
    RenderTopItemProps,
    TopTokenLoadingProps,
} from './tokens.type';

const HeaderListTopTokens: React.FC<HeaderListTopEVMsProps> = ({
    newUI,
    usingWithLoading,
}) => {
    const theme = useAppTheme();
    const styles = useStyle(theme, newUI);
    return (
        <>
            {usingWithLoading ? (
                <View style={styles.headerLoadingContainer}>
                    <View
                        style={[appStyles.flexRow, styles.indexLoadingColumn]}>
                        <AppText
                            titleWithI18n={'#'}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
                            maxFontSizeMultiplier={1.2}
                        />
                        <AppText
                            titleWithI18n={LanguageKey.top_5_tokens_24_volume}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
                            styles={styles.ml16}
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>
                    <View
                        style={[
                            styles.priceLoadingColumn,
                            appStyles.alignItemsEnd,
                        ]}>
                        <AppText
                            titleWithI18n={LanguageKey.top_5_tokens_last_price}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>
                    <View
                        style={[
                            styles.changeLoadingColumn,
                            appStyles.alignItemsEnd,
                        ]}>
                        <AppText
                            titleWithI18n={LanguageKey.top_5_tokens_24h}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.headerContainer}>
                    <View style={[appStyles.flexRow, styles.indexHeaderColumn]}>
                        <AppText
                            titleWithI18n={'#'}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
                            maxFontSizeMultiplier={1.2}
                        />
                        <AppText
                            titleWithI18n={LanguageKey.top_5_tokens_24_volume}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
                            styles={styles.ml16}
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>
                    <View
                        style={[
                            styles.priceHeaderColumn,
                            appStyles.alignItemsEnd,
                        ]}>
                        <AppText
                            titleWithI18n={LanguageKey.top_5_tokens_last_price}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>
                    <View
                        style={[
                            styles.changeHeaderColumn,
                            appStyles.alignItemsEnd,
                        ]}>
                        <AppText
                            titleWithI18n={LanguageKey.top_5_tokens_24h}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>
                </View>
            )}
        </>
    );
};

const RenderTopItem = ({
    item,
    index,
    loadingImages,
    setLoadingImages,
    newUI,
    handleFiatConverted,
}: RenderTopItemProps) => {
    const theme = useAppTheme();
    const styles = useStyle(theme, newUI);
    return (
        <View
            style={[
                styles.tokenItem,
                appStyles.flexRow,
                appStyles.justifyContentBetween,
            ]}>
            <View
                style={[
                    styles.indexColumn,
                    appStyles.flexRow,
                    appStyles.alignItemsCenter,
                ]}>
                <AppText
                    title={`${index}`}
                    variant={TextVariantKeys.bodyMSmall}
                    textColor={theme.colors.text_on_surface_text_light}
                    styles={Number(index) <= 9 ? styles.pr16 : styles.pr8}
                    maxFontSizeMultiplier={1.2}
                />
                <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                    <AppImage
                        uri={item.token_logo ?? ''}
                        styleImage={styles.imageToken}
                        isLoading={loadingImages[index]?.loading}
                        setIsLoading={setLoadingImages}
                        skeletonRadius={100}
                        bonusId={item.token_name}
                        defaultImage={appImages.logo}
                    />
                    <View style={styles.ml8}>
                        <AppText
                            title={item.token_symbol}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={theme.colors.text_on_surface_text_high}
                            maxFontSizeMultiplier={1.2}
                        />
                        <AppText
                            title={`$${Utils.formatMarketCap(
                                Number(item.market_cap_usd),
                            )}`}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
                            styles={appStyles.mt8}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>
                </View>
            </View>

            <View style={[styles.priceColumn]}>
                <AppText
                    title={handleFiatConverted(Number(item.price_usd))}
                    variant={TextVariantKeys.labelSmall}
                    textColor={theme.colors.text_on_surface_text_medium_high}
                    styles={appStyles.textAlignRight}
                    maxFontSizeMultiplier={1.2}
                />
            </View>

            <View style={[styles.changeColumn]}>
                <AppText
                    title={`${Number(item.price_24h_percent_change) < 0 ? '-' : ''}${Utils.truncateToTwoDecimalsWithoutChecking(Number(item.price_24h_percent_change))}%`}
                    variant={TextVariantKeys.labelSmall}
                    textColor={
                        Number(item.price_24h_percent_change) > 0
                            ? appColors.functional.success
                            : theme.colors.text_on_surface_text_brand_2
                    }
                    styles={appStyles.textAlignRight}
                    maxFontSizeMultiplier={1.2}
                />
            </View>
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

const TopTokenLoading = ({ newUI }: TopTokenLoadingProps) => {
    const theme = useAppTheme();
    const styles = useStyle(theme, newUI);

    const renderItemLoading = () => {
        return (
            <View style={[appStyles.flexRow, appStyles.justifyContentBetween]}>
                <View
                    style={[
                        styles.indexColumn,
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                    ]}>
                    <LoadingWrapper
                        loading={true}
                        skeletonWidth={10}
                        containerSkeleton={appStyles.ml10}
                        skeletonHeight={20}>
                        <View />
                    </LoadingWrapper>
                    <View
                        style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                        <LoadingWrapper
                            loading={true}
                            skeletonWidth={24}
                            containerSkeleton={appStyles.ml12}
                            skeletonHeight={24}>
                            <View />
                        </LoadingWrapper>

                        <View style={styles.ml8}>
                            <LoadingWrapper
                                loading={true}
                                skeletonWidth={103}
                                skeletonHeight={20}>
                                <View />
                            </LoadingWrapper>
                            <LoadingWrapper
                                loading={true}
                                skeletonWidth={63}
                                containerSkeleton={appStyles.mt8}
                                skeletonHeight={20}>
                                <View />
                            </LoadingWrapper>
                        </View>
                    </View>
                </View>

                <View style={[styles.priceColumn, appStyles.alignItemsEnd]}>
                    <LoadingWrapper
                        loading={true}
                        skeletonWidth={53}
                        containerSkeleton={appStyles.ml10}
                        skeletonHeight={20}>
                        <View />
                    </LoadingWrapper>
                </View>

                <View style={[styles.changeColumn, appStyles.alignItemsEnd]}>
                    <LoadingWrapper
                        loading={true}
                        skeletonWidth={53}
                        containerSkeleton={appStyles.ml10}
                        skeletonHeight={20}>
                        <View />
                    </LoadingWrapper>
                </View>
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
                ListHeaderComponent={
                    <HeaderListTopTokens newUI={newUI} usingWithLoading />
                }
            />
        </View>
    );
};

export { EmptyView, HeaderListTopTokens, RenderTopItem, TopTokenLoading };
