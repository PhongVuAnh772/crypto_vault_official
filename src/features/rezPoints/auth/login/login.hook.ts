import messaging from '@react-native-firebase/messaging';
import { StackActions, useIsFocused } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { jwtDecode } from 'jwt-decode';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { Credentials } from 'react-native-auth0';
import appErrorMessage from 'src/core/constants/AppErrorMessage';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { setWebviewShowing } from 'src/core/redux/slice/app.slice';
import {
    getAccountDeactivate,
    getDataUserByAccessToken,
    getRezPointState,
    setCurrentAuthorizationAndStateCodeFromCallBack,
    setCurrentStateCode,
    setLoadingLogin,
} from 'src/core/redux/slice/rezPoint/rezPoint.slice';
import { ErrorCode } from 'src/core/redux/slice/rezPoint/rezPoint.type';
import Auth0Service from 'src/core/services/Auth0';
import Utils from 'src/core/utils/commonUtils';
import {
    HomeStackScreenKey,
    RezPointStackScreenKey,
} from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { LoginError, LoginResult } from './login.type';

const isIos = Platform.OS === 'ios';
const auth0Service = new Auth0Service();

const useLogin = ({ navigation }: RootNavigationType, replace?: boolean) => {
    const dispatch = useAppDispatch();
    const isFocused = useIsFocused();
    const { t } = useTranslation();

    const { stateCode, currentAuthorizationCode, stateCodeFromCallBack } =
        useAppSelector(getRezPointState);

    const isAccountDeactivate = useAppSelector(getAccountDeactivate);

    const [loginCall, setLoginCall] = useState<boolean>(false);

    const [result, setResult] =
        useState<WebBrowser.WebBrowserAuthSessionResult | null>(null);

    const showLoading = () => dispatch(setLoadingLogin(true));
    const hideLoading = () => dispatch(setLoadingLogin(false));

    const callLogin = useCallback(async () => {
        const { url, stateCode } = await auth0Service.auth.authorizeUrl();
        if (url && stateCode) {
            dispatch(setCurrentStateCode(stateCode));
            dispatch(setWebviewShowing(true));
            const result = await WebBrowser.openAuthSessionAsync(url);
            dispatch(setWebviewShowing(false));
            setResult(result);
        } else {
            showErrorLogin(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    const clearDataInRedux = () => {
        dispatch(setCurrentStateCode(''));
        dispatch(
            setCurrentAuthorizationAndStateCodeFromCallBack({
                authorizationCode: '',
                stateCode: '',
            }),
        );
    };
    const login = useCallback(() => {
        setLoginCall(true);
    }, []);

    const handleCheckVerification = (credentials: Credentials) => {
        const decodedToken: any = jwtDecode(credentials.idToken);

        if (
            decodedToken.hasOwnProperty('email_verified') &&
            decodedToken?.email_verified
        ) {
            return true;
        }
        const action = replace ? StackActions.replace : StackActions.push;
        navigation.dispatch(
            action(HomeStackScreenKey.RezPointStack, {
                screen: RezPointStackScreenKey.EmailVerification,
                params: credentials,
            }),
        );
        return false;
    };
    const handleNavigate = () => {
        const action = replace ? StackActions.replace : StackActions.push;
        navigation.dispatch(
            action(HomeStackScreenKey.RezPointStack, {
                screen: RezPointStackScreenKey.RezPointMainScreen,
            }),
        );
    };
    const exchange = useCallback(
        async (authCode: string, stateCodeCallBack: string) => {
            showLoading();
            try {
                if (stateCodeCallBack !== stateCode) {
                    throw new Error(appErrorMessage.stateCodeNotMatch);
                }
                const credentials = await auth0Service.auth.exchange({
                    authorizationCode: authCode,
                });
                clearDataInRedux();

                // check verification
                const resultEmailVerification =
                    handleCheckVerification(credentials);
                if (!resultEmailVerification) {
                    return;
                }

                const deviceToken = await messaging().getToken();
                await dispatch(
                    getDataUserByAccessToken({
                        accessToken: credentials.accessToken,
                        idToken: credentials.idToken,
                        deviceToken,
                        deviceType: Platform.OS,
                    }),
                ).unwrap();
                await auth0Service.auth.saveCredentials(credentials);

                handleNavigate();
            } catch (error) {
                showErrorLogin(error);
            } finally {
                WebBrowser.dismissBrowser();
                hideLoading();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dispatch, navigation, stateCode],
    );

    const showErrorLogin = (error?: any) => {
        console.log('🚀 ~ showErrorLogin ~ error:', error);
        WebBrowser.dismissBrowser();
        if (
            error === LoginError.ACCESS_DENIED ||
            error?.errorCode ===
                ErrorCode.ACCOUNT_DELETED_ONLY_CREATE_ACCOUNT_UTIL_30_DAYS ||
            error?.errorCode === ErrorCode.ACCOUNT_DELETED ||
            error?.errorCode === ErrorCode.ACCOUNT_DEACTIVATED
        ) {
            return;
        }
        Utils.showToast({
            msg: t(LanguageKey.login_failed),
            type: AppToastType.error,
        });
    };
    const getCodeAndState = (response: LoginResult) => {
        if (response?.type === 'success' && response?.url) {
            const urlParams = new URLSearchParams(response.url.split('?')[1]);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const error = urlParams.get('error');
            return { code, state, error };
        }
        return { code: null, state: null, error: null };
    };

    const handleResult = (result: WebBrowser.WebBrowserAuthSessionResult) => {
        const { code, state, error } = getCodeAndState(result as LoginResult);
        if (code && state) {
            exchange(code, state);
        } else {
            showErrorLogin(error);
        }
    };
    useEffect(() => {
        if (loginCall) {
            clearDataInRedux();
            callLogin();
            setLoginCall(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginCall]);

    // listener for ios
    useEffect(() => {
        if (result?.type === 'success' && isIos) {
            handleResult(result);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result]);

    // listener for android
    useEffect(() => {
        if (
            currentAuthorizationCode &&
            stateCodeFromCallBack &&
            !isIos &&
            isFocused
        ) {
            exchange(currentAuthorizationCode, stateCodeFromCallBack);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAuthorizationCode, stateCodeFromCallBack]);

    useEffect(() => {
        if (isAccountDeactivate) {
            WebBrowser.dismissBrowser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAccountDeactivate]);
    return { login };
};

export default useLogin;
