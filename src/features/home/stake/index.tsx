import React from 'react';
import { useTranslation } from 'react-i18next';
import AppTabBar from 'src/components/common/AppTabBar';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import StakingHistoryView from './stakingHistory/stakingHistory.view';
import StakingPoolsView from './stakingPools/stakingPools.view';

const StakeScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const { t } = useTranslation();

    return (
        <AppTabBar
            screensData={[
                {
                    screen: StakingPoolsView,
                    title: t(LanguageKey.stake_staking_pools),
                },
                {
                    screen: StakingHistoryView,
                    title: t(LanguageKey.stake_staking_history),
                },
            ]}
            screenWrapperProps={{
                headerTitleWithI18n: t(LanguageKey.stake_staking),
                enableHeader: true,
                headerTextVariant: TextVariantKeys.titleMedium,
                paddingTop: true,
                maxFontSizeMultiplier: 1.2,
            }}
        />
    );
};

export default StakeScreen;
