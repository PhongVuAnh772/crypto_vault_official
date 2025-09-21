import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import {
    ArrowForward2SvgIcon,
    Copy2SvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import DateTimeUtils from 'src/core/utils/dateTimeUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import useStyles from './transactionDetails.styles';
import { DefaultTransactionViewType } from './transactionDetails.type';

const LoadingTransactionDetails: React.FC = () => {
    const insets = useSafeAreaInsets();
    const theme = useAppTheme();
    const styles = useStyles(theme, insets);
    const newUIColors = [
        appColors.neutral.n300,
        appColors.other.outline_lightest,
        appColors.other.outline_lightest,
        appColors.other.outline_lightest,
        appColors.neutral.n300,
        appColors.other.outline_lightest,
        appColors.neutral.n300,
    ];
    return (
        <>
            <View style={styles.loadingContainer}>
                <AppSkeletonLoading
                    width={43}
                    height={63}
                    radius={10}
                    colors={newUIColors}
                />
                <View style={[appStyles.mt12, appStyles.center]}>
                    <AppSkeletonLoading
                        width={63}
                        height={24}
                        radius={10}
                        colors={newUIColors}
                    />
                    <View
                        style={[
                            appStyles.mt25,
                            styles.contentLoadingContainer,
                        ]}>
                        <View>
                            <View
                                style={[
                                    appStyles.alignItemsCenter,
                                    appStyles.justifyContentBetween,
                                    appStyles.flexRow,
                                    appStyles.pB15,
                                ]}>
                                <AppSkeletonLoading
                                    width={100}
                                    height={24}
                                    radius={10}
                                    colors={newUIColors}
                                />
                                <View>
                                    <AppSkeletonLoading
                                        width={100}
                                        height={24}
                                        radius={10}
                                        colors={newUIColors}
                                    />
                                    <View style={appStyles.pT5}>
                                        <AppSkeletonLoading
                                            width={100}
                                            height={24}
                                            radius={10}
                                            colors={newUIColors}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View
                                style={[
                                    appStyles.alignItemsCenter,
                                    appStyles.justifyContentBetween,
                                    appStyles.flexRow,
                                    appStyles.pB20,
                                    appStyles.pT15,
                                ]}>
                                <AppSkeletonLoading
                                    width={100}
                                    height={24}
                                    radius={10}
                                    colors={newUIColors}
                                />
                                <AppSkeletonLoading
                                    width={100}
                                    height={24}
                                    radius={10}
                                    colors={newUIColors}
                                />
                            </View>
                            <View
                                style={[
                                    appStyles.alignItemsCenter,
                                    appStyles.justifyContentBetween,
                                    appStyles.flexRow,
                                    appStyles.pB20,
                                ]}>
                                <AppSkeletonLoading
                                    width={100}
                                    height={24}
                                    radius={10}
                                    colors={newUIColors}
                                />
                                <AppSkeletonLoading
                                    width={100}
                                    height={24}
                                    radius={10}
                                    colors={newUIColors}
                                />
                            </View>
                            <View
                                style={[
                                    appStyles.alignItemsCenter,
                                    appStyles.justifyContentBetween,
                                    appStyles.flexRow,
                                    appStyles.pB20,
                                ]}>
                                <AppSkeletonLoading
                                    width={100}
                                    height={24}
                                    radius={10}
                                    colors={newUIColors}
                                />
                                <AppSkeletonLoading
                                    width={100}
                                    height={24}
                                    radius={10}
                                    colors={newUIColors}
                                />
                            </View>
                            <View
                                style={[
                                    appStyles.alignItemsCenter,
                                    appStyles.justifyContentBetween,
                                    appStyles.flexRow,
                                    appStyles.pB20,
                                ]}>
                                <AppSkeletonLoading
                                    width={100}
                                    height={24}
                                    radius={10}
                                    colors={newUIColors}
                                />
                                <AppSkeletonLoading
                                    width={100}
                                    height={24}
                                    radius={10}
                                    colors={newUIColors}
                                />
                            </View>
                            <View
                                style={[
                                    appStyles.alignItemsCenter,
                                    appStyles.justifyContentBetween,
                                    appStyles.flexRow,
                                    appStyles.pB20,
                                ]}>
                                <AppSkeletonLoading
                                    width={100}
                                    height={24}
                                    radius={10}
                                    colors={newUIColors}
                                />
                                <AppSkeletonLoading
                                    width={100}
                                    height={24}
                                    radius={10}
                                    colors={newUIColors}
                                />
                            </View>
                        </View>
                        <View style={[appStyles.flexRow, appStyles.center]}>
                            <AppSkeletonLoading
                                width={100}
                                height={24}
                                radius={10}
                                colors={newUIColors}
                            />
                            <View style={appStyles.ml10}>
                                <AppSkeletonLoading
                                    width={30}
                                    height={40}
                                    radius={10}
                                    colors={newUIColors}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </>
    );
};

const DefaultView = ({
    transactionData,
    isSendNFT,
    convertTitle,
    amountSend,
    onViewOnScan,
    isSuccess,
    theme,
    copyAction,
}: DefaultTransactionViewType) => {
    const insets = useSafeAreaInsets();
    const styles = useStyles(theme, insets);

    return (
        <View style={appStyles.mt30}>
            {transactionData?.createdAt ? (
                <DetailRow
                    titleWithI18n={LanguageKey.transaction_detail_date}
                    value={DateTimeUtils.formatTimeWithTimezone(
                        transactionData?.createdAt,
                        'YYYY/MM/DD, h:mm A',
                    )}
                />
            ) : null}
            {isSendNFT ? null : (
                <DetailRow
                    titleWithI18n={LanguageKey.transaction_detail_amount}
                    value={convertTitle({ amount: amountSend, gasFee: false })}
                />
            )}
            {transactionData?.estimatedGasFee ? (
                <DetailRow
                    titleWithI18n={LanguageKey.nft_estimated_gas_fee}
                    value={convertTitle({
                        amount: +transactionData?.estimatedGasFee,
                        gasFee: true,
                    })}
                />
            ) : null}
            <DetailRow
                titleWithI18n={LanguageKey.transaction_tx_has_title}
                value={WalletUtils.getShortAddress(transactionData?.txHash)}
                showCopyButton
                copyAction={copyAction}
            />
            {isSuccess ? (
                <TouchableOpacity
                    onPress={onViewOnScan}
                    style={styles.titleWithValueContainer}>
                    <View
                        style={[
                            appStyles.flexRow,
                            appStyles.flex1,
                            appStyles.center,
                        ]}>
                        <AppText
                            titleWithI18n={
                                LanguageKey.transaction_detail_view_on_scan_title
                            }
                            variant={TextVariantKeys.titleSmall}
                            textColor={theme.colors.surface_surface_brand}
                        />
                        <View style={appStyles.ml5}>
                            <ArrowForward2SvgIcon />
                        </View>
                    </View>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

type DetailRowType = {
    titleWithI18n: string;
    totalAmount?: boolean;
    value: string;
    subValue?: string;
    variantValue?: TextVariantKeys;
    variantTitle?: TextVariantKeys;
    valueColor?: string;
    titleColor?: string;
    bottomLine?: boolean;
    showCopyButton?: boolean;
    copyAction?: () => void;
    valueMaxFontSizeMultiplier?: number;
    numberOfLinesTitle?: number;
    numberOfLinesContent?: number;
    titleStyles?: StyleProp<ViewStyle>;
    contentContainerStyles?: StyleProp<ViewStyle>;
};

const DetailRow: React.FC<DetailRowType> = ({
    titleWithI18n,
    value,
    subValue,
    variantValue = TextVariantKeys.bodyMMedium,
    valueColor = appColors.neutral.n800,
    bottomLine = false,
    showCopyButton = false,
    totalAmount,
    copyAction,
    titleColor,
    variantTitle,
    valueMaxFontSizeMultiplier,
    numberOfLinesTitle,
    numberOfLinesContent,
    titleStyles,
    contentContainerStyles,
}) => {
    const theme = useAppTheme();
    const insets = useSafeAreaInsets();
    const styles = useStyles(theme, insets);
    return (
        <View>
            <View style={[styles.titleWithValueContainer]}>
                <AppText
                    titleWithI18n={titleWithI18n}
                    textColor={
                        titleColor ?? theme.colors.text_on_surface_text_light
                    }
                    variant={variantTitle ?? TextVariantKeys.bodyMLarge}
                    styles={[appStyles.pR10, titleStyles]}
                    numberOfLines={numberOfLinesTitle}
                />
                <View
                    style={[
                        appStyles.alignItemsEnd,
                        appStyles.flexRow,
                        appStyles.justifyContentEnd,
                        contentContainerStyles,
                    ]}>
                    <AppText
                        title={value}
                        textColor={
                            valueColor ?? theme.colors.text_on_surface_text_high
                        }
                        variant={variantValue ?? TextVariantKeys.bodyMMedium}
                        maxFontSizeMultiplier={valueMaxFontSizeMultiplier}
                        styles={[appStyles.textAlignRight]}
                        numberOfLines={numberOfLinesContent}
                    />
                    {subValue ? (
                        <AppText
                            title={subValue}
                            textColor={valueColor}
                            variant={variantValue}
                            styles={appStyles.flex1}
                        />
                    ) : null}
                    {showCopyButton && (
                        <TouchableOpacity
                            onPress={copyAction}
                            style={appStyles.ml5}>
                            <Copy2SvgIcon />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            {bottomLine ? <View style={styles.line} /> : null}
        </View>
    );
};

export { DefaultView, DetailRow, LoadingTransactionDetails };
