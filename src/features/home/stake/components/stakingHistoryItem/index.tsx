import React from 'react';
import { View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { PiggyBank2SvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import { StakingHistoryItem } from 'src/core/redux/slice/staking/staking.type';
import appStyles from 'src/core/styles';
import commonUtils from 'src/core/utils/commonUtils';
import style from './style';

const StakingHistoryItemComponent: React.FC<StakingHistoryItem> = ({
    lockAmount,
    lockedDate,
}) => {
    const [amount, symbol] = lockAmount.split(' ');
    const convertedTime = commonUtils.getTimeByDate(lockedDate);
    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.justifyContentBetween,
                appStyles.alignItemsCenter,
                style.container,
            ]}>
            <View style={style.iconContainer}>
                <PiggyBank2SvgIcon color={appColors.neutral.n800} />
            </View>
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.alignItemsCenter,
                    appStyles.flex1,
                    appStyles.ml12,
                    appStyles.flexWrap,
                ]}>
                <View style={appStyles.mr10}>
                    <AppText
                        titleWithI18n={LanguageKey.common_text_stake}
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.n800}
                    />
                </View>
                <View style={style.statusContainer}>
                    <AppText
                        titleWithI18n={
                            LanguageKey.transaction_history_completed
                        }
                        variant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.functional.green}
                    />
                </View>
            </View>
            <View style={[appStyles.alignItemsEnd, appStyles.flex1]}>
                <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                    <AppText
                        title={amount}
                        variant={TextVariantKeys.titleSmall}
                        textColor={appColors.functional.green}
                        numberOfLines={2}
                        styles={appStyles.textAlignRight}
                    />
                    <AppText
                        title={symbol}
                        variant={TextVariantKeys.labelTiny}
                        textColor={appColors.neutral.n800}
                        styles={appStyles.ml10}
                    />
                </View>
                <AppText
                    title={convertedTime}
                    variant={TextVariantKeys.bodyRSmall}
                    textColor={appColors.neutral.n400}
                />
            </View>
        </View>
    );
};

export default StakingHistoryItemComponent;
