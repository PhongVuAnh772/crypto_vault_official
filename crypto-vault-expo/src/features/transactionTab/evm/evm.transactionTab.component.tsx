import React from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import TransactionDefault from 'src/components/specific/TransactionDefault/TransactionDefault';
import TransactionHistoryTypeIcon from 'src/components/specific/TransactionHistoryTypeIcon';
import appColors from 'src/core/constants/AppColors';
import { CoinType } from 'src/core/enum/CoinType';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { TransactionType } from 'src/core/enum/TransactionType';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import { HistorySectionDataType } from 'src/core/type/HistorySectionDataType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import Utils from 'src/core/utils/commonUtils';
import DateTimeUtils from 'src/core/utils/dateTimeUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { useStyles } from './evm.transactionTab.styles';

const RenderItem: React.FC<{
    item: TransactionHistoryDataType;
    index: number;
    section: HistorySectionDataType;
    onGoToDetails: (item: TransactionHistoryDataType) => void;
}> = ({ item, index, section, onGoToDetails }) => {
    const { t } = useTranslation();
    const theme = useAppTheme();
    const styles = useStyles(theme);
    const topItem = index === 0;
    const bottomItem = index === section.data.length - 1;
    const currentConfirmations = item.confirmations;
    const isUnConfirm = currentConfirmations === 0;
    const isSendNFT = item.isSendNFT;
    const totalAmount = item?.totalAmount || 0;
    const amountEVM = `${Utils.formattedBalanceCurrency(totalAmount)} ${item.token?.symbol}`;
    const tokenIdShow = `#${item.tokenId}`;
    const evm = item.coinType === CoinType.Ethereum;
    const amountShows = isSendNFT
        ? tokenIdShow
        : `${item.type === TransactionType.Receive ? '+' : '-'} ${amountEVM}`;

    if (item.isShowDefaults) {
        return (
            <TransactionDefault
                onGoToDetails={onGoToDetails}
                item={item}
                theme={theme}
            />
        );
    }

    const getStatusStyle = (isUnConfirm: boolean, evm: boolean) => {
        if (isUnConfirm) {
            if (evm) return [styles.containerStatus, styles.errorColor];
            return [styles.containerStatus, styles.pendingColor];
        }
        return [styles.containerStatus, styles.completedColor];
    };

    const getStatusText = (isUnConfirm: boolean, evm: boolean) => {
        if (isUnConfirm) {
            if (evm) return LanguageKey.common_text_fail;
            return LanguageKey.transaction_history_pending;
        }
        return LanguageKey.transaction_history_completed;
    };

    const getTextColor = (isUnConfirm: boolean, evm: boolean) => {
        if (isUnConfirm) {
            if (evm) return appColors.neutral.n600;
            return appColors.functional.yellow;
        }
        return appColors.functional.green;
    };

    return (
        <TouchableOpacity
            onPress={() => {
                onGoToDetails(item);
            }}
            style={[
                styles.transactionHistoryItem,
                topItem ? styles.transactionHistoryTopItemBorder : null,
                bottomItem ? styles.transactionHistoryBottomItemBorder : null,
            ]}>
            <TransactionHistoryTypeIcon
                type={
                    item.type === TransactionType.Receive
                        ? TransactionType.Receive
                        : TransactionType.Sent
                }
                coinType={item.coinType}
                uri={item.token?.logo || ''}
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
                        <View style={[appStyles.flexRow]}>
                            <AppText
                                titleWithI18n={
                                    item.type === TransactionType.Receive
                                        ? LanguageKey.common_text_receive
                                        : LanguageKey.home_send_title
                                }
                                variant={TextVariantKeys.bodyMMedium}
                                textColor={appColors.neutral.black}
                                maxFontSizeMultiplier={1.2}></AppText>
                            {isSendNFT ? (
                                <AppText
                                    titleWithI18n={LanguageKey.common_text_nft}
                                    variant={TextVariantKeys.bodyMMedium}
                                    maxFontSizeMultiplier={1.2}
                                    styles={appStyles.ml5}
                                />
                            ) : null}
                        </View>
                        <View style={getStatusStyle(isUnConfirm, evm)}>
                            <AppText
                                titleWithI18n={getStatusText(isUnConfirm, evm)}
                                variant={TextVariantKeys.labelTiny}
                                textColor={getTextColor(isUnConfirm, evm)}
                                maxFontSizeMultiplier={1.2}
                            />
                        </View>
                    </View>
                    <AppText
                        title={amountShows}
                        variant={TextVariantKeys.titleSmall}
                        allowFontScaling={false}
                        textColor={
                            item.type === TransactionType.Receive
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
                                item.type === TransactionType.Receive
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

export { RenderItem };
