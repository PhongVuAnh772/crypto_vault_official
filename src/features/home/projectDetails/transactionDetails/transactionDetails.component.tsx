import React from 'react';
import {
    FlatList,
    Image,
    Pressable,
    TouchableOpacity,
    View,
} from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import {
    ArrowForward2SvgIcon,
    Copy2SvgIcon,
    EmptyTransactionSvgIcon,
    NextSvgIcon,
    ToastWarningSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { LoadingWrapper } from '../../bottomTab/explore/explore.component';
import { TotalClaimingFooter } from '../confirm/confirmClaimToken.component';
import {
    useStyles as confirmClaimTokenStyles,
    useStyles,
} from '../confirm/confirmClaimToken.style';
import { ProjectDetailChildProps } from '../confirm/confirmClaimToken.type';
import { renderNFTTransactionDetails } from '../details/projectDetails.component';
import {
    ProjectInformationTransactionProps,
    WarningTransactionStatusProps,
} from './transactionDetails.type';

export const ProjectInformationTransaction: React.FC<
    ProjectInformationTransactionProps
> = ({
    projectName,
    wallet_1,
    recipientAddress,
    theme,
    protocolName,
    protocolImage,
    dateTransaction,
    transactionHash,
    handleCopy,
    handleViewOnScan,
    loading,
}) => {
    const styles = confirmClaimTokenStyles(theme);
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    return (
        <View style={styles.project}>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                ]}>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={80}
                    skeletonHeight={15}>
                    <AppText
                        titleWithI18n={LanguageKey.confirm_claim_project_name}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_light}
                        styles={appStyles.flex1}
                        numberOfLines={2}
                        maxFontSizeMultiplier={1.2}
                    />
                </LoadingWrapper>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={90}
                    skeletonHeight={15}>
                    <AppText
                        title={projectName}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_highest}
                        styles={[appStyles.flex1, appStyles.textAlignRight]}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.2}
                    />
                </LoadingWrapper>
            </View>

            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                    appStyles.pT10,
                ]}>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={120}
                    skeletonHeight={15}>
                    <AppText
                        titleWithI18n={
                            LanguageKey.confirm_claim_recipient_address
                        }
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_light}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.2}
                    />
                </LoadingWrapper>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={110}
                    skeletonHeight={15}>
                    <AppText
                        title={WalletUtils.getShortMoreAddress(
                            recipientAddress,
                        )}
                        variant={TextVariantKeys.bodyMLarge}
                        textColor={theme.colors.text_on_surface_text_highest}
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.2}
                    />
                </LoadingWrapper>
            </View>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                    appStyles.pT10,
                ]}>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={60}
                    skeletonHeight={15}>
                    <AppText
                        titleWithI18n={LanguageKey.common_protocol}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_light}
                        maxFontSizeMultiplier={1.2}
                    />
                </LoadingWrapper>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={100}
                    skeletonHeight={15}>
                    <View
                        style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                        <Image
                            source={{ uri: protocolImage ?? '' }}
                            style={styles.imageToken}
                        />

                        <AppText
                            title={protocolName}
                            variant={TextVariantKeys.bodyMLarge}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                            styles={appStyles.ml5}
                            maxFontSizeMultiplier={1.2}
                        />
                    </View>
                </LoadingWrapper>
            </View>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                    appStyles.pT10,
                ]}>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={30}
                    skeletonHeight={15}>
                    <AppText
                        titleWithI18n={LanguageKey.common_text_date}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={theme.colors.text_on_surface_text_light}
                        maxFontSizeMultiplier={1.2}
                    />
                </LoadingWrapper>
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={120}
                    skeletonHeight={15}>
                    <AppText
                        title={dateTransaction}
                        variant={TextVariantKeys.bodyMLarge}
                        textColor={theme.colors.text_on_surface_text_highest}
                        maxFontSizeMultiplier={1.2}
                    />
                </LoadingWrapper>
            </View>
            {transactionHash ? (
                <View
                    style={[
                        appStyles.justifyContentBetween,
                        appStyles.alignItemsCenter,
                        appStyles.flexRow,
                        appStyles.pT10,
                    ]}>
                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={150}
                        skeletonHeight={15}>
                        <AppText
                            titleWithI18n={
                                LanguageKey.common_text_transaction_hash
                            }
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={theme.colors.text_on_surface_text_light}
                            styles={appStyles.flex1}
                            numberOfLines={1}
                            maxFontSizeMultiplier={1.2}
                        />
                    </LoadingWrapper>
                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={80}
                        skeletonHeight={15}>
                        <View
                            style={[
                                appStyles.flexRow,
                                appStyles.alignItemsCenter,
                            ]}>
                            <AppText
                                title={WalletUtils.getShortMoreAddress(
                                    transactionHash,
                                )}
                                variant={TextVariantKeys.bodyMLarge}
                                textColor={
                                    theme.colors.text_on_surface_text_highest
                                }
                                numberOfLines={1}
                                maxFontSizeMultiplier={1.2}
                            />
                            <Pressable
                                style={[appStyles.ml5, appStyles.center]}
                                onPress={handleCopy}>
                                <Copy2SvgIcon />
                            </Pressable>
                        </View>
                    </LoadingWrapper>
                </View>
            ) : (
                <View
                    style={[
                        appStyles.justifyContentBetween,
                        appStyles.alignItemsCenter,
                        appStyles.flexRow,
                        appStyles.pT10,
                    ]}>
                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={80}
                        skeletonHeight={15}>
                        <AppText
                            titleWithI18n={
                                LanguageKey.common_text_transaction_hash
                            }
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={theme.colors.text_on_surface_text_light}
                            styles={appStyles.flex1}
                            numberOfLines={1}
                            maxFontSizeMultiplier={1.2}
                        />
                    </LoadingWrapper>
                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={80}
                        skeletonHeight={15}>
                        <AppText
                            titleWithI18n={LanguageKey.common_text_processing}
                            variant={TextVariantKeys.bodyMLarge}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                            numberOfLines={1}
                            maxFontSizeMultiplier={1.2}
                        />
                    </LoadingWrapper>
                </View>
            )}

            {transactionHash && (
                <LoadingWrapper
                    loading={loading}
                    skeletonWidth={80}
                    containerSkeleton={[appStyles.center, appStyles.mt15]}
                    skeletonHeight={15}>
                    <TouchableOpacity
                        onPress={handleViewOnScan}
                        style={styles.titleWithValueContainer}>
                        <View
                            style={[
                                appStyles.flexRow,
                                appStyles.flex1,
                                appStyles.center,
                            ]}>
                            <AppText
                                titleWithI18n={LanguageKey.common_view_on_scan}
                                variant={TextVariantKeys.titleSmall}
                                textColor={theme.colors.surface_surface_brand}
                            />
                            <View style={appStyles.ml5}>
                                {newUI ? (
                                    <NextSvgIcon />
                                ) : (
                                    <ArrowForward2SvgIcon />
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </LoadingWrapper>
            )}
        </View>
    );
};

export const ProjectInformationTransactionProcessing: React.FC<
    ProjectInformationTransactionProps
> = ({
    projectName,
    wallet_1,
    recipientAddress,
    theme,
    protocolName,
    protocolImage,
    dateTransaction,
    transactionHash,
    handleCopy,
    handleViewOnScan,
    actionNavigatingSeeMoreScreen,
}) => {
    const styles = confirmClaimTokenStyles(theme);
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
                    styles={appStyles.flex1}
                    numberOfLines={1}
                />
                <AppText
                    title={projectName}
                    variant={TextVariantKeys.titleSmall}
                    textColor={theme.colors.text_on_surface_text_highest}
                    styles={[appStyles.flex1, appStyles.textAlignRight]}
                    numberOfLines={2}
                    maxFontSizeMultiplier={1.2}
                />
            </View>

            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                    appStyles.pT10,
                ]}>
                <AppText
                    titleWithI18n={LanguageKey.confirm_claim_recipient_address}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={theme.colors.text_on_surface_text_light}
                    numberOfLines={1}
                />
                <AppText
                    title={WalletUtils.getShortMoreAddress(recipientAddress)}
                    variant={TextVariantKeys.bodyMLarge}
                    textColor={theme.colors.text_on_surface_text_highest}
                    numberOfLines={1}
                />
            </View>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                    appStyles.pT10,
                ]}>
                <AppText
                    titleWithI18n={LanguageKey.common_protocol}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={theme.colors.text_on_surface_text_light}
                />
                <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                    <Image
                        source={{ uri: protocolImage ?? '' }}
                        style={styles.imageToken}
                    />

                    <AppText
                        title={protocolName}
                        variant={TextVariantKeys.bodyMLarge}
                        textColor={theme.colors.text_on_surface_text_highest}
                        styles={appStyles.ml5}
                    />
                </View>
            </View>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                    appStyles.pT10,
                ]}>
                <AppText
                    titleWithI18n={LanguageKey.common_text_date}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={theme.colors.text_on_surface_text_light}
                />
                <AppText
                    title={dateTransaction}
                    variant={TextVariantKeys.bodyMLarge}
                    textColor={theme.colors.text_on_surface_text_highest}
                />
            </View>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    appStyles.flexRow,
                    appStyles.pT10,
                ]}>
                <AppText
                    titleWithI18n={LanguageKey.common_text_transaction_hash}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={theme.colors.text_on_surface_text_light}
                    styles={appStyles.flex1}
                    numberOfLines={1}
                />

                <AppText
                    titleWithI18n={LanguageKey.common_text_processing}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={theme.colors.text_on_surface_text_highest}
                    styles={[appStyles.flex1, appStyles.textAlignRight]}
                    numberOfLines={1}
                />
            </View>
        </View>
    );
};

export const WarningTransactionStatus: React.FC<
    WarningTransactionStatusProps
> = ({ theme, text }) => {
    const styles = useStyles(theme);
    return (
        <View style={[styles.warningContainer, appStyles.flexRow]}>
            <ToastWarningSvgIcon />
            <View style={appStyles.flex1}>
                <AppText
                    titleWithI18n={text}
                    variant={TextVariantKeys.titleSmall}
                    styles={appStyles.pL15}
                    maxFontSizeMultiplier={1.2}
                />
            </View>
        </View>
    );
};

export const TransactionDetailChild: React.FC<ProjectDetailChildProps> = ({
    theme,
    dataClaimable,
    dataGetOwned,
    loading,
    totalClaim,
    enableVerticalScrollBar = false,
    actionNavigatingSeeMoreScreen,
}) => {
    const styles = useStyles(theme);
    return (
        <View style={styles.projectDetails}>
            <FlatList
                bounces={false}
                showsVerticalScrollIndicator={enableVerticalScrollBar}
                nestedScrollEnabled
                data={dataGetOwned}
                renderItem={({ item }) =>
                    renderNFTTransactionDetails(
                        item,
                        theme,
                        dataClaimable,
                        loading,
                        true,
                    )
                }
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
            />

            <TotalClaimingFooter
                total={totalClaim}
                theme={theme}
                loading={loading}
                enableToken={dataClaimable?.projectToken?.symbol}
            />
        </View>
    );
};

export const TransactionDetailProjectChild: React.FC<
    ProjectDetailChildProps
> = ({
    theme,
    dataClaimable,
    dataGetOwned,
    actionNavigatingSeeMoreScreen,
    loading,
    totalClaim,
    totalInAllTransaction,
    enableToken,
}) => {
    const styles = useStyles(theme);
    const newUI = GlobalUtils.getEnableRedXNewTheme();

    return (
        <View style={styles.projectDetailHistory}>
            {dataGetOwned && (
                <FlatList
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                    bounces={false}
                    data={dataGetOwned.slice(0, 3)}
                    renderItem={({ item }) =>
                        renderNFTTransactionDetails(
                            item,
                            theme,
                            dataClaimable,
                            loading,
                            true,
                        )
                    }
                />
            )}

            <TouchableOpacity
                style={styles.titleViewMoreContainer}
                onPress={actionNavigatingSeeMoreScreen}>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.flex1,
                        appStyles.center,
                        appStyles.pV10,
                    ]}>
                    <LoadingWrapper
                        loading={loading}
                        skeletonWidth={80}
                        containerSkeleton={appStyles.ml10}
                        skeletonHeight={25}>
                        <AppText
                            titleWithI18n={LanguageKey.project_details_see_more}
                            variant={TextVariantKeys.titleSmall}
                            textColor={theme.colors.surface_surface_brand}
                        />
                        <View style={appStyles.ml5}>
                            {newUI ? <NextSvgIcon /> : <ArrowForward2SvgIcon />}
                        </View>
                    </LoadingWrapper>
                </View>
            </TouchableOpacity>
            <TotalClaimingFooter
                total={totalInAllTransaction ?? 0}
                theme={theme}
                loading={loading}
                enableToken={enableToken}
            />
        </View>
    );
};
