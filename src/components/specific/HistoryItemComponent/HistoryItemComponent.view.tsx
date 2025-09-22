import { t } from 'i18next';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import {
    TransactionStatusType,
    TransactionType,
} from 'src/core/enum/TransactionType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import DateTimeUtils from 'src/core/utils/dateTimeUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import TransactionHistoryTypeIcon from '../TransactionHistoryTypeIcon';
import useStyles from './HistoryItemComponent.styles';
import { HistoryItemComponentType } from './HistoryItemComponent.type';

export const HistoryItemComponent: React.FC<HistoryItemComponentType> = ({
    onPress,
    containerStyle,
    amountTitle,
    createdAt,
    transactionType,
    status,
    customTitle,
    itemKey,
    address,
    logoUri,
    isNFTReceiveTransfer = false,
}) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);

    const getStatusStyle = () => {
        switch (status) {
            case TransactionStatusType.Completed:
                return [styles.containerStatus, styles.completedColor];
            case TransactionStatusType.Pending:
                return [styles.containerStatus, styles.pendingColor];
            case TransactionStatusType.Failed:
                return [styles.containerStatus, styles.errorColor];
            default:
                return [styles.containerStatus, styles.pendingColor];
        }
    };

    const getStatusText = () => {
        switch (status) {
            case TransactionStatusType.Completed:
                return LanguageKey.transaction_history_completed;
            case TransactionStatusType.Pending:
                return LanguageKey.transaction_history_pending;
            case TransactionStatusType.Failed:
                return LanguageKey.common_text_fail;
            default:
                return LanguageKey.transaction_history_pending;
        }
    };

    const getTextColor = () => {
        switch (status) {
            case TransactionStatusType.Completed:
                return appColors.functional.green;
            case TransactionStatusType.Pending:
                return appColors.functional.yellow;
            case TransactionStatusType.Failed:
                return appColors.neutral.n600;
            default:
                return appColors.functional.green;
        }
    };

    const isReceive =
        transactionType === TransactionType.Receive ||
        transactionType === TransactionType.ReceiveNFT;

    const getTitle = () => {
        let title;
        if (isNFTReceiveTransfer) {
            return LanguageKey.nft_send;
        }
        if (transactionType === TransactionType.SmartContractExec) {
            return LanguageKey.transaction_smart_contract_call;
        }
        if (transactionType === TransactionType.SendNFT) {
            return LanguageKey.nft_send;
        }
        if (transactionType === TransactionType.ReceiveNFT) {
            return `${t(LanguageKey.common_text_receive_nft)}`;
        }
        title = isReceive
            ? LanguageKey.common_text_receive
            : LanguageKey.home_send_title;

        return customTitle ?? title;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            key={itemKey}
            style={[styles.transactionHistoryItem, containerStyle]}>
            <TransactionHistoryTypeIcon
                type={
                    isNFTReceiveTransfer
                        ? TransactionType.ReceiveNFT
                        : transactionType
                }
                uri={logoUri}
            />
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.flex1,
                    appStyles.pL10,
                ]}>
                <View
                    style={[
                        appStyles.justifyContentBetween,
                        appStyles.flexRow,
                    ]}>
                    <View style={[appStyles.flexRow]}>
                        <AppText
                            titleWithI18n={getTitle()}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.neutral.black}
                            maxFontSizeMultiplier={1.2}
                        />
                        <View style={[getStatusStyle()]}>
                            <AppText
                                titleWithI18n={getStatusText()}
                                variant={TextVariantKeys.labelTiny}
                                textColor={getTextColor()}
                                maxFontSizeMultiplier={1.2}
                            />
                        </View>
                    </View>
                    <AppText
                        title={amountTitle}
                        variant={TextVariantKeys.titleSmall}
                        allowFontScaling={false}
                        textColor={
                            isReceive || isNFTReceiveTransfer
                                ? appColors.functional.success
                                : appColors.main.tokyoRed
                        }
                        maxFontSizeMultiplier={1.2}
                        styles={appStyles.textAlignRight}
                    />
                </View>
                <View
                    style={[
                        appStyles.flex1,
                        appStyles.justifyContentBetween,
                        appStyles.alignItemsEnd,
                        appStyles.flexRow,
                    ]}>
                    {address ? (
                        <AppText
                            title={`${t(
                                isReceive || isNFTReceiveTransfer
                                    ? LanguageKey.common_text_from
                                    : LanguageKey.common_text_to,
                            )}: ${WalletUtils.getShortAddress(address)}`}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.neutral.n500}
                            maxFontSizeMultiplier={1.2}
                        />
                    ) : (
                        <View />
                    )}
                    {createdAt ? (
                        <AppText
                            title={`${DateTimeUtils.formatTimeWithTimezone(
                                createdAt,
                            )}`}
                            variant={TextVariantKeys.bodyRSmall}
                            textColor={appColors.neutral.n500}
                            maxFontSizeMultiplier={1.2}
                        />
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default HistoryItemComponent;
