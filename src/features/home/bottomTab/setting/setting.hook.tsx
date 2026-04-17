import { StackActions, StackActionType } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import { openSettings } from "react-native-permissions";
import { RootNavigationType } from "src/auth/SplashScreen/index.view";
import {
  AttachMoneySvgIcon,
  ContactSvgIcon,
  DocumentSvgIcon,
  FaceIdSvgIcon,
  FAQSvgIcon,
  FingerprintSvgIcon,
  LanguageSvgIcon,
  Lock03SvgIcon,
  Shield02SvgIcon,
  SwapSvgIcon,
} from "src/core/constants/AppIconsSvg";
import AppToastType from "src/core/enum/AppToastType";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { useTonAddressData } from "src/core/redux/slice/account.selector";
import { getPin } from "src/core/redux/slice/account.slice";
import {
  getIsTestnet,
  getLockoutLocalAuthentication,
  getSwapGuidingShow,
  selectorEnableFaceIdOrTouch,
} from "src/core/redux/slice/app.selector";
import {
  setEnableFaceIdOrTouch,
  setIsTestnet,
} from "src/core/redux/slice/app.slice";
import { getIsShowSwap } from "src/core/redux/slice/swap/swap.slice";
import FaceIdOrTouch from "src/core/services/FaceIdOrTouch";
import { FaceIdOrTouchCheckType } from "src/core/services/FaceIdOrTouch/faceIdOrTouchType";
import TelegramService, { TelegramUser } from "src/core/services/TelegramService";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { SwitchView } from "./setting.components";
import settingStyles from "./setting.styles";
import { SettingListType } from "./setting.type";

export const useSetting = ({ navigation }: RootNavigationType) => {
  const dispatch = useAppDispatch();
  const tonAddressData = useTonAddressData();
  const pinCode = useAppSelector(getPin);
  const enableFaceIdOrTouch = useAppSelector(selectorEnableFaceIdOrTouch);
  const isLockoutLocalAuthentication = useAppSelector(
    getLockoutLocalAuthentication
  );
  const guidingSwap = useAppSelector(getSwapGuidingShow);
  const isShowSwap = useAppSelector(getIsShowSwap);
  const isTestnet = useAppSelector(getIsTestnet);

  // const dispatch = useAppDispatch();

  const theme: AppThemeType = useAppTheme();
  const { t } = useTranslation();
  const [showModalWarningRecoveryPhrase, setShowModalWarningRecoveryPhrase] =
    useState(false);
  const [showRequirePinCode, setShowRequirePinCode] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [showTelegramLogin, setShowTelegramLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const closeShowRequirePinCode = () => setShowRequirePinCode(false);
  const openCloseShowRequirePinCode = () => setShowRequirePinCode(true);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [
    navigateAfterModalRecoveryPhraseDismiss,
    setNavigateAfterModalRecoveryPhraseDismiss,
  ] = useState<StackActionType>();

  const closeModalWarningRecoveryPhrase = () =>
    setShowModalWarningRecoveryPhrase(false);
  const openModalWarningRecoveryPhrase = () =>
    setShowModalWarningRecoveryPhrase(true);

  const goToRecoveryPhraseScreen = () => {
    closeModalWarningRecoveryPhrase();
    if (Utils.isAndroid) {
      navigation.dispatch(StackActions.push(HomeStackScreenKey.RecoveryPhrase));
    } else {
      setNavigateAfterModalRecoveryPhraseDismiss(
        StackActions.push(HomeStackScreenKey.RecoveryPhrase)
      );
    }
  };

  const onModalRecoveryPhraseDismiss = () => {
    closeShowRequirePinCode();
    if (navigateAfterModalRecoveryPhraseDismiss) {
      navigation.dispatch(navigateAfterModalRecoveryPhraseDismiss);
      setNavigateAfterModalRecoveryPhraseDismiss(undefined);
    }
  };

  const goToCurrency = () => {
    navigation.dispatch(StackActions.push(HomeStackScreenKey.Currency));
  };

  const biometrixTitle = {
    type: Utils.isAndroid
      ? t(LanguageKey.common_text_touch_id)
      : t(LanguageKey.common_text_face_id_and_touch),
  };

  const closeOpenSettingsModal = () => setOpenSettingsModal(false);

  const openSettingsAction = async () => {
    try {
      await openSettings();
    } catch (error) {
      console.error("openSettingsAction Error:", error);
      Utils.showToast({
        msg: t(LanguageKey.send_push_error_title),
        type: AppToastType.error,
      });
    }
    closeOpenSettingsModal();
  };

  const enableFaceId = async (): Promise<void> => {
    try {
      const faceIdOrTouch = new FaceIdOrTouch(
        t,
        dispatch,
        isLockoutLocalAuthentication
      );
      if (enableFaceIdOrTouch) {
        dispatch(setEnableFaceIdOrTouch(false));
        await faceIdOrTouch.reset();
        return;
      }
      const checkFaceIdOrTouchResult = await faceIdOrTouch.checkFaceIdOrTouch();
      if (!pinCode) {
        Utils.showToast({
          msg: t(LanguageKey.send_push_error_title),
          type: AppToastType.error,
        });
        return;
      }
      switch (checkFaceIdOrTouchResult) {
        case FaceIdOrTouchCheckType.Done: {
          const faceIdOrTouchResult = await faceIdOrTouch.storePinCode(pinCode);
          if (faceIdOrTouchResult) {
            dispatch(setEnableFaceIdOrTouch(true));
          } else {
            Utils.showToast({
              msg: t(LanguageKey.send_push_error_title),
              type: AppToastType.error,
            });
          }
          break;
        }
        case FaceIdOrTouchCheckType.Reject:
          dispatch(setEnableFaceIdOrTouch(false));
          break;
        case FaceIdOrTouchCheckType.OpenSettings:
          setOpenSettingsModal(true);
          break;
        default:
          break;
      }
    } catch {
      Utils.showToast({
        msg: t(LanguageKey.send_push_error_title),
        type: AppToastType.error,
      });
    }
  };

  const featureCurrency = {
    icon: AttachMoneySvgIcon,
    title: LanguageKey.currency_title,
    onPress: goToCurrency,
  };

  const featureLanguages = {
    icon: LanguageSvgIcon,
    title: LanguageKey.language_title,
    onPress: () =>
      navigation.dispatch(StackActions.push(HomeStackScreenKey.ChangeLanguage)),
  };

  const featureRecoveryPhrase = {
    icon: Shield02SvgIcon,
    title: LanguageKey.secret_phrase_risk_header,
    onPress: () => openModalWarningRecoveryPhrase(),
  };

  const featureChangePinCode = {
    icon: Lock03SvgIcon,
    title: LanguageKey.change_pin_code_title,
    onPress: () =>
      navigation.dispatch(StackActions.push(HomeStackScreenKey.ChangePincode)),
  };

  const featureFaceId = {
    icon: Utils.isAndroid ? FingerprintSvgIcon : FaceIdSvgIcon,
    title: t(LanguageKey.face_id_enable, {
      type: Utils.isAndroid
        ? t(LanguageKey.common_text_touch_id)
        : t(LanguageKey.common_text_face_id_and_touch),
    }),
    onPress: () => { },
    rightView: (
      <SwitchView
        value={enableFaceIdOrTouch}
        onValueChange={enableFaceId}
        theme={theme}
      />
    ),
  };
  const featureTestnet = {
    icon: Shield02SvgIcon,
    title: "Testnet Mode",
    onPress: () => { },
    rightView: (
      <SwitchView
        value={isTestnet}
        onValueChange={(val: boolean) => {
          dispatch(setIsTestnet(val));
        }}
        theme={theme}
      />
    ),
  };
  const featureSwap = {
    icon: SwapSvgIcon,
    title: LanguageKey.home_swap_title,
    onPress: () => {
      if (guidingSwap) {
        navigation.dispatch(StackActions.push(HomeStackScreenKey.GuidingSwap));
      } else {
        navigation.dispatch(StackActions.push(HomeStackScreenKey.Swap));
      }
    },
  };
  //             theme={theme}
  //         />
  //     ),
  // };

  const featureAdminPortal = {
    icon: Shield02SvgIcon,
    title: "Admin Portal",
    onPress: () => {
      Linking.openURL("http://localhost:5173"); // Opening Web Admin Dashboard
    },
  };

  const handleTelegramSuccess = async (authData: any) => {
    setShowTelegramLogin(false);
    const tonAddress = tonAddressData?.address;
    if (!tonAddress) return;

    setLoading(true);
    try {
      const result = await TelegramService.verifyLogin(authData, tonAddress);
      if (result.success) {
        setTelegramUser(result.user);
        Utils.showToast({ msg: `LoggedIn as ${result.user.firstName}`, type: AppToastType.success });
      }
    } catch (err) {
      console.error(err);
      Utils.showToast({ msg: "Telegram verification failed", type: AppToastType.error });
    } finally {
      setLoading(false);
    }
  };

  const featureTelegramLogin = {
    icon: ContactSvgIcon,
    title: telegramUser ? `Linked: @${telegramUser.username || telegramUser.firstName}` : "Link Telegram Account",
    onPress: () => {
      if (!telegramUser) setShowTelegramLogin(true);
    },
  };

  const featureTelegramFaucet = {
    icon: ContactSvgIcon,
    title: "Get free TON (Telegram Bot)",
    onPress: () => {
      // Deep link to TON Faucet Bot with start parameter for wallet address
      const address = tonAddressData?.address;
      const url = address
        ? `tg://resolve?domain=testgiver_ton_bot&start=${address}`
        : "tg://resolve?domain=testgiver_ton_bot";
      Linking.openURL(url).catch(() => {
        const webUrl = address
          ? `https://t.me/testgiver_ton_bot?start=${address}`
          : "https://t.me/testgiver_ton_bot";
        Linking.openURL(webUrl);
      });
    },
  };

  const listScreen: SettingListType[] = [
    {
      title: "Network Environment",
      data: isTestnet ? [featureTestnet, featureTelegramFaucet] : [featureTestnet],
    },
    {
      title: "Social Accounts",
      data: [featureTelegramLogin],
    },
    {
      title: "Administration",
      data: [featureAdminPortal],
    },
    ...(isShowSwap
      ? [
        {
          title: LanguageKey.home_swap_title,
          data: [featureSwap],
        },
      ]
      : []),
    {
      title: LanguageKey.security_title,
      data: [
        featureChangePinCode,
        featureRecoveryPhrase,
        featureLanguages,
        featureCurrency,
        featureFaceId,
      ],
    },
    {
      title: LanguageKey.setting_general,
      data: [
        {
          title: LanguageKey.setting_about_ledgerify,
          icon: DocumentSvgIcon,
          onPress: () =>
            navigation.dispatch(StackActions.push(HomeStackScreenKey.AboutUs)),
        },
        {
          title: LanguageKey.setting_contact_support,
          icon: ContactSvgIcon,
          onPress: () =>
            navigation.dispatch(StackActions.push(HomeStackScreenKey.Contact)),
        },
        {
          title: LanguageKey.setting_faq,
          icon: FAQSvgIcon,
          onPress: () =>
            navigation.dispatch(StackActions.push(HomeStackScreenKey.FAQ)),
        },
      ],
    },
  ];

  useEffect(() => {
    return () => {
      setShowModalWarningRecoveryPhrase(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const settingStyle = settingStyles(theme);
  return {
    biometrixTitle,
    listScreen,
    theme,
    settingStyle,
    showModalWarningRecoveryPhrase,
    setShowModalWarningRecoveryPhrase,
    closeModalWarningRecoveryPhrase,
    goToRecoveryPhraseScreen,
    goToCurrency,
    openSettingsAction,
    closeOpenSettingsModal,
    openSettingsModal,
    showRequirePinCode,
    closeShowRequirePinCode,
    openCloseShowRequirePinCode,
    onModalRecoveryPhraseDismiss,
    telegramUser,
    showTelegramLogin,
    setShowTelegramLogin,
    handleTelegramSuccess,
    loading,
  };
};
