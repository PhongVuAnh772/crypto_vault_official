import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { Feature } from "src/core/enum/ContactFailedAction";
import { ProtocolType } from "src/core/enum/ProtocolType";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { getPin } from "src/core/redux/slice/account.slice";
import {
  changePinCode,
  getLockoutLocalAuthentication,
  setActionFailedNeedToContact,
  setShowCommonErrorModal,
} from "src/core/redux/slice/app.slice";
import createContextError from "src/core/services/ContextError";
import FaceIdOrTouch from "src/core/services/FaceIdOrTouch";
import { AppThemeType } from "src/core/type/ThemeType";
import GlobalUtils from "src/core/utils/globalUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const useChangePinCode = ({ navigation }: RootNavigationType) => {
  const dispatch = useAppDispatch();
  const theme: AppThemeType = useAppTheme();
  const currentPin = useAppSelector(getPin);
  const [isNewPin, setIsNewPin] = useState(true);
  const [checkOldPinCode, setCheckOldPinCode] = useState(true);
  const [showModalChangePinCodeSuccess, setShowModalChangePinCodeSuccess] =
    useState(false);
  const [pinCode, setPinCode] = useState("");
  const [rePinCode, setRePinCode] = useState("");
  const [incorrectPin, setIncorrectPin] = useState(false);
  const isLockoutLocalAuthentication = useAppSelector(
    getLockoutLocalAuthentication
  );
  const faceIdOrTouch = new FaceIdOrTouch(
    t,
    dispatch,
    isLockoutLocalAuthentication
  );

  const code = isNewPin ? pinCode : rePinCode;

  const closeModalChangePinCodeSuccess = () =>
    setShowModalChangePinCodeSuccess(false);
  const onModalChangePinCodeSuccessDismiss = () => {
    backActionDefault();
  };

  const backActionDefault = () => navigation.goBack();
  const backAction = () => {
    if (checkOldPinCode || isNewPin) {
      backActionDefault();
    } else {
      setIsNewPin(true);
      setPinCode("");
      setRePinCode("");
      setIncorrectPin(false);
    }
  };

  const checkOldPinCodeDone = () => setCheckOldPinCode(false);

  const clearError = () => setIncorrectPin(false);

  useEffect(() => {
    if (pinCode?.length === 6) {
      if (currentPin === pinCode) {
        setIncorrectPin(true);
      } else {
        setIsNewPin(false);
        setRePinCode("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinCode?.length]);

  const changePinCodeAction = async () => {
    const resAction = await dispatch(changePinCode({ pinCode: rePinCode }));
    if (changePinCode.fulfilled.match(resAction)) {
      await faceIdOrTouch.storePinCode(pinCode);
      setShowModalChangePinCodeSuccess(true);
    } else {
      const errorConTextMissingData = createContextError({
        feature: Feature.Setting,
        fileError: `change.pincode.hook.ts`,
        functionError: `changePinCodeAction`,
        lineError: 69,
        reason: `changePinCode.rejected`,
        protocol: ProtocolType.All,
      });
      dispatch(setShowCommonErrorModal(true));
      dispatch(setActionFailedNeedToContact(errorConTextMissingData));
    }
  };

  useEffect(() => {
    if (rePinCode?.length === 6) {
      if (rePinCode === pinCode && rePinCode) {
        changePinCodeAction();
      } else {
        setIncorrectPin(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rePinCode?.length]);

  const onChangeCode = (text: string) => {
    if (incorrectPin) {
      clearError();
    }
    if (isNewPin) {
      setPinCode(text);
    } else {
      setRePinCode(text);
    }
  };

  return {
    theme,
    isNewPin,
    showModalChangePinCodeSuccess,
    backAction,
    backActionDefault,
    checkOldPinCode,
    checkOldPinCodeDone,
    code,
    onChangeCode,
    incorrectPin,
    onModalChangePinCodeSuccessDismiss,
    closeModalChangePinCodeSuccess,
  };
};
export default useChangePinCode;
