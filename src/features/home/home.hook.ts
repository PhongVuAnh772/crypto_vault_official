import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { getMobileProtocolListsWithSupportedTokens } from 'src/core/redux/slice/account.slice';
import {
    getCryptosCurrency,
    getSettingCurrency,
} from 'src/core/redux/slice/app.slice';
import {
    getBalanceByAccessToken,
    getLoadingLogin,
    getUserInfo,
} from 'src/core/redux/slice/rezPoint/rezPoint.slice';
import { getIsShowSwapFromBE } from 'src/core/redux/slice/swap/swap.slice';
import { startBalanceWorker, stopBalanceWorker } from 'src/core/worker/balance.worker';

const useHome = () => {
    const dispatch = useAppDispatch();
    const isLoading = useAppSelector(getLoadingLogin);

    const initialData = async () => {
        dispatch(getMobileProtocolListsWithSupportedTokens());
        dispatch(getIsShowSwapFromBE());
        dispatch(getSettingCurrency());
        dispatch(getCryptosCurrency());
    };
    useFocusEffect(
      useCallback(() => {
        startBalanceWorker();

        return () => {
          stopBalanceWorker();
        };
      }, [])
    );

    useEffect(() => {
        initialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return {
        isLoading,
    };
};
export default useHome;
