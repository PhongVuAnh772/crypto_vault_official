import { BottomSheetModal } from '@gorhom/bottom-sheet';
import messaging from '@react-native-firebase/messaging';
import { CommonActions } from '@react-navigation/native';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    getBalanceByAccessToken,
    getBalanceInfoByAccessToken,
    getPointByAccessToken,
    getPointExpire,
    getUserInfo,
    logOutUser,
    userSignOut,
} from 'src/core/redux/slice/rezPoint/rezPoint.slice';
import Utils from 'src/core/utils/commonUtils';
import { RezPointStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { ErrorSignOut, LoadingPage } from './homeRezPoints.type';

const useHomeRezPoint = ({ navigation }: RootNavigationType) => {
    const dispatch = useAppDispatch();
    const userInfo = useAppSelector(getUserInfo);
    const balanceInfo = useAppSelector(getBalanceInfoByAccessToken);
    const getPointExpireInfo = useAppSelector(getPointExpire);
    const { t } = useTranslation();
    const [showModalSignOut, setShowModalSignOut] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<LoadingPage>({
        balance: true,
        listPointExpire: true,
    });
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const userName = userInfo?.name || '';

    const coin = balanceInfo?.balance?.toString() || '0';

    const handleOpenOptionModal = () => {
        bottomSheetRef.current?.present();
    };
    const handleCloseOptionModal = () => {
        bottomSheetRef.current?.dismiss();
    };
    const handleSignOut = async () => {
        const deviceToken = await messaging().getToken();

        const result = await dispatch(logOutUser(deviceToken));
        if (result) {
            setShowModalSignOut(false);
            await new Promise(resolve => setTimeout(resolve, 500));
            navigation.goBack();
            dispatch(userSignOut());
        } else {
            handleShowError();
        }
    };
    const handleCloseModalSignOut = () => {
        setShowModalSignOut(false);
    };
    const handleSignOutOption = () => {
        handleCloseOptionModal();
        setShowModalSignOut(true);
    };

    const handleNavigationPersonalInformation = () => {
        navigation.navigate(RezPointStackScreenKey.PersonalInformation);
        handleCloseOptionModal();
    };
    const handleNavigationPointHistoryTab = () => {
        navigation.dispatch(
            CommonActions.navigate(
                RezPointStackScreenKey.RezPointHistoryScreen,
            ),
        );
    };
    const onRefresh = useCallback(async () => {
        try {
            if (refreshing) {
                return;
            }
            setRefreshing(true);
            await Promise.all([
                dispatch(getBalanceByAccessToken()).unwrap(),
                dispatch(getPointByAccessToken()).unwrap(),
            ]);
        } catch (error) {
            handleShowError(error);
        } finally {
            setRefreshing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshing]);

    const handleInitData = async () => {
        processGetBalance();
    };
    const processGetBalance = async () => {
        try {
            await dispatch(getBalanceByAccessToken()).unwrap();
            setIsLoading(prev => {
                return { ...prev, balance: false };
            });
            processGetPointByAccessToken();
        } catch (error) {
            handleShowError(error);
        }
    };
    const processGetPointByAccessToken = async () => {
        try {
            await dispatch(getPointByAccessToken()).unwrap();
            setIsLoading(prev => {
                return { ...prev, listPointExpire: false };
            });
        } catch (error) {
            handleShowError(error);
        }
    };
    const handleShowError = (error?: any) => {
        if (error + ''.includes(ErrorSignOut.NoCredentials)) {
            if (navigation.canGoBack()) {
                navigation.goBack();
                dispatch(userSignOut());
                Utils.showToast({
                    msg: t(LanguageKey.rez_point_error_sign_out),
                    type: AppToastType.error,
                });
                return;
            }
        }
        Utils.showToast({
            msg: t(LanguageKey.common_server_busy),
            type: AppToastType.error,
        });
    };
    // const accountListener = useCallback(() => {
    //     if (!userInfo && !firstInit) {
    //         if (navigation.canGoBack()) {
    //             navigation.goBack();
    //         }
    //         Utils.showToast({
    //             msg: t(LanguageKey.rez_point_error_sign_out),
    //             type: AppToastType.error,
    //         });
    //     }
    // }, [navigation, t, userInfo, firstInit]);

    const backAction = () => {
        navigation.goBack();
    };

    const goToPointHistory = () => {
        navigation.dispatch(
            CommonActions.navigate(RezPointStackScreenKey.PointHistory),
        );
    };
    const navigateAboutScreen = () => {
        handleCloseOptionModal();
        navigation.navigate(RezPointStackScreenKey.AboutRezPoint);
    };
    useLayoutEffect(() => {
        handleInitData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // useEffect(() => {
    //     if (isFocused) {
    //         accountListener();
    //     }
    // }, [accountListener, isFocused]);
    return {
        coin,
        handleOpenOptionModal,
        handleCloseOptionModal,
        showModalSignOut,
        handleSignOut,
        handleSignOutOption,
        handleNavigationPointHistoryTab,
        bottomSheetRef,
        handleCloseModalSignOut,
        userName,
        backAction,
        handleNavigationPersonalInformation,
        getPointExpireInfo,
        isLoading,
        onRefresh,
        refreshing,
        goToPointHistory,
        navigateAboutScreen,
    };
};

export default useHomeRezPoint;
