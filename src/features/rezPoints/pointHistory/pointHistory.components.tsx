import * as Clipboard from 'expo-clipboard';
import { t } from 'i18next';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import {
    CoinRezPointSvgIcon,
    Copy3SvgIcon,
} from 'src/core/constants/AppIconsSvg';
import AppToastType from 'src/core/enum/AppToastType';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import {
    StatusTransaction,
    TransactionHistory,
    TypeTransaction,
} from 'src/core/redux/slice/rezPoint/rezPoint.type';
import appStyles from 'src/core/styles';
import {
    default as commonUtils,
    default as Utils,
} from 'src/core/utils/commonUtils';
import { rezPointUtils } from 'src/core/utils/rezPoint';
import WalletUtils from 'src/core/utils/walletUtils';
import styles from './pointHistory.style';

const _border = 4;

export const TransactionHistoryItem: React.FC<{
    item: TransactionHistory;
    currentIndex: number;
    lastItem: boolean;
}> = ({ item, currentIndex, lastItem }) => {
    const { amount, createdAt } = item;

    const isBorderTop = currentIndex === 0;
    const isMinus = amount < 0;
    const amountShow = `${isMinus ? '' : '+'}${rezPointUtils.formatPointOriginal(amount)}`;
    const symbol = 'REZ';

    const handleCopy = () => {
        Clipboard.setStringAsync(item.transactionId);
        Utils.showToast({
            msg: t(LanguageKey.common_copied),
            type: AppToastType.success,
        });
    };

    return (
        <TouchableOpacity activeOpacity={0.5} onPress={handleCopy}>
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.flex1,
                    appStyles.pd16,
                    appStyles.alignItemsCenter,
                    appStyles.backgroundWhite,
                    {
                        borderTopLeftRadius: isBorderTop ? _border : 0,
                        borderTopRightRadius: isBorderTop ? _border : 0,
                        borderBottomLeftRadius: lastItem ? _border : 0,
                        borderBottomRightRadius: lastItem ? _border : 0,
                    },
                ]}>
                <View>
                    <CoinRezPointSvgIcon />
                </View>

                <View style={appStyles.ml12}>
                    <View style={appStyles.flexRow}>
                        <TypeText type={item.type} />
                        <View style={appStyles.ml5}>
                            <StatusBox status={item.status} />
                        </View>
                    </View>
                    <View
                        style={[
                            appStyles.mt5,
                            appStyles.flexRow,
                            appStyles.alignItemsCenter,
                        ]}>
                        <AppText
                            title={`TxID: ${WalletUtils.getShortAddress(item?.transactionId)}`}
                            variant={TextVariantKeys.labelTiny}
                            maxFontSizeMultiplier={1.4}
                            textColor={appColors.neutral.n500}
                        />
                        <Copy3SvgIcon
                            width={11}
                            height={11}
                            style={appStyles.ml5}
                            color={appColors.neutral.n500}
                        />
                    </View>
                </View>
                <View style={[appStyles.flex1]}>
                    <View
                        style={[
                            appStyles.justifyContentEnd,
                            appStyles.flex1,
                            appStyles.flexRow,
                            appStyles.alignItemsEnd,
                            appStyles.flexWrap,
                        ]}>
                        <AppText
                            title={amountShow}
                            variant={TextVariantKeys.titleSmall}
                            maxFontSizeMultiplier={1.4}
                            styles={[appStyles.textAlignRight]}
                            textColor={
                                isMinus
                                    ? appColors.functional.warning
                                    : appColors.functional.green
                            }
                        />
                        <AppText
                            title={symbol}
                            variant={TextVariantKeys.labelTiny}
                            maxFontSizeMultiplier={1.4}
                            styles={[appStyles.textAlignRight, appStyles.ml5]}
                            textColor={appColors.neutral.black}
                        />
                    </View>
                    <View style={[appStyles.flex1, appStyles.mt5]}>
                        <AppText
                            title={commonUtils.getTimeByDate(createdAt)}
                            variant={TextVariantKeys.bodyRSmall}
                            maxFontSizeMultiplier={1.4}
                            styles={[appStyles.textAlignRight]}
                            textColor={appColors.neutral.n400}
                        />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};
export const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
    return (
        <View style={[appStyles.mt15, appStyles.mbt8]}>
            <AppText
                title={commonUtils.convertDate(title)}
                variant={TextVariantKeys.bodyMSmall}
                maxFontSizeMultiplier={1.4}
                styles={[appStyles.textAlignLeft]}
                textColor={appColors.neutral.n500}
            />
        </View>
    );
};

export const StatusBox: React.FC<StatusTransaction> = ({ status }) => {
    switch (status) {
        case 'CANCELLED':
            return (
                <View style={styles.cancelledBox}>
                    <AppText
                        title={t(LanguageKey.common_status_cancelled)}
                        variant={TextVariantKeys.labelTiny}
                        maxFontSizeMultiplier={1.4}
                        styles={[appStyles.textAlignCenter]}
                        textColor={appColors.functional.yellow}
                    />
                </View>
            );
        case 'FAILED':
            return (
                <View style={styles.failBox}>
                    <AppText
                        title={t(LanguageKey.common_status_failed)}
                        variant={TextVariantKeys.labelTiny}
                        maxFontSizeMultiplier={1.4}
                        styles={[appStyles.textAlignCenter]}
                        textColor={appColors.neutral.n600}
                    />
                </View>
            );
        case 'REVOKED':
            return (
                <View style={styles.revokedBox}>
                    <AppText
                        title={t(LanguageKey.common_status_revoked)}
                        variant={TextVariantKeys.labelTiny}
                        maxFontSizeMultiplier={1.4}
                        styles={[appStyles.textAlignCenter]}
                        textColor={appColors.functional.warning}
                    />
                </View>
            );
        case 'SUCCESS':
            return (
                <View style={styles.successBox}>
                    <AppText
                        title={t(LanguageKey.common_status_success)}
                        variant={TextVariantKeys.labelTiny}
                        maxFontSizeMultiplier={1.4}
                        styles={[appStyles.textAlignCenter]}
                        textColor={appColors.functional.green}
                    />
                </View>
            );
        default:
            return null;
    }
};
export const TypeText: React.FC<TypeTransaction> = ({ type }) => {
    switch (type) {
        case 'purchase':
            return (
                <AppText
                    title={t(LanguageKey.rez_point_purchase)}
                    variant={TextVariantKeys.bodyMMedium}
                    maxFontSizeMultiplier={1.4}
                    styles={[appStyles.textAlignLeft]}
                    textColor={appColors.neutral.n800}
                />
            );
        case 'top-up':
            return (
                <AppText
                    title={t(LanguageKey.rez_point_top_up)}
                    variant={TextVariantKeys.bodyMMedium}
                    maxFontSizeMultiplier={1.4}
                    styles={[appStyles.textAlignLeft]}
                    textColor={appColors.neutral.n800}
                />
            );
        case 'transfer':
            return (
                <AppText
                    title={t(LanguageKey.rez_point_transfer)}
                    variant={TextVariantKeys.bodyMMedium}
                    maxFontSizeMultiplier={1.4}
                    styles={[appStyles.textAlignLeft]}
                    textColor={appColors.neutral.n800}
                />
            );
        case 'minting':
            return (
                <AppText
                    title={t(LanguageKey.rez_point_minting)}
                    variant={TextVariantKeys.bodyMMedium}
                    maxFontSizeMultiplier={1.4}
                    styles={[appStyles.textAlignLeft]}
                    textColor={appColors.neutral.n800}
                />
            );
        default:
            return null;
    }
};
const TitleLoading = () => {
    return (
        <View style={[appStyles.mbt10, appStyles.mt15]}>
            <AppSkeletonLoading width={82} height={24} />
        </View>
    );
};
const LoadingItem = ({
    index,
    lastItem,
}: {
    index: number;
    lastItem: boolean;
}) => {
    const isBorderTop = index === 0;

    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                appStyles.justifyContentBetween,
                appStyles.backgroundWhite,
                appStyles.pd16,
                {
                    borderTopLeftRadius: isBorderTop ? _border : 0,
                    borderTopRightRadius: isBorderTop ? _border : 0,
                    borderBottomLeftRadius: lastItem ? _border : 0,
                    borderBottomRightRadius: lastItem ? _border : 0,
                },
            ]}>
            <View style={appStyles.iconCircleSize32}>
                <AppSkeletonLoading width={28} height={28} radius={100} />
            </View>
            <View style={[appStyles.flex1, appStyles.ml10]}>
                <View style={[appStyles.flexRow, appStyles.mbt10]}>
                    <AppSkeletonLoading width={60} height={20} />
                </View>
                <AppSkeletonLoading width={120} height={20} />
            </View>
            <View style={appStyles.alignItemsEnd}>
                <View style={[appStyles.flexRow, appStyles.mbt10]}>
                    <AppSkeletonLoading width={50} height={20} />
                </View>
                <AppSkeletonLoading width={70} height={20} />
            </View>
        </View>
    );
};
export const SkeletonLoadingList: React.FC = () => {
    return (
        <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false}>
            {/* Section 1: 2 items */}
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                ]}>
                <TitleLoading />
            </View>
            <View>
                {[...Array(2)].map((_, index) => (
                    <LoadingItem
                        key={`section-1-item-${index.toString()}`}
                        index={index}
                        lastItem={index === 1}
                    />
                ))}
            </View>

            {/* Section 2: 4 items */}
            <TitleLoading />
            <View>
                {[...Array(4)].map((_, index) => (
                    <LoadingItem
                        key={`section-1-item-${index.toString()}`}
                        index={index}
                        lastItem={index === 3}
                    />
                ))}
            </View>

            {/* Section 3: 2 items */}
            <TitleLoading />
            <View>
                {[...Array(2)].map((_, index) => (
                    <LoadingItem
                        key={`section-1-item-${index.toString()}`}
                        index={index}
                        lastItem={index === 1}
                    />
                ))}
            </View>
        </ScrollView>
    );
};
