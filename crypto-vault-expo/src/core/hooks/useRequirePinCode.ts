import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AppKey from 'src/core/enum/AppKey';
import SecureStorageKey from 'src/core/enum/SecureStorageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    getEnablePassword,
    getWebViewShowing,
    selectorIsModalShow,
    selectorIspressActionNoti,
    setRequirePinCode,
} from 'src/core/redux/slice/app.slice';
import { lockAccount } from 'src/core/redux/slice/account.slice';
import SecureStorage from 'src/core/services/SecureStorage';

const useRequirePinCode = () => {
    const dispatch = useAppDispatch();
    const appState = useRef(AppState.currentState);
    const isModalShow = useAppSelector(selectorIsModalShow);
    const enablePassword = useAppSelector(getEnablePassword);
    const isWebViewShowing = useAppSelector(getWebViewShowing);
    const isPressActionNoti = useAppSelector(selectorIspressActionNoti);
    
    useEffect(() => {
        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (!enablePassword) {
                return;
            } else if (
                appState.current.match(/background/) &&
                nextAppState === AppKey.active &&
                isPressActionNoti
            ) {
                try {
                    const walletEncryptedData = await SecureStorage.getObject(
                        SecureStorageKey.accounts,
                    );

                    if (walletEncryptedData) {
                        dispatch(setRequirePinCode(true));
                        dispatch(lockAccount());
                    } else {
                        dispatch(setRequirePinCode(false));
                    }
                } catch (error) {
                    console.error('Error fetching wallet data:', error);
                    dispatch(setRequirePinCode(false));
                }
            }

            appState.current = nextAppState;
        };
        const appStateSubscription = AppState.addEventListener(
            AppKey.change,
            handleAppStateChange,
        );

        return () => {
            appStateSubscription.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, isPressActionNoti]);

    return { isModalShow, isWebViewShowing, enablePassword };
};

export default useRequirePinCode;
