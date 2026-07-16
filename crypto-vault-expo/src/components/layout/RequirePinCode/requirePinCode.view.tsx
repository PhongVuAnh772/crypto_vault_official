import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import AppText from "src/components/common/AppText";
import LoadingScreen from "src/components/common/LoadingScreen";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";
import PinIndicator from "src/features/auth/components/PinIndicator";
import PinKeypad from "src/features/auth/components/PinKeypad";
import CountdownTimer from "./CountdownTimer";
import useRequirePinCode from "./requirePinCode.hook";

type RequirePinCodeLayoutType = {
  headerTitle?: string;
  subVisible?: boolean;
  visible?: boolean;
  onClose?: () => void;
  continueActionAfterPassPinCode?: (pinCode: string) => void;
  isWebviewShowing?: boolean;
  isMainRequirePinCode?: boolean;
  disableFaceId?: boolean;
};

const RequirePinCodeLayout: React.FC<RequirePinCodeLayoutType> = ({
  headerTitle,
  subVisible = true,
  visible,
  onClose,
  continueActionAfterPassPinCode,
  isWebviewShowing = false,
  isMainRequirePinCode = false,
  disableFaceId = false,
}) => {
  const {
    requirePinCode,
    pinCode,
    onChangeValue,
    incorrectPin,
    insets,
    maxPinCodeAttempts,
    timeLock,
    remainingTime,
    keepSplash,
    theme,
    isUseFaceIdOrTouch,
    onCloseAction,
    ignoreUnfocusCheck,
  } = useRequirePinCode({
    isMainRequirePinCode,
    visible: visible,
    continueActionAfterPassPinCode: continueActionAfterPassPinCode,
    onClose,
    disableFaceId,
  });

  const styles = useStyles(theme, insets);
  const header = (
    <AppText
      titleWithI18n={headerTitle ?? LanguageKey.pin_code_title}
      variant={TextVariantKeys.titleLarge}
      styles={appStyles.textAlignCenter}
      textColor={theme.colors.text_on_surface_text_highest}
    />
  );

  const showState = subVisible && (visible ?? requirePinCode) && !keepSplash;
  return showState ? (
    <View style={styles.container}>
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

      {timeLock ? (
        <CountdownTimer remainingTime={remainingTime} />
      ) : (
        <View style={appStyles.flex1}>
          <View style={[styles.header, { marginTop: insets.top + 20 }]}>
            {onClose ? (
              <TouchableOpacity
                onPress={onCloseAction}
                style={styles.backButton}
              >
                <Feather name="chevron-left" size={28} color="#000" />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerSpacer} />
            )}
          </View>

          <View style={styles.content}>
            <AppText
              titleWithI18n={headerTitle ?? LanguageKey.pin_code_title}
              variant={TextVariantKeys.titleMedium}
              textColor="#374151"
              styles={styles.title}
            />

            <PinIndicator length={6} value={pinCode} />

            {incorrectPin && (
              <AppText
                titleWithI18n={LanguageKey.incorrect_pin_title}
                variant={TextVariantKeys.bodyRSmall}
                textColor="#EF4444"
                styles={styles.errorText}
              />
            )}
          </View>

          <View style={styles.keypadWrapper}>
            <PinKeypad
              onPressNumber={(num: string) => {
                if (pinCode.length < 6) {
                  onChangeValue(pinCode + num);
                }
              }}
              onPressDelete={() => {
                onChangeValue(pinCode.slice(0, -1));
              }}
            />
          </View>

          <View style={{ height: insets.bottom + 40 }} />
        </View>
      )}
      <LoadingScreen visible={false} />
    </View>
  ) : null;
};

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      backgroundColor: theme.colors.surface_surface_default,
      width: Utils.screenWidth,
      height: Utils.screenHeight,
      zIndex: 1000,
    },
    header: {
      paddingHorizontal: 20,
      height: 44,
      justifyContent: 'center',
    },
    backButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
    },
    headerSpacer: {
      height: 75,
      margin: 12,
    },
    content: {
      alignItems: 'center',
      marginTop: 40,
    },
    title: {
      marginBottom: 30,
      fontWeight: '700',
      fontSize: 16,
    },
    errorText: {
      marginTop: 10,
    },
    keypadWrapper: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: 20,
    },
  });

export default RequirePinCodeLayout;
