import { StackActions, useRoute } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, AppStateStatus } from 'react-native';
import { Credentials, User } from 'react-native-auth0';
import AppKey from 'src/core/enum/AppKey';
import AppToastType from 'src/core/enum/AppToastType';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch } from 'src/core/redux/hooks';
import { handleResendEmailThunk } from 'src/core/redux/slice/rezPoint/rezPoint.slice';
import Auth0Service from 'src/core/services/Auth0';
import Utils from 'src/core/utils/commonUtils';
import { RezPointStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { EmailVerificationViewProps } from './emailVerification.type';

const useEmailVerification = ({ navigation }: RootNavigationType) => {
    const credentials: Credentials =
        useRoute<EmailVerificationViewProps>().params;

    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const appState = useRef(AppState.currentState);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const onShowLoading = () => setIsLoading(true);
    const onHideLoading = () => setIsLoading(false);

    const handleCheckEmailVerified = async (showError: boolean = true) => {
        onShowLoading();
        try {
            const auth = new Auth0Service();

            if (!credentials.refreshToken) return;

            const getUserInfo = await auth.user.getUserInfo({
                token: credentials.accessToken,
            });

            if (!getUserInfo.emailVerified) {
                if (showError) {
                    Utils.showToast({
                        msg: t(LanguageKey.rez_point_email_not_verified),
                        type: AppToastType.error,
                        visibilityTime: 2000,
                    });
                }
                return;
            }
            navigation.dispatch(
                StackActions.replace(
                    RezPointStackScreenKey.EmailVerifiedSuccessfully,
                ),
            );
        } catch {
            if (showError) {
                Utils.showToast({
                    msg: t(LanguageKey.common_text_error_title),
                    type: AppToastType.error,
                    visibilityTime: 2000,
                });
            }
        } finally {
            onHideLoading();
        }
    };

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        if (
            appState.current.match(/background/) &&
            nextAppState === AppKey.active
        ) {
            handleCheckEmailVerified(false);
        }
        appState.current = nextAppState;
    };

    const handleClickRestartMyRegistration = () => {
        navigation.goBack();
    };

    const handleResendEmail = async () => {
        onShowLoading();
        try {
            if (!getInformation.sub) {
                throw new Error('ID is not found');
            }
            await dispatch(handleResendEmailThunk(getInformation.sub)).unwrap();
            Utils.showToast({
                msg: t(LanguageKey.rez_point_re_send_successfully),
                type: AppToastType.success,
                visibilityTime: 2000,
            });
            startCountdown();
        } catch (error) {
            console.log('🚀 ~ handleResendEmail ~ error:', error);
            Utils.showToast({
                msg: t(LanguageKey.rez_point_re_send_fail),
                type: AppToastType.error,
                visibilityTime: 2000,
            });
        } finally {
            onHideLoading();
        }
    };
    const startCountdown = () => {
        setTimeLeft(30);
        setIsRunning(true);
    };
    const getInformation = useMemo(() => {
        const information: User = jwtDecode(credentials.idToken);
        return information;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const appStateSubscription = AppState.addEventListener(
            AppKey.change,
            handleAppStateChange,
        );

        return () => {
            appStateSubscription.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    return {
        handleCheckEmailVerified,
        isLoading,
        handleClickRestartMyRegistration,
        getInformation,
        handleResendEmail,
        timeLeft,
    };
};
export default useEmailVerification;
