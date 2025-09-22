import remoteConfig from "@react-native-firebase/remote-config";
import { StackActions } from "@react-navigation/native";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BootSplash from "react-native-bootsplash";
import AppToastType from "src/core/enum/AppToastType";
import SecureStorageKey from "src/core/enum/SecureStorageKey";
import AppI18Next from "src/core/locales";
import LanguageKey from "src/core/locales/LanguageKey";
import NativeJailbreakCheckerModule from "src/core/modules/JailbreakCheckerModules/JailbreakCheckerModules";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  addAccount,
  getAccountId,
  setAccount,
  setSelectAccountId,
} from "src/core/redux/slice/account.slice";
import {
  getFailedPinAttempts,
  getIsFirstTime,
  getLanguageType,
  getTimeLock,
  resetAllSlice,
  resetPinCodeData,
  setIsModalShow,
  setKeepSplash,
} from "src/core/redux/slice/app.slice";
import AccountServices from "src/core/services/AccountServices";
import EncryptAES from "src/core/services/EncryptAES";
import SecureStorage from "src/core/services/SecureStorage";
import Utils from "src/core/utils/commonUtils";
import RemoteUtils from "src/core/utils/remoteUtils";
import { handleGetCountingListOnGoing } from "src/features/home/bottomTab/explore/explore.slice";
import {
  AuthStackScreenKey,
  NavigationStackKey,
} from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const useSplash = ({ navigation }: RootNavigationType) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const timeLock = useAppSelector(getTimeLock);
  const languageType = useAppSelector(getLanguageType) ?? "";
  const failedPinAttempts = useAppSelector(getFailedPinAttempts);
  const selectWalletId = useAppSelector(getAccountId);
  const [showRequirePinCode, setShowRequirePinCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { i18n } = useTranslation();
  const isFirstTime = useAppSelector(getIsFirstTime);

  const fetchDataClaimCounting = async () => {
    await dispatch(handleGetCountingListOnGoing());
  };

  const checkLookTime = () => {
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
  const goToOnboarding = () => {
    navigation.dispatch(
      StackActions.replace(AuthStackScreenKey.OnboardingScreen)
    );
  };

  const navigateReplaceAction = (navigateName: string) =>
    navigation.dispatch(StackActions.replace(navigateName));

  const timeOutKeepSplashAction = async (action: () => void) => {
    setTimeout(async () => {
      action();
      dispatch(setKeepSplash(false));
      await BootSplash.hide({ fade: true });
    }, 1000);
  };

  const actionAfterPassPinCode = async (currentPinCode: string) => {
    setLoading(true);
    dispatch(setIsModalShow(false));
    try {
      const accountServices = new AccountServices();

      const walletData =
        await accountServices.getAccountDataWithEncrypt(currentPinCode);

      if (walletData && walletData.length > 0) {
        const isVersion0 = walletData.some((e) => e.version == null);

        if (isVersion0) {
          const newWalletData = [...walletData].reverse();
          for await (const wallet of newWalletData) {
            await dispatch(
              addAccount({
                mnemonic: wallet.mnemonic,
                pinCode: currentPinCode,
              })
            );
          }

          // Remove old wallets data
          await SecureStorage.removeItem(SecureStorageKey.wallets);
        } else {
          // Set wallets data to Redux store.
          dispatch(setAccount(walletData));
          const currentAccount =
            walletData.find((e) => e.id === selectWalletId) ?? walletData[0];
          dispatch(setSelectAccountId(currentAccount.id));
        }

        navigateReplaceAction(NavigationStackKey.HomeStack);
      } else {
        Utils.showToast({
          msg: t(LanguageKey.send_push_error_title),
          type: AppToastType.error,
        });
        goToOnboarding();
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const checkJailbreak = async () => {
    const skipCheckJailbreakOrRoot = RemoteUtils.jailbreakConfig();
    if (skipCheckJailbreakOrRoot) {
      return false;
    }
    try {
      const jailbreakCheckerModule = new NativeJailbreakCheckerModule();

      console.log("====================================");
      console.log("Check Jailbreak start");
      console.log("====================================");
      const check = await jailbreakCheckerModule.isJailBroken();
      console.log("====================================");
      console.log("Check Jailbreak result");
      console.log("Device is jailbreak or root - ", check);
      console.log("====================================");
      if (check && check === true) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("====================================");
      console.log("Check Jailbreak result");
      console.log("Device is jailbreak or root - ", error);
      console.log("====================================");
      return false;
    }
  };

  const initLogic = async () => {
    i18n.changeLanguage(languageType);

    // MARK: Remote config: get theme config
    await remoteConfig().fetchAndActivate();
    RemoteUtils.themeConfig();

    const deviceIsJailbreakOrRoot = await checkJailbreak();
    if (deviceIsJailbreakOrRoot) {
      Utils.showToast({
        msg: AppI18Next.t(LanguageKey.common_text_error_title),
        type: AppToastType.error,
        visibilityTime: 10000000,
      });
      return;
    }

    dispatch(setIsModalShow(true));
    // MARK: Look time logic
    checkLookTime();

    // MARK: Clear local data if is first time
    if (isFirstTime) {
      await SecureStorage.clear();
    }

    // MARK: Get wallets data from local storage and check type
    const walletEncryptedData =
      (await SecureStorage.getObject(SecureStorageKey.accounts)) ??
      (await SecureStorage.getObject(SecureStorageKey.wallets));

    const encryptAES = new EncryptAES();

    const walletEncryptedDataRes =
      encryptAES.isAccountEncryptedType(walletEncryptedData);

    if (walletEncryptedDataRes) {
      timeOutKeepSplashAction(() => setShowRequirePinCode(true));
    } else {
      await SecureStorage.clear();
      timeOutKeepSplashAction(goToOnboarding);
      dispatch(resetAllSlice());
    }
    fetchDataClaimCounting();
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
