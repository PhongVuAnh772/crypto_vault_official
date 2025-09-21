import { useRoute } from '@react-navigation/native';
import moment from 'moment';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingImage } from 'src/components/common/AppImage/type';
import LanguageKey from 'src/core/locales/LanguageKey';
import { StakingHistoryItem } from 'src/core/redux/slice/staking/staking.type';
import GlobalUtils from 'src/core/utils/globalUtils';
import StakingUtils from 'src/core/utils/staking';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { StakingDetailProp } from './stakingDetail.type';

const useStakingDetail = ({ navigation }: RootNavigationType) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();

    const stakingDetail: StakingHistoryItem =
        useRoute<StakingDetailProp>().params;
    const { t } = useTranslation();

    const [isLoadings, setIsLoadings] = useState<LoadingImage>({});
    const setLoadings = (uri: string, value: boolean) => {
        setIsLoadings(prev => {
            return {
                ...prev,
                [uri]: {
                    uri: uri,
                    loading: value,
                },
            };
        });
    };
    const rewardAmount = StakingUtils.calculateRewardAmount(
        stakingDetail.lockPeriod,
        stakingDetail.apr,
        stakingDetail.lockAmount,
    );
    const stakingTransactionData = [
        {
            title: LanguageKey.common_text_locked_amount,
            value: stakingDetail.lockAmount,
        },
        {
            title: LanguageKey.common_text_apr,
            value: stakingDetail.apr,
        },
        {
            title: LanguageKey.common_text_lock_period,
            value: t(LanguageKey.stake_day, {
                days: parseFloat(stakingDetail.lockPeriod),
            }),
        },
        {
            title: LanguageKey.common_text_staking_date,
            value: moment(stakingDetail.lockedDate).format('YYYY/MM/DD'),
        },
        {
            title: LanguageKey.common_text_unlock_on,
            value: stakingDetail.unClockOn,
        },
        {
            title: LanguageKey.common_text_reward,
            value: rewardAmount,
        },
    ];

    return {
        isLoadings,
        setLoadings,
        stakingDetail,
        stakingTransactionData,
        t,
        newUI,
    };
};

export default useStakingDetail;
