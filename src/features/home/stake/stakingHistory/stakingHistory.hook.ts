import { StackActions } from '@react-navigation/native';
import moment from 'moment';
import { useCallback } from 'react';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppSelector } from 'src/core/redux/hooks';
import {
    useProtocolSelected,
    useSelectedCurrencySetting,
} from 'src/core/redux/slice/account.selector';
import { getStakingHistory } from 'src/core/redux/slice/staking/staking.slice';
import { StakingHistoryItem } from 'src/core/redux/slice/staking/staking.type';
import StakingUtils from 'src/core/utils/staking';
import TonUtils from 'src/core/utils/tonUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { StakingTransactionParams } from '../stakingTransaction/stakingTransaction.type';

const useStakingHistory = ({ navigation }: RootNavigationType) => {
    const listStakingHistory = useAppSelector(getStakingHistory);

    const convertList = useCallback(() => {
        if (!listStakingHistory) {
            return [];
        }
        return StakingUtils.groupByDate(listStakingHistory);
    }, [listStakingHistory]);

    const stakingHistory = convertList();
    const currencySetting = useSelectedCurrencySetting();
    const selectedCryptoData = useProtocolSelected();

    const createStakingTransactionData = (item: StakingHistoryItem) => {
        const gasFeeCurrency = TonUtils.getTonBalanceToCurrency(
            parseFloat(item.estimateGasFee),
            currencySetting,
            selectedCryptoData?.price,
        );
        const gasFeeCurrencyTitle = `≈ ${gasFeeCurrency.currency?.sign}${gasFeeCurrency.balance}`;
        const rewardAmount = StakingUtils.calculateRewardAmount(
            item.lockPeriod,
            item.apr,
            item.lockAmount,
        );
        const stakingTransactionData: StakingTransactionParams = {
            data1: [
                {
                    title: LanguageKey.common_text_rewards,
                    value: rewardAmount,
                },
                {
                    title: LanguageKey.common_text_wallet,
                    value: WalletUtils.getShortAddress(
                        item.walletAddress ?? '',
                    ),
                },
                {
                    title: LanguageKey.transaction_detail_date,
                    value: moment(item.lockedDate).format('YYYY/MM/DD'),
                },
                {
                    title: LanguageKey.common_text_unlock_on,
                    value: item.unClockOn,
                },
            ],
            data2: [
                {
                    title: LanguageKey.nft_estimate_gas_fee,
                    value: item.estimateGasFee,
                    value2: gasFeeCurrencyTitle,
                },
            ],
            lockAmount: item.lockAmount,
            lockAmountCurrency: '',
        };
        return stakingTransactionData;
    };
    const onPressItem = (item: StakingHistoryItem) => {
        const convertedData = createStakingTransactionData(item);
        navigation.dispatch(
            StackActions.push(
                HomeStackScreenKey.StakingTransaction,
                convertedData,
            ),
        );
    };
    return {
        stakingHistory,
        onPressItem,
    };
};
export default useStakingHistory;
