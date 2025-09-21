import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, TouchableOpacity, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { MoneyBagSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import { StakingHistoryItem } from 'src/core/redux/slice/staking/staking.type';
import appStyles from 'src/core/styles';
import StakingUtils from 'src/core/utils/staking';
import RowItem from '../rowItem';
import Separator from '../separator';
import style from './style';

type MyStakingProps = {
    stakingAmount: string;
    onPress: (data: StakingHistoryItem) => void;
    data: StakingHistoryItem[];
};

const MyStaking = ({ stakingAmount, onPress, data }: MyStakingProps) => {
    const { t } = useTranslation();
    return (
        <View style={style.container}>
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    style.containerMyStaking,
                ]}>
                <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                    <MoneyBagSvgIcon />
                    <View style={appStyles.ml10}>
                        <AppText
                            title={t(LanguageKey.stake_my_staking)}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={appColors.neutral.n600}
                        />
                    </View>
                </View>
                <AppText
                    title={stakingAmount}
                    variant={TextVariantKeys.bodyMLarge}
                    textColor={appColors.main.tokyoRed}
                />
            </View>
            <Separator />
            <FlatList
                data={data}
                ItemSeparatorComponent={Separator}
                scrollEnabled={false}
                renderItem={({ item }) => {
                    const countDate = StakingUtils.calculateLockDuration(
                        item.lockedDate,
                        item.unClockOn,
                    );
                    const rewardAmount = StakingUtils.calculateRewardAmount(
                        item.lockPeriod,
                        item.apr,
                        item.lockAmount,
                    );
                    return (
                        <TouchableOpacity
                            onPress={() => onPress(item)}
                            style={[
                                appStyles.backgroundWhite,
                                style.stakingItem,
                            ]}>
                            <RowItem
                                title={t(LanguageKey.stake_day, {
                                    days: countDate,
                                })}
                                value={item.lockAmount}
                            />
                            <RowItem
                                title={t(LanguageKey.common_text_apr)}
                                value={item.apr}
                            />
                            {rewardAmount && (
                                <RowItem
                                    title={t(
                                        LanguageKey.common_text_reward_amount,
                                    )}
                                    value={rewardAmount}
                                />
                            )}
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

export default MyStaking;
