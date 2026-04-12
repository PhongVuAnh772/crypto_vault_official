import { StackActions } from "@react-navigation/native";
import moment from "moment";
import { useEffect, useState } from "react";
import BootSplash from "react-native-bootsplash";
import SecureStorageKey from "src/core/enum/SecureStorageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { addAccount } from "src/core/redux/slice/account.slice";
import {
  getFailedPinAttempts,
  getIsFirstTime,
  getTimeLock,
  resetAppSlice,
  resetPinCodeData,
  setIsModalShow,
  setKeepSplash,
} from "src/core/redux/slice/app.slice";
import AccountServices from "src/core/services/AccountServices";
import EncryptAES from "src/core/services/EncryptAES";
import SecureStorage from "src/core/services/SecureStorage";
import {
  AuthStackScreenKey,
  NavigationStackKey,
} from "src/navigation/enum/NavigationKey";

const useSplash = ({ navigation }: { navigation: any }) => {
  const [showRequirePinCode, setShowRequirePinCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const isFirstTime = useAppSelector(getIsFirstTime);
  const dispatch = useAppDispatch();
  const failedPinAttempts = useAppSelector(getFailedPinAttempts);
  const timeLock = useAppSelector(getTimeLock);

  const timeOutKeepSplashAction = async (action: () => void) => {
    setTimeout(async () => {
      action();
      dispatch(setKeepSplash(false));
      await BootSplash.hide({ fade: true });
    }, 1000);
  };

  const goToOnboarding = () => {
    navigation.dispatch(
      StackActions.replace(AuthStackScreenKey.OnboardingScreen)
    );
  };

  const checkLockTime = () => {
    if (timeLock === undefined) {
      dispatch(resetPinCodeData());
    } else {
      const targetTimestamp = timeLock + failedPinAttempts * 3 * 60 * 1000;
      const currentTimestamp = moment().valueOf();
      if (targetTimestamp <= currentTimestamp) {
        dispatch(resetPinCodeData());
      }
    }
  };
  const initLogic = async () => {
    checkLockTime();
    dispatch(setIsModalShow(false));
    if (isFirstTime) {
      await SecureStorage.clear();
    }
    console.log(isFirstTime, "isFirstTime");
    const encryptAES = new EncryptAES();
    const walletEncryptedData = await SecureStorage.getObject(
      SecureStorageKey.accounts
    );
    const walletEncryptedDataRes =
      encryptAES.isAccountEncryptedType(walletEncryptedData);
    console.log(encryptAES, "encryptAES");

    if (walletEncryptedDataRes) {
      timeOutKeepSplashAction(() => setShowRequirePinCode(true));
    } else {
      await SecureStorage.clear();
      timeOutKeepSplashAction(goToOnboarding);
      dispatch(resetAppSlice());
    }
  };
  const navigateReplaceAction = (navigateName: string) =>
    navigation.dispatch(StackActions.replace(navigateName));
  const actionAfterPassPinCode = async (currentPinCode: string) => {
    setLoading(true);
    dispatch(setIsModalShow(false));

    try {
      const accountServices = new AccountServices();

      const walletData =
        await accountServices.getAccountDataWithEncrypt(currentPinCode);

      console.log(walletData, "walletData");

      if (walletData && walletData.length > 0) {
        const newWalletData = [...walletData].reverse();
        for await (const wallet of newWalletData) {
          await dispatch(
            addAccount({
              mnemonic: wallet.mnemonic,
              pinCode: currentPinCode,
            })
          );
        }

        navigateReplaceAction(NavigationStackKey.HomeStack);
      } else {
        // Utils.showToast({
        //   msg: t(LanguageKey.send_push_error_title),
        //   type: AppToastType.error,
        // });
        goToOnboarding();
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    initLogic();
    return () => {
      dispatch(setKeepSplash(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { actionAfterPassPinCode, showRequirePinCode, loading };
};
export default useSplash;
