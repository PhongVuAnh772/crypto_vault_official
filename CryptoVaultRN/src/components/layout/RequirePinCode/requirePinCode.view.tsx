import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import AppText from "src/components/common/AppText";
import LoadingScreen from "src/components/common/LoadingScreen";
import { FaceIdSvgIcon } from "src/core/constants/AppIconsSvg";
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

const ShieldLockIcon: React.FC<{ styles: any }> = ({ styles }) => {
  return (
    <View style={styles.shieldContainer}>
      <View style={styles.outerCircle}>
        <View style={styles.innerCircle}>
          <Svg width="44" height="48" viewBox="0 0 16 16" fill="none">
            <Path
              d="M7.53467 14.4101C7.68227 14.4962 7.75606 14.5393 7.86021 14.5616C7.94104 14.579 8.05896 14.579 8.13979 14.5616C8.24394 14.5393 8.31773 14.4962 8.46533 14.4101C9.76403 13.6525 13.3333 11.2725 13.3333 8.00021V5.46687C13.3333 4.75094 13.3333 4.39298 13.223 4.13888C13.1108 3.88061 12.9991 3.74322 12.769 3.58081C12.5427 3.42103 12.0991 3.32876 11.2118 3.14422C10.2339 2.94083 9.48285 2.57357 8.79625 2.04242C8.46701 1.78772 8.30238 1.66037 8.17356 1.62563C8.03763 1.58898 7.96237 1.58898 7.82644 1.62563C7.69762 1.66037 7.53299 1.78772 7.20375 2.04242C6.51715 2.57357 5.76613 2.94083 4.7882 3.14422C3.90092 3.32876 3.45727 3.42103 3.23096 3.58081C3.00095 3.74322 2.88919 3.88061 2.77703 4.13888C2.66667 4.39298 2.66667 4.75094 2.66667 5.46687V8.00021C2.66667 11.2725 6.23597 13.6525 7.53467 14.4101Z"
              fill="#5B63E4"
            />
            <Rect x="6.2" y="8.2" width="3.6" height="2.8" rx="0.8" fill="white" />
            <Path
              d="M7.1 8.2V7.2C7.1 6.7 7.5 6.3 8 6.3C8.5 6.3 8.9 6.7 8.9 7.2V8.2"
              stroke="white"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
      </View>
      <View style={[styles.ambientDot, { top: 15, left: -20, width: 6, height: 6, opacity: 0.3 }]} />
      <View style={[styles.ambientDot, { top: 50, right: -25, width: 4, height: 4, opacity: 0.2 }]} />
      <View style={[styles.ambientDot, { bottom: 0, left: -15, width: 5, height: 5, opacity: 0.1 }]} />
    </View>
  );
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
    triggerFaceId,
  } = useRequirePinCode({
    isMainRequirePinCode,
    visible: visible,
    continueActionAfterPassPinCode: continueActionAfterPassPinCode,
    onClose,
    disableFaceId,
  });

  const styles = useStyles(theme, insets);

  const showState = subVisible && (visible ?? requirePinCode) && !keepSplash;
  return showState ? (
    <View style={styles.container}>
      <LinearGradient
        colors={["#E8EFFF", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["rgba(245, 243, 255, 0.8)", "rgba(255, 255, 255, 0)"]}
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
          {onClose ? (
            <View style={[styles.header, { marginTop: insets.top + 5 }]}>
              <TouchableOpacity
                onPress={onCloseAction}
                style={styles.backButton}
              >
                <Feather name="chevron-left" size={28} color="#000" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ height: insets.top + 5 }} />
          )}

          <View style={styles.content}>
            <ShieldLockIcon styles={styles} />

            <AppText
              titleWithI18n={headerTitle ?? LanguageKey.pin_code_title}
              variant={TextVariantKeys.titleLarge}
              textColor="#0A0D14"
              styles={styles.title}
            />

            <AppText
              titleWithI18n={LanguageKey.pin_code_subtitle}
              variant={TextVariantKeys.bodyMSmall}
              textColor="#7C8099"
              styles={styles.subtitle}
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

            {isUseFaceIdOrTouch && (
              <TouchableOpacity
                onPress={triggerFaceId}
                style={styles.faceIdButton}
                activeOpacity={0.7}
              >
                <FaceIdSvgIcon width={18} height={18} color="#5B63E4" />
                <AppText
                  titleWithI18n={LanguageKey.use_face_id_title}
                  variant={TextVariantKeys.bodyMSmall}
                  textColor="#5B63E4"
                  styles={styles.faceIdText}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: insets.bottom + 20 }} />
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
      height: 35,
    },
    content: {
      alignItems: 'center',
      marginTop: 10,
    },
    shieldContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      position: "relative",
    },
    outerCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(91, 99, 228, 0.04)",
      justifyContent: "center",
      alignItems: "center",
    },
    innerCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: "rgba(91, 99, 228, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#5B63E4",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
    },
    ambientDot: {
      position: "absolute",
      backgroundColor: "#5B63E4",
      borderRadius: 9999,
    },
    title: {
      marginBottom: 6,
      fontWeight: '700',
      fontSize: 22,
    },
    subtitle: {
      marginBottom: 10,
      fontSize: 14,
      fontWeight: '500',
      color: '#7C8099',
    },
    errorText: {
      marginTop: 10,
    },
    keypadWrapper: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: 10,
      alignItems: 'center',
    },
    faceIdButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 15,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    faceIdText: {
      marginLeft: 8,
      fontWeight: '600',
    },
  });

export default RequirePinCodeLayout;
