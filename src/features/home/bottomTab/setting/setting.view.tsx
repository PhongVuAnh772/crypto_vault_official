import React from "react";
import { View } from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppModal from "src/components/common/AppModal";
import AppText from "src/components/common/AppText";
import RequirePinCodeLayout from "src/components/layout/RequirePinCode/requirePinCode.view";
import appColors from "src/core/constants/AppColors";
import { DangerSvgIcon, WarnSvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { ListSettingScreen } from "./setting.components";
import { useSetting } from "./setting.hook";
import TelegramLoginModal from "src/components/common/TelegramLoginModal";

const SettingScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    biometrixTitle,
    listScreen,
    theme,
    settingStyle,
    showModalWarningRecoveryPhrase,
    closeModalWarningRecoveryPhrase,
    goToRecoveryPhraseScreen,
    openSettingsAction,
    closeOpenSettingsModal,
    openSettingsModal,
    showRequirePinCode,
    closeShowRequirePinCode,
    openCloseShowRequirePinCode,
    onModalRecoveryPhraseDismiss,
    showTelegramLogin,
    setShowTelegramLogin,
    handleTelegramSuccess
  } = useSetting({ navigation });

  return (
    <ScreenWrapper
      paddingTop
      subStyle={[settingStyle.flex1, settingStyle.mh25, settingStyle.mt30]}
      backgroundColor={theme.colors.surface_surface_default}
    >
      <View style={[appStyles.flex1]}>
        <ListSettingScreen listScreen={listScreen} />
      </View>
      <AppModal
        onTouchOutside={closeOpenSettingsModal}
        titleWithI18n={LanguageKey.face_id_sub_denied_title}
        titleI18nParam={biometrixTitle}
        subTitleWithI18n={LanguageKey.face_id_sub_denied_sub_title}
        subTitleI18nParam={biometrixTitle}
        visible={openSettingsModal}
        onPress2={closeOpenSettingsModal}
        buttonTitleWithI18n2={LanguageKey.transaction_history_close}
        onPress={openSettingsAction}
        twoOptions={true}
        buttonTitleWithI18n={LanguageKey.common_open_settings}
        icon={<WarnSvgIcon />}
        textButtonSecondColor={appColors.main.tokyoRed}
      />
      <AppModal
        subModal={
          <RequirePinCodeLayout
            visible={showRequirePinCode}
            onClose={closeShowRequirePinCode}
            continueActionAfterPassPinCode={goToRecoveryPhraseScreen}
          />
        }
        onDismiss={onModalRecoveryPhraseDismiss}
        visible={showModalWarningRecoveryPhrase}
        icon={<DangerSvgIcon />}
        onTouchOutside={closeModalWarningRecoveryPhrase}
        keepBottomButton={false}
        titleWithI18n={LanguageKey.reveal_secret_recovery_phrase_title}
        footerView={
          <View>
            <AppText
              styles={settingStyle.textAlign}
              titleWithI18n={LanguageKey.des_reveal_secret_recovery_phrase}
              variant={TextVariantKeys.bodyRMedium}
              textColor={theme.colors.text_on_surface_text_high}
            />
            <View style={appStyles.mt15}>
              <AppText
                styles={settingStyle.textAlign}
                titleWithI18n={LanguageKey.des_reveal_secret_recovery_phrase2}
                variant={TextVariantKeys.bodyRMedium}
                textColor={theme.colors.text_on_surface_text_high}
              >
                <AppText
                  styles={settingStyle.textAlign}
                  titleWithI18n={LanguageKey.secret_recovery_phrase}
                  variant={TextVariantKeys.titleSmall}
                  textColor={theme.colors.text_on_surface_text_high}
                />
              </AppText>
              <AppText
                styles={settingStyle.textAlign}
                titleWithI18n={LanguageKey.des_reveal_secret_recovery_phrase3}
                variant={TextVariantKeys.bodyRMedium}
                textColor={theme.colors.text_on_surface_text_high}
              />
              <View style={appStyles.mt25}>
                {
                  <AppButton
                    onPress={openCloseShowRequirePinCode}
                    titleWithI18n={LanguageKey.understand_continue}
                    textColor={theme.colors.text_on_surface_text_invert}
                    styles={settingStyle.buttonModal_continue}
                  />
                }
                {
                  <AppButton
                    onPress={closeModalWarningRecoveryPhrase}
                    titleWithI18n={LanguageKey.cancel}
                    textColor={theme.colors.text_on_surface_text_brand_2}
                    styles={settingStyle.buttonModal_cancel}
                  />
                }
              </View>
            </View>
          </View>
        }
      />
      <TelegramLoginModal
        visible={showTelegramLogin}
        onClose={() => setShowTelegramLogin(false)}
        onLoginSuccess={handleTelegramSuccess}
        botName="crypto_vault_setting_bot"
      />
    </ScreenWrapper>
  );
};

export default SettingScreen;
