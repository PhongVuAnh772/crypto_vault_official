import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import {
    ArrowForward2SvgIcon,
    Copy2SvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import DateTimeUtils from 'src/core/utils/dateTimeUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import useStyles from './NFTSendDetail.styles';
import {DefaultTransactionViewType} from './NFTSendDetail.type';

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
    const styles = useStyles(theme);

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
                    value={convertTitle({amount: amountSend, gasFee: false})}
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
    titleStyles,
    contentContainerStyles,
}) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);
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
                />
                <View
                    style={[
                        appStyles.alignItemsEnd,
                        appStyles.flexRow,
                        contentContainerStyles,
                    ]}>
                    <AppText
                        title={value}
                        textColor={
                            valueColor ?? theme.colors.text_on_surface_text_high
                        }
                        variant={variantValue ?? TextVariantKeys.bodyMMedium}
                        maxFontSizeMultiplier={valueMaxFontSizeMultiplier}
                        styles={appStyles.textAlignRight}
                    />
                    {subValue ? (
                        <AppText
                            title={subValue}
                            textColor={valueColor}
                            variant={variantValue}
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

export {DefaultView, DetailRow};
