import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import {
    EmptyTransactionSvgIcon,
    NotFoundSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { OwnedNFTType } from '../../bottomTab/explore/explore.type';
import { LoadingWrapper } from '../../bottomTab/NFTCollection/NFTCollectionTab/components/NFTCollection.components';
import { ProtocolNFTView } from '../confirm/confirmClaimToken.component';
import { useStyles } from '../confirm/confirmClaimToken.style';
import { containerStyles } from '../details/projectDetails.style';
import {
    LoadingListPriceFeedViewProps,
    ProjectDetailChildProps,
    ProjectInformationProps,
    RenderPriceFeedNewProps,
    TotalClaimingFooterProps,
} from './PriceFeedList.type';

export const TotalClaimingFooter: React.FC<TotalClaimingFooterProps> = ({
    total,
    theme,
    loading,
}) => {
    const { t } = useTranslation();
    return (
        <View
            style={[
                appStyles.justifyContentBetween,
                appStyles.alignItemsCenter,
                appStyles.flexRow,
                appStyles.pT15,
                {
                    borderTopWidth: 0.6,
                    borderTopColor: theme.colors.outline_outine,
                },
            ]}>
            <View>
                <AppText
                    titleWithI18n={LanguageKey.confirm_claim_total_claim}
                    variant={TextVariantKeys.titleSmall}
                    textColor={theme.colors.text_on_surface_text_highest}
                />
                <AppText
                    title={`(${t(LanguageKey.confirm_claim_JETTON_token)})`}
                    variant={TextVariantKeys.bodyRSmall}
                    textColor={theme.colors.text_on_surface_text_highest}
                    styles={appStyles.pV10}
                />
            </View>
            <LoadingWrapper
                loading={loading}
                skeletonWidth={100}
                skeletonHeight={15}>
                <AppText
                    title={total?.toString()}
                    variant={TextVariantKeys.titleSmall}
                    textColor={appColors.main.tokyoRed}
                />
            </LoadingWrapper>
        </View>
    );
};

export const ProjectInformation: React.FC<ProjectInformationProps> = ({
    theme,
    project_name,
    wallet_1,
    recipient_address,
}) => {
    const styles = useStyles(theme);
    return (
        <View style={styles.project}>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                ]}>
                <AppText
                    titleWithI18n={LanguageKey.confirm_claim_project_name}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={theme.colors.text_on_surface_text_light}
                />
                <AppText
                    title={project_name}
                    variant={TextVariantKeys.titleSmall}
                    textColor={theme.colors.text_on_surface_text_highest}
                />
            </View>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                ]}>
                <AppText
                    titleWithI18n={LanguageKey.confirm_claim_recipient_address}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={theme.colors.text_on_surface_text_light}
                />
                <AppText
                    title={WalletUtils.getShortAddress(recipient_address)}
                    variant={TextVariantKeys.bodyMLarge}
                    textColor={theme.colors.text_on_surface_text_highest}
                />
            </View>
        </View>
    );
};

export const ProjectDetailChild: React.FC<ProjectDetailChildProps> = ({
    theme,
    dataClaimable,
    dataGetOwned,
    loading,
    totalClaim,
    insets,
}) => {
    const styles = useStyles(theme);
    return (
        <View style={styles.project}>
            <FlatList
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                data={dataGetOwned as OwnedNFTType[]}
                renderItem={({ item }) => (
                    <RenderPriceFeedNew
                        item={item}
                        theme={theme}
                        dataClaimable={dataClaimable}
                        insets={insets}
                        loading={loading}
                        inHome={true}
                    />
                )}
                keyExtractor={(item, index) => item._id}
                ListEmptyComponent={
                    <View style={[appStyles.center]}>
                        <View style={[appStyles.mt30, appStyles.mbt10]}>
                            <EmptyTransactionSvgIcon
                                color={appColors.neutral.n600}
                            />
                        </View>
                        <AppText
                            titleWithI18n={
                                LanguageKey.claim_token_detail_empty_title
                            }
                            textColor={theme.colors.text_on_surface_text_medium}
                            variant={TextVariantKeys.bodyRMedium}
                        />
                    </View>
                }
                ListFooterComponent={
                    <TotalClaimingFooter
                        total={totalClaim}
                        theme={theme}
                        loading={loading}
                    />
                }
            />
        </View>
    );
};

export const RenderPriceFeedNew: React.FC<RenderPriceFeedNewProps> = ({
    item,
    theme,
    dataClaimable,
    insets,
    loading = true,
    inHome = false,
}) => {
    const projectDetailStyles = containerStyles(theme, insets);

    return (
        <View style={[appStyles.flexRow, appStyles.mv10]}>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flex1,
                    appStyles.flexRow,
                ]}>
                <View
                    style={[appStyles.justifyContentBetween, appStyles.flex1]}>
                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={150}
                        skeletonHeight={15}>
                        <View
                            style={[
                                appStyles.flexRow,
                                appStyles.alignItemsCenter,
                            ]}>
                            <AppText
                                title={`#${item?.nftId}`}
                                variant={TextVariantKeys.bodyMLarge}
                                textColor={
                                    !inHome
                                        ? appColors.main.tokyoRed
                                        : theme.colors.text_on_surface_text_high
                                }
                                maxFontSizeMultiplier={1.2}
                                numberOfLines={1}
                            />
                            {dataClaimable?.projectNftProtocol?.name && (
                                <View
                                    style={[
                                        appStyles.ml5,
                                        dataClaimable?.projectNftProtocol?.name
                                            ?.length > 16
                                            ? projectDetailStyles.protocolNFTViewContainer
                                            : undefined,
                                    ]}>
                                    <ProtocolNFTView
                                        loading={loading}
                                        theme={theme}
                                        protocol_name={
                                            dataClaimable?.projectNftProtocol
                                                ?.name
                                        }
                                        project_image={
                                            dataClaimable?.projectNftProtocol
                                                ?.logo as string
                                        }
                                    />
                                </View>
                            )}
                        </View>
                    </LoadingWrapper>

                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={100}
                        skeletonHeight={15}>
                        <AppText
                            title={dataClaimable?.projectNFT?.name}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={theme.colors.text_on_surface_text_light}
                            styles={appStyles.mt5}
                            numberOfLines={1}
                            maxFontSizeMultiplier={1.2}
                        />
                    </LoadingWrapper>
                </View>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={50}
                    containerSkeleton={appStyles.ml10}
                    skeletonHeight={15}>
                    <View>
                        <AppText
                            title={`${Utils.formattedAmountClaim(item?.amount)}`}
                            variant={TextVariantKeys.bodyMLarge}
                            textColor={appColors.main.tokyoRed}
                            styles={[appStyles.textAlignRight]}
                            numberOfLines={1}
                            maxFontSizeMultiplier={1.2}
                        />
                        <AppText
                            title={dataClaimable?.projectToken?.symbol}
                            variant={TextVariantKeys.bodyMLarge}
                            textColor={theme.colors.text_on_surface_text_high}
                            styles={[appStyles.textAlignRight]}
                            numberOfLines={1}
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>
                </LoadingWrapper>
            </View>
        </View>
    );
};

export const LoadingListPriceFeedView: React.FC<
    LoadingListPriceFeedViewProps
> = ({ isLoading, refreshing, onRefresh }) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);

    const renderItemLoading = () => {
        return (
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.mv10,
                    styles.containerLoading,
                    appStyles.pV10,
                    appStyles.alignItemsCenter,
                    appStyles.justifyContentBetween,
                    appStyles.flex1,
                ]}>
                <View
                    style={[
                        appStyles.justifyContentBetween,
                        appStyles.alignItemsCenter,
                        appStyles.flexRow,
                        appStyles.flex1,
                    ]}>
                    <View>
                        <View
                            style={[
                                appStyles.flex5,
                                appStyles.pH10,
                                appStyles.flexRow,
                                appStyles.justifyContentBetween,
                                appStyles.alignItemsCenter,
                                appStyles.flex1,
                                appStyles.fullWidth,
                            ]}>
                            <View
                                style={[
                                    appStyles.flexRow,
                                    appStyles.alignItemsCenter,
                                ]}>
                                <LoadingWrapper
                                    loading={true}
                                    skeletonWidth={100}
                                    skeletonHeight={20}>
                                    <View />
                                </LoadingWrapper>
                            </View>

                            <LoadingWrapper
                                loading={true}
                                skeletonWidth={73}
                                containerSkeleton={appStyles.ml10}
                                skeletonHeight={20}>
                                <View />
                            </LoadingWrapper>
                        </View>
                        <View
                            style={[
                                appStyles.flex5,
                                appStyles.pH10,
                                appStyles.flexRow,
                                appStyles.justifyContentBetween,
                                appStyles.alignItemsCenter,
                                appStyles.flex1,
                                appStyles.fullWidth,
                                appStyles.pT10,
                            ]}>
                            <LoadingWrapper
                                loading={true}
                                skeletonWidth={140}
                                skeletonHeight={20}>
                                <View />
                            </LoadingWrapper>

                            <LoadingWrapper
                                loading={true}
                                skeletonWidth={40}
                                skeletonHeight={20}>
                                <View />
                            </LoadingWrapper>
                        </View>
                    </View>
                </View>
            </View>
        );
    };
    const getView = () => {
        if (!isLoading) {
            return (
                <View style={[appStyles.center, appStyles.pT30]}>
                    <View style={[appStyles.mt30, appStyles.mbt10]}>
                        <NotFoundSvgIcon />
                    </View>
                    <AppText
                        titleWithI18n={LanguageKey.No_asset_found_title}
                        textColor={theme.colors.text_on_surface_text_medium}
                        variant={TextVariantKeys.bodyRMedium}
                    />
                </View>
            );
        }
        return (
            <View
                style={[
                    appStyles.flex1,
                    styles.containerLoading,
                    appStyles.mt10,
                ]}>
                <FlatList
                    data={[1, 2, 3]}
                    renderItem={renderItemLoading}
                    scrollEnabled={false}
                />
            </View>
        );
    };

    return getView();
};
