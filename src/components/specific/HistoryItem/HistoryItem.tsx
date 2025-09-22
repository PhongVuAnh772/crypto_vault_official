import { t } from 'i18next';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { CoinType } from 'src/core/enum/CoinType';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import TonEventType from 'src/core/enum/TonEventType';
import {
    TransactionStatusType,
    TransactionType,
} from 'src/core/enum/TransactionType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import BitcoinUtils from 'src/core/utils/bitcoinUtils';
import Utils from 'src/core/utils/commonUtils';
import DateTimeUtils from 'src/core/utils/dateTimeUtils';
import TonUtils from 'src/core/utils/tonUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import TransactionDefault from '../TransactionDefault/TransactionDefault';
import TransactionHistoryTypeIcon from '../TransactionHistoryTypeIcon';
import useStyles from './styles';
import { HistoryItemType } from './type';

export const HistoryItem: React.FC<HistoryItemType> = ({
    onPressHistoryItem,
    item,
    containerStyle,
    isBitcoin,
    isJetton = false,
}) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);
    const isEVM = item.coinType === CoinType.Ethereum;

    const statusEVM =
        item.confirmations === 1
            ? TransactionStatusType.Completed
            : TransactionStatusType.Failed;

    const status = isEVM ? statusEVM : item.status;

    const getStatusStyle = () => {
        switch (status) {
            case TransactionStatusType.Completed:
                return [styles.containerStatus, styles.completedColor];
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
    const isSendNFT = item.isSendNFT;
    const evmTotalAmount = item?.totalAmount ?? 0;

    const isReceive = item.type === TransactionType.Receive;

    const otherTotalAmount =
        item?.amountSend + (item.adminFee ?? 0) + (item.fee ?? 0);

    let amount;

    const decimal = item.decimal;

    if (isBitcoin) {
        amount = `${Utils.formattedBalanceCurrency(
            parseFloat(BitcoinUtils.getBitcoinFromSatoshi(otherTotalAmount)),
        )} ${t(LanguageKey.currency_bitcoin)}`;
    } else {
        amount = `${Utils.formattedBalanceCurrency(
            TonUtils.formatBigNumber(String(otherTotalAmount ?? 0), decimal),
        )} ${isJetton ? (item.tokenSymbol ?? '') : t(LanguageKey.currency_ton)}`;
    }

    const amountEVM = `${Utils.formattedBalanceCurrency(evmTotalAmount)} ${item.token?.symbol}`;

    const tokenIdShow = `#${item.tokenId}`;

    let amountShows: string;
    if (isSendNFT) {
        amountShows = tokenIdShow;
    } else {
        amountShows = `${isReceive ? '+' : '-'} ${isEVM ? amountEVM : amount}`;
    }

    if (item.isShowDefaults) {
        return (
            <TransactionDefault
                onGoToDetails={onPressHistoryItem}
                item={item}
                theme={theme}
            />
        );
    }

    const getTitle = () => {
        let title = isReceive
            ? LanguageKey.common_text_receive
            : LanguageKey.home_send_title;
        if (item.tokenTransferType) {
            switch (item.tokenTransferType) {
                case TonEventType.JettonBurn:
                    title = LanguageKey.common_text_burn;
                    break;
                case TonEventType.JettonMint:
                    title = LanguageKey.common_text_mint;
                    break;
                default:
                    break;
            }
        }

        return title;
    };

    return (
        <TouchableOpacity
            onPress={() => {
                if (!onPressHistoryItem) return;
                onPressHistoryItem(item);
            }}
            key={item?.txHash}
            style={[styles.transactionHistoryItem, containerStyle]}>
            <TransactionHistoryTypeIcon
                type={
                    isReceive ? TransactionType.Receive : TransactionType.Sent
                }
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
                        <View style={getStatusStyle()}>
                            <AppText
                                titleWithI18n={getStatusText()}
                                variant={TextVariantKeys.labelTiny}
                                textColor={getTextColor()}
                                maxFontSizeMultiplier={1.2}
                            />
                        </View>
                    </View>
                    <AppText
                        title={amountShows}
                        variant={TextVariantKeys.titleSmall}
                        allowFontScaling={false}
                        textColor={
                            isReceive
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
                    {item.toAddress ? (
                        <AppText
                            title={`${t(
                                isReceive
                                    ? LanguageKey.common_text_from
                                    : LanguageKey.common_text_to,
                            )}: ${WalletUtils.getShortAddress(item.toAddress)}`}
                            variant={TextVariantKeys.bodyMMedium}
                            textColor={appColors.neutral.n500}
                            maxFontSizeMultiplier={1.2}
                        />
                    ) : (
                        <View />
                    )}
                    <AppText
                        title={`${DateTimeUtils.formatTimeWithTimezone(
                            item.createdAt ?? '',
                        )}`}
                        variant={TextVariantKeys.bodyRSmall}
                        textColor={appColors.neutral.n500}
                        maxFontSizeMultiplier={1.2}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default HistoryItem;
