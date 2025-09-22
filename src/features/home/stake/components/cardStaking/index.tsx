import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import { StakingPool } from '../../types';
import CardAction from '../cardAction';
import CardInformation from '../cardInformation';
import CardTransfer from '../cardTransfer';
import style from './style';

type CardStakingProps = {
    onPress: (value: StakingPool) => void;
    stakingPool: StakingPool;
};
const CardStaking = ({ onPress, stakingPool }: CardStakingProps) => {
    const { t } = useTranslation();

    return (
        <View style={[appStyles.flex1, style.container]}>
            <CardAction
                title={t(LanguageKey.stake_staking_pool_title, {
                    earn_name: stakingPool.earn.name,
                    lock_name: stakingPool.lock.name,
                })}
                onPress={() => onPress(stakingPool)}
            />
            <CardInformation
                description={stakingPool.description}
                totalAmount={Utils.formattedBalanceCurrency(
                    stakingPool.totalStaked,
                )}
                symbol={stakingPool.symbol}
            />
            <CardTransfer
                lockInfo={{
                    imageProtocol: stakingPool.lock.networkLogo,
                    nameProtocol: stakingPool.lock.network,
                    nameToken: stakingPool.lock.name,
                    imageToken: stakingPool.lock.logo,
                }}
                earnInfo={{
                    imageProtocol: stakingPool.earn.networkLogo,
                    nameProtocol: stakingPool.earn.network,
                    nameToken: stakingPool.earn.name,
                    imageToken: stakingPool.earn.logo,
                }}
            />
        </View>
    );
};

export default CardStaking;
