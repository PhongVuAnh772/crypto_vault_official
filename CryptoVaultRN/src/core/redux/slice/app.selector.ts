import { RootState } from "src/core/redux/store";

export const getKeyboardHeight = (state: RootState) => state?.app?.keyboardHeight;
export const getAuthAction = (state: RootState) => state?.app?.authAction;
export const getIsFirstTime = (state: RootState) => state?.app?.isFirstTime;
export const getKeepSplash = (state: RootState) => state?.app?.keepSplash;
export const getShowForceUpdateModal = (state: RootState) => state?.app?.showForceUpdateModal;
export const getRemoteConfigAppVersion = (state: RootState) => state?.app?.remoteConfigAppVersion;
export const getForceUpdate = (state: RootState) => state?.app?.forceUpdate;
export const getTimeLock = (state: RootState) => state?.app?.timeLock;
export const getFailedPinAttempts = (state: RootState) => state?.app?.failedPinAttempts;
export const getMaxPinCodeAttempts = (state: RootState) => state?.app?.maxPinCodeAttempts;
export const getThemeMode = (state: RootState) => state?.app?.themeMode;
export const getLanguageType = (state: RootState) => state?.app?.languageType;
export const getRequirePinCode = (state: RootState) => state?.app?.requirePinCode;
export const selectorSettingCurrency = (state: RootState) => state?.app?.settingCurrency;
export const selectorSelectedCurrencySetting = (state: RootState) => state?.app?.selectedCurrencySetting;
export const selectorIsModalShow = (state: RootState) => state?.app?.isModalShow;
export const selectorEnableFaceIdOrTouch = (state: RootState) => state?.app?.enableFaceIdOrTouch;
export const getCryptoCurrencyState = (state: RootState) => state?.app?.cryptosCurrency;
export const getShowModalConfirmTransaction = (state: RootState) => state?.app?.showModalConfirmTransaction;
export const selectorIspressActionNoti = (state: RootState) => state?.app?.pressActionNoti;
export const getMinFeeForJettonTransfer = (state: RootState) => state?.app?.minFeeForJettonTransfer;
export const getBlockJettonTransfer = (state: RootState) => state?.app?.blockJettonTransfer;
export const getBlockTonNftTransfer = (state: RootState) => state?.app?.blockTonNftTransfer;
export const getBlockTonTransfer = (state: RootState) => state?.app?.blockTonTransfer;
export const getBlockBitcoinTransfer = (state: RootState) => state?.app?.blockBitcoinTransfer;
export const getShowCommonErrorModal = (state: RootState) => state?.app?.showCommonErrorModal;
export const getTonAdminBounce = (state: RootState) => state?.app?.tonAdminBounce;
export const getJettonAdminBounce = (state: RootState) => state?.app?.jettonAdminBounce;
export const getUpdateBalance = (state: RootState) => state?.app?.updateBalance;
export const getHeightBottomTab = (state: RootState) => state?.app?.heightBottomTab;
export const getWebViewShowing = (state: RootState) => state?.app?.webViewIsShowing;
export const getAppState = (state: RootState) => state?.app;
export const getStateActionFailedNeedToContact = (state: RootState) =>
  state?.app?.actionFailedNeedToContact ?? "";
export const getLockoutLocalAuthentication = (state: RootState) =>
  state?.app?.isLockoutLocalAuthentication ?? false;
export const getSwapGuidingShow = (state: RootState) =>
  state?.app?.swapGuidingShow ?? false;
export const getEnablePassword = (state: RootState) =>
  state?.app?.enablePassword ?? true;
export const getIsTestnet = (state: RootState) =>
  state?.app?.isTestnet ?? true;
