import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ScreenWrapper } from "src/components";
import AppModal from "src/components/common/AppModal";
import AppText from "src/components/common/AppText";
import RequirePinCodeLayout from "src/components/layout/RequirePinCode/requirePinCode.view";
import { ToastSuccessSvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import PinIndicator from "src/features/auth/components/PinIndicator";
import PinKeypad from "src/features/auth/components/PinKeypad";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useChangePinCode from "./change.pincode.hook";
import useStyles from "./change.pincode.style";

const ChangePincodeScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    theme,
    isNewPin,
    showModalChangePinCodeSuccess,
    backAction,
    checkOldPinCode,
    checkOldPinCodeDone,
    code,
    onChangeCode,
    incorrectPin,
    onModalChangePinCodeSuccessDismiss,
    closeModalChangePinCodeSuccess,
  } = useChangePinCode({
    navigation,
  });
  const styles = useStyles(theme);
  return (
    <ScreenWrapper
      enableDismissKeyboard
      enableHeader
      paddingTop
      headerTitleWithI18n={
        isNewPin ? LanguageKey.create_pin_title : LanguageKey.re_enter_pin_title
      }
      backAction={backAction}
      headerTextVariant={TextVariantKeys.titleLarge}
      backgroundColor={theme.colors.surface_surface_default}
    >
      <RequirePinCodeLayout
        visible={checkOldPinCode}
        onClose={backAction}
        headerTitle={LanguageKey.change_pin_code_old_pin_title}
        continueActionAfterPassPinCode={checkOldPinCodeDone}
        disableFaceId
      />
      {!checkOldPinCode && (
        <View style={appStyles.flex1}>
          {/* Mesh Backgrounds */}
          <LinearGradient
            colors={["#DCE9FF", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(245, 243, 255, 0.7)", "rgba(255, 255, 255, 0)"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0.3, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(236, 253, 245, 0.4)", "rgba(255, 255, 255, 0)"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0.5, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.content}>
            <AppText
              titleWithI18n={LanguageKey.pin_input_title}
              variant={TextVariantKeys.bodyRLarge}
              textColor="#1F2937"
              styles={styles.title}
            />

            <PinIndicator length={6} value={code} />

            {incorrectPin && (
              <AppText
                titleWithI18n={isNewPin ? LanguageKey.change_pin_code_error : LanguageKey.incorrect_pin_title}
                variant={TextVariantKeys.bodyRSmall}
                textColor="#EF4444"
                styles={styles.errorText}
              />
            )}
          </View>

          <View style={styles.keypadWrapper}>
            <PinKeypad
              onPressNumber={(num: string) => {
                if (code.length < 6) {
                  onChangeCode(code + num);
                }
              }}
              onPressDelete={() => {
                onChangeCode(code.slice(0, -1));
              }}
            />
          </View>
        </View>
      )}
      <AppModal
        visible={showModalChangePinCodeSuccess}
        onPress={closeModalChangePinCodeSuccess}
        onDismiss={onModalChangePinCodeSuccessDismiss}
        titleWithI18n={LanguageKey.changed_success_title}
        subTitleWithI18n={LanguageKey.your_pin_code_changed_success}
        buttonTitleWithI18n={LanguageKey.common_text_ok}
        icon={<ToastSuccessSvgIcon />}
      />
    </ScreenWrapper>
  );
};

export default ChangePincodeScreen;
