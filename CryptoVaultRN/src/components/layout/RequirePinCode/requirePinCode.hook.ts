import { t } from 'i18next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { EdgeInsets } from 'react-native-safe-area-context';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { loadWalletsFromStorage, setPin } from 'src/core/redux/slice/account.slice';
import {
    getFailedPinAttempts,
    getKeepSplash,
    getLockoutLocalAuthentication,
    getMaxPinCodeAttempts,
    getRequirePinCode,
    getTimeLock,
    resetAllSlice,
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
    const triggerFaceId = () => {
        if (isUseFaceIdOrTouch) {
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
    };

    useEffect(() => {
        if (isMainRequirePinCode ? requirePinCode : visible) {
            triggerFaceId();
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
            const delays = [1, 2, 5, 10, 30, 60, 300, 600, 1800, 3600];
            const delayInSeconds = delays[failedPinAttempts - 1] || 3600;

            const targetTimestamp = moment(timeLock).add(
                delayInSeconds,
                'seconds',
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
        const enteredPin = currentPinCode ?? pinCode;
        const checkPinCodeResult = await accountServices.checkPinCode(enteredPin);

        if (checkPinCodeResult) {
            dispatch(resetPinCodeData());
            dispatch(setPin(enteredPin));
            dispatch(loadWalletsFromStorage(enteredPin));
            dispatch(setRequirePinCode(false));
            setPinCode('');
            if (continueActionAfterPassPinCode == null) return;
            continueActionAfterPassPinCode(enteredPin);
        } else {
            const newFailedAttempts = failedPinAttempts + 1;
            dispatch(setFailedPinAttempts(newFailedAttempts));

            // Wipe data after 12 failed attempts
            if (newFailedAttempts >= 12) {
                await accountServices.deleteAllAccountData();
                dispatch(resetAllSlice());
                return;
            }

            // Exponential delay logic (1s -> 2s -> 5s...)
            const delays = [1, 2, 5, 10, 30, 60, 300, 600, 1800, 3600];
            const delayInSeconds = delays[newFailedAttempts - 1] || 3600;
            
            // Set time lock
            dispatch(setTimeLock(moment().valueOf()));

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
        triggerFaceId,
    };
};

export default useRequirePinCode;
