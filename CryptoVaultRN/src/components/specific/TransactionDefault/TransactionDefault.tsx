import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import {DocumentSvgIcon} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import {TransactionType} from 'src/core/enum/TransactionType';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import {AppThemeType} from 'src/core/type/ThemeType';
import {TransactionHistoryDataType} from 'src/core/type/TransactionHistoryDataType';
import Utils from 'src/core/utils/commonUtils';
import DateTimeUtils from 'src/core/utils/dateTimeUtils';
import useStyles from './styles';

type TransactionDefaultType = {
    item: TransactionHistoryDataType;
    onGoToDetails: (item: TransactionHistoryDataType) => void;
    theme: AppThemeType;
};
const TransactionDefault = ({
    item,
    onGoToDetails,
    theme,
}: TransactionDefaultType) => {
    const styles = useStyles(theme);
    const amountEVM = `${item.type === TransactionType.Receive ? '+' : '-'} ${Utils.formattedBalanceCurrency(item.totalAmount ?? 0)} ${item.token?.symbol}`;

    return (
        <TouchableOpacity
            onPress={() => {
                onGoToDetails(item);
            }}
            style={[
                styles.transactionHistoryItem,
                appStyles.justifyContentBetween,
            ]}>
            <View style={styles.documentContainer}>
                <DocumentSvgIcon color={styles.documentIcon.color} />
            </View>
            <View
                style={[
                    appStyles.flex1,
                    appStyles.ml10,
                    appStyles.justifyContentStart,
                    appStyles.h100,
                ]}>
                <AppText
                    titleWithI18n={LanguageKey.transaction_smart_contract_call}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={appColors.neutral.black}
                    maxFontSizeMultiplier={1.2}
                />
            </View>
            <View style={[appStyles.alignItemsEnd]}>
                <AppText
                    title={amountEVM}
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
                <AppText
                    title={`${DateTimeUtils.formatTimeWithTimezone(
                        item.createdAt ?? '',
                    )}`}
                    variant={TextVariantKeys.bodyRSmall}
                    textColor={appColors.neutral.n500}
                    maxFontSizeMultiplier={1.2}
                />
            </View>
        </TouchableOpacity>
    );
};

export default TransactionDefault;
