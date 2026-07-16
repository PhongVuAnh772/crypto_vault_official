import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    RefreshControl,
    ScrollView,
    TouchableOpacity,
    View,
} from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import {
    ClaimedSvgIcon,
    EmptySvgIcon,
    EmptyTransactionSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import Utils from 'src/core/utils/commonUtils';
import DateTimeUtils from 'src/core/utils/dateTimeUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { LoadingWrapper } from '../../bottomTab/explore/explore.component';
import { ClaimableType } from '../../bottomTab/explore/explore.type';
import { useTabStyles } from '../index.style';
import { transactionStyles } from './transactionProject.style';
import {
    EmptyHistoryProps,
    LoadingListTransactionProps,
} from './transactionProject.type';

export const LoadingListTransaction: React.FC<LoadingListTransactionProps> = ({
    isLoading,
    refreshing,
    onRefresh,
}) => {
    const theme = useAppTheme();

    const getView = () => {
        if (!isLoading) {
            return (
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.text_on_surface_text_high}
                            colors={[theme.colors.text_on_surface_text_high]}
                        />
                    }
                    style={{ height: Utils.screenHeight }}>
                    <View style={[appStyles.center]}>
                        <View style={[appStyles.mt30, appStyles.mbt10]}>
                            <EmptyTransactionSvgIcon
                                color={appColors.neutral.n600}
                            />
                        </View>
                        <AppText
                            titleWithI18n={
                                LanguageKey.transaction_detail_empty_title
                            }
                            textColor={theme.colors.text_on_surface_text_medium}
                            variant={TextVariantKeys.bodyRMedium}
                        />
                    </View>
                </ScrollView>
            );
        }
        return (
            <View style={[appStyles.flex1]}>
                <LoadingTransactionListWrapper theme={theme} />
                <View style={appStyles.pT10}>
                    <LoadingTransactionListWrapper theme={theme} />
                </View>
                <View style={appStyles.pT10}>
                    <LoadingTransactionListWrapper theme={theme} />
                </View>
                <View style={appStyles.pT10}>
                    <LoadingTransactionListWrapper theme={theme} />
                </View>
            </View>
        );
    };

    return getView();
};

export const EmptyTransactionClaim: React.FC<EmptyHistoryProps> = ({
    theme,
}) => {
    const styles = transactionStyles(theme);
    return (
        <View style={styles.emptyContainer}>
            <EmptySvgIcon color={appColors.neutral.n600} />
            <AppText
                titleWithI18n={LanguageKey.transaction_detail_empty_title}
                textColor={theme.colors.text_on_surface_text_medium}
                variant={TextVariantKeys.titleLarge}
                styles={styles.emptyTitle}
                numberOfLines={1}
            />
        </View>
    );
};

export const RenderItemTransaction: React.FC<{
    item: TransactionHistoryDataType;
    navigateToClaimDetail: (item: TransactionHistoryDataType) => void;
    dataClaimable: ClaimableType | null;
    theme: AppThemeType;
}> = ({ item, navigateToClaimDetail, dataClaimable, theme }) => {
    const styles = useTabStyles(theme);
    const { t } = useTranslation();
    return (
        <TouchableOpacity
            onPress={() => navigateToClaimDetail(item)}
            key={item?.txHash}
            style={[styles.itemHistoryContainer]}>
            <View style={[appStyles.justifyContentBetween, appStyles.flex1]}>
                <View
                    style={[
                        appStyles.justifyContentBetween,
                        appStyles.flexRow,
                    ]}>
                    <View
                        style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                        <View style={styles.icon}>
                            <ClaimedSvgIcon />
                        </View>
                        <View style={[appStyles.pL10]}>
                            <AppText
                                titleWithI18n={LanguageKey.common_text_claimed}
                                variant={TextVariantKeys.bodyMMedium}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }
                                maxFontSizeMultiplier={1.2}
                            />
                            {item.tokenReceiverWalletAddress && (
                                <AppText
                                    title={`${t(LanguageKey.common_text_to)}: ${WalletUtils.getShortAddress(item.tokenReceiverWalletAddress)}`}
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor={
                                        theme.colors.text_on_surface_text_light
                                    }
                                    maxFontSizeMultiplier={1.2}
                                    styles={appStyles.mt10}
                                />
                            )}
                        </View>
                    </View>

                    <View style={[]}>
                        <AppText
                            titleWithI18n={`${Utils.formattedAmountClaim(
                                item.amount ?? 0,
                            )} ${dataClaimable?.projectToken?.symbol ?? ''}`}
                            variant={TextVariantKeys.bodyRSmall}
                            textColor={appColors.functional.green}
                            maxFontSizeMultiplier={1.2}
                            styles={[appStyles.textAlignRight]}
                        />

                        {item.createdAt && (
                            <AppText
                                titleWithI18n={`${DateTimeUtils.formatTimeWithTimezone(item.createdAt, 'h:mm A')}`}
                                variant={TextVariantKeys.bodyRSmall}
                                textColor={
                                    theme.colors.text_on_surface_text_lightest
                                }
                                maxFontSizeMultiplier={1.2}
                                styles={[
                                    appStyles.mt10,
                                    appStyles.textAlignRight,
                                ]}
                            />
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const LoadingTransactionListWrapper: React.FC<EmptyHistoryProps> = ({
    theme,
}) => {
    return (
        <>
            <LoadingWrapper
                loading={true}
                skeletonWidth={100}
                skeletonHeight={20}>
                <View />
            </LoadingWrapper>
            <LoadingWrapper
                loading={true}
                skeletonWidth={'100%'}
                containerSkeleton={appStyles.mt10}
                skeletonHeight={20}>
                <View />
            </LoadingWrapper>
            <LoadingWrapper
                loading={true}
                skeletonWidth={'100%'}
                containerSkeleton={appStyles.mt10}
                skeletonHeight={20}>
                <View />
            </LoadingWrapper>
        </>
    );
};
