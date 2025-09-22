import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';
import {
    getProtocolDataLists,
    setSelectedProtocol,
} from 'src/core/redux/slice/account.slice';
import { ProtocolDataWithSupportedTokensFormBEType } from 'src/core/redux/slice/account.type';
import { getStakingPools } from 'src/core/redux/slice/staking/staking.slice';
import Utils from 'src/core/utils/commonUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { StakingPool } from '../types';

const useStakingPools = ({ navigation }: RootNavigationType) => {
    const stakingPools = useAppSelector(getStakingPools);
    const [showModalSwitch, setShowModalSwitch] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const protocolBaseData = useProtocolSelected();
    const protocolListsWithSupportedTokensFromBE =
        useAppSelector(getProtocolDataLists);
    const [currentProtocolGlobal, setCurrentProtocolGlobal] =
        useState<ProtocolDataWithSupportedTokensFormBEType>();
    const [currentPool, setCurrentPool] = useState<StakingPool>();
    const { t } = useTranslation();

    const navigateToDetail = (params: StakingPool) => {
        if (
            params.lock.network.toLocaleLowerCase() !==
            protocolBaseData?.symbol.toLocaleLowerCase()
        ) {
            setCurrentPool(params);
            setCurrentProtocolGlobal(protocolBaseData);
            onShowModalSwitch();
            return;
        }

        navigation.navigate(HomeStackScreenKey.StakingPoolDetail, params);
    };

    const handleSwitchProtocol = () => {
        const protocol = protocolListsWithSupportedTokensFromBE?.find(
            item => item.slip0044 === currentPool?.slip0044,
        );
        if (protocol) {
            dispatch(setSelectedProtocol(protocol._id));
            onHideModalSwitch();
            navigation.navigate(
                HomeStackScreenKey.StakingPoolDetail,
                currentPool,
            );
            Utils.showToast({
                msg: t(LanguageKey.successfully_switching, {
                    promisingProtocol: currentPool?.lock.network,
                }),
                type: AppToastType.success,
            });
        } else {
            onHideModalSwitch();
            Utils.showToast({
                msg: t(LanguageKey.failed_switching, {
                    promisingProtocol: currentPool?.lock.network,
                }),
                type: AppToastType.error,
            });
        }
    };
    const onShowModalSwitch = () => {
        setShowModalSwitch(true);
    };

    const onHideModalSwitch = () => {
        setShowModalSwitch(false);
    };

    return {
        navigateToDetail,
        stakingPools,
        showModalSwitch,
        onHideModalSwitch,
        currentPool,
        currentProtocolGlobal,
        t,
        handleSwitchProtocol,
    };
};

export default useStakingPools;
