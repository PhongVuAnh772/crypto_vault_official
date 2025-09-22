import { useEffect } from 'react';
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

const useHome = () => {
    const dispatch = useAppDispatch();
    const userInfo = useAppSelector(getUserInfo);
    const isSignedIn = !!userInfo;
    const isLoading = useAppSelector(getLoadingLogin);

    const initialData = async () => {
        if (isSignedIn) {
            dispatch(getBalanceByAccessToken());
        }
        dispatch(getMobileProtocolListsWithSupportedTokens());
        dispatch(getIsShowSwapFromBE());
        dispatch(getSettingCurrency());
        dispatch(getCryptosCurrency());
    };
    useEffect(() => {
        initialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return {
        isLoading,
    };
};
export default useHome;
