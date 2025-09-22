import { t } from 'i18next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { EdgeInsets } from 'react-native-safe-area-context';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { setPin } from 'src/core/redux/slice/account.slice';
import {
    getFailedPinAttempts,
    getKeepSplash,
    getLockoutLocalAuthentication,
    getMaxPinCodeAttempts,
    getRequirePinCode,
    getTimeLock,
    resetPinCodeData,
    selectorEnableFaceIdOrTouch,
    setFailedPinAttempts,
    setMaxPinCodeAttempts,
    setRequirePinCode,
    setTimeLock,
} from 'src/core/redux/slice/app.slice';
import AccountServices from 'src/core/services/AccountServices';
import FaceIdOrTouch from 'src/core/services/FaceIdOrTouch';

type UseRequirePinCodeType = {
    continueActionAfterPassPinCode?: (pinCode: string) => void;
    visible: boolean | undefined;
    onClose?: () => void;
    isMainRequirePinCode: boolean;
    disableFaceId?: boolean;
};

const useRequirePinCode = ({
    continueActionAfterPassPinCode,
    visible,
    onClose,
    isMainRequirePinCode,
    disableFaceId,
}: UseRequirePinCodeType) => {
    const dispatch = useAppDispatch();
    const insets: EdgeInsets = useAppSafeAreaInsets();
    const theme = useAppTheme();
    const [pinCode, setPinCode] = useState('');
    const [incorrectPin, setIncorrectPin] = useState(false);
    const requirePinCode = useAppSelector(getRequirePinCode) ?? false;
    const enableFaceIdOrTouch = useAppSelector(selectorEnableFaceIdOrTouch);
    const keepSplash = useAppSelector(getKeepSplash);
    const maxPinCodeAttempts = useAppSelector(getMaxPinCodeAttempts);
    const failedPinAttempts = useAppSelector(getFailedPinAttempts);
    const timeLock = useAppSelector(getTimeLock);
    const [ignoreUnfocusCheck, setIgnoreUnfocusCheck] = useState(false);
    const [remainingTime, setRemainingTime] = useState<number>(
        moment().valueOf(),
    );

    const isLockoutLocalAuthentication = useAppSelector(
        getLockoutLocalAuthentication,
    );

    const isUseFaceIdOrTouch =
        (requirePinCode || visible) && enableFaceIdOrTouch && !disableFaceId;
    useEffect(() => {
        if (
            isUseFaceIdOrTouch &&
            (isMainRequirePinCode ? requirePinCode : visible)
        ) {
            console.log('===================');
            console.log('Request face id');
            console.log('===================');
            const faceIdOrTouch = new FaceIdOrTouch(
                t,
                dispatch,
                isLockoutLocalAuthentication,
            );
            faceIdOrTouch
                .getPinCode()
                .then(currentPinCode => {
                    if (currentPinCode) {
                        continueAction(currentPinCode);
                    } else {
                        setIgnoreUnfocusCheck(true);
                    }
                })
                .catch(error => {
                    console.error('Face ID authentication failed:', error);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requirePinCode, visible]);

    const onCloseAction = () => {
        if (onClose) {
            onClose();
        }
        setPinCode('');
    };

    useEffect(() => {
        if (timeLock !== undefined) {
            const targetTimestamp = moment(timeLock).add(
                failedPinAttempts * 3,
                'minutes',
            );
            setRemainingTime(targetTimestamp.diff(moment()));
            const interval = setInterval(() => {
                const currentTime = moment();
                const timeLeft = targetTimestamp.diff(currentTime);
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    setRemainingTime(0);
                    dispatch(setTimeLock(undefined));
                    setIncorrectPin(false);
                } else {
                    setRemainingTime(timeLeft);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [dispatch, failedPinAttempts, timeLock]);

    useEffect(() => {
        if (pinCode.length === 6) {
            continueAction();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pinCode.length]);

    const continueAction = async (currentPinCode?: string) => {
        const accountServices = new AccountServices();
        const checkPinCodeResult = await accountServices.checkPinCode(
            currentPinCode ?? pinCode,
        );
        if (checkPinCodeResult) {
            dispatch(resetPinCodeData());
            dispatch(setPin(currentPinCode ?? pinCode));
            dispatch(setRequirePinCode(false));
            setPinCode('');
            if (continueActionAfterPassPinCode == null) return;
            continueActionAfterPassPinCode(currentPinCode ?? pinCode);
        } else {
            const newMaxPinCodeAttempts = maxPinCodeAttempts - 1;
            if (maxPinCodeAttempts > 0) {
                dispatch(setMaxPinCodeAttempts(newMaxPinCodeAttempts));
            }
            if (newMaxPinCodeAttempts === 0) {
                dispatch(setFailedPinAttempts(failedPinAttempts + 1));
                dispatch(setTimeLock(moment().valueOf()));
                dispatch(setMaxPinCodeAttempts(5));
            }
            setIncorrectPin(true);
            setPinCode('');
        }
    };

    const onChangeValue = (text: string) => {
        if (incorrectPin) {
            setIncorrectPin(false);
        }
        setPinCode(text);
    };

    return {
        requirePinCode,
        pinCode,
        onChangeValue,
        incorrectPin,
        insets,
        maxPinCodeAttempts,
        remainingTime,
        timeLock,
        keepSplash,
        theme,
        isUseFaceIdOrTouch,
        onCloseAction,
        ignoreUnfocusCheck,
    };
};

export default useRequirePinCode;
