import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import LoadingScreen from "src/components/common/LoadingScreen";
import appColors from "src/core/constants/AppColors";
import {
  CheckCircleSvgIcon,
  CreateWalletSuccessSvgIcon,
} from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import RiskTextWithIcon from "src/features/auth/components/RiskTextWithIcon";
import useRePinCode from "src/features/auth/reEnterPin/rePinCode.hook";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import PinIndicator from "../components/PinIndicator";
import PinKeypad from "../components/PinKeypad";

const ReEnterPin: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    correctPin,
    continueAction,
    value,
    onChangeValue,
    theme,
    isLoading,
    insets,
  } = useRePinCode({
    navigation,
  });

  return (
    <View style={styles.container}>
      {/* Mesh Background Layer 1: Indigo to Soft blue */}
      <LinearGradient
        colors={["#DCE9FF", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Mesh Background Layer 2: Subtle Pink/Lavender overlay from top-right */}
      <LinearGradient
        colors={["rgba(245, 243, 255, 0.7)", "rgba(255, 255, 255, 0)"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Mesh Background Layer 3: Cyan/Mint accent from bottom-left */}
      <LinearGradient
        colors={["rgba(236, 253, 245, 0.4)", "rgba(255, 255, 255, 0)"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.5, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      {correctPin ? (
        <View
          style={[
            appStyles.flex1,
            appStyles.justifyContentBetween,
            styles.createAccount,
            { marginTop: insets.top + 20, marginBottom: insets.bottom + 20 }
          ]}
        >
          <View style={[appStyles.center, appStyles.flex1]}>
            <View style={[appStyles.flex1, appStyles.justifyContentEnd]}>
              <CreateWalletSuccessSvgIcon />
            </View>
            <View style={[appStyles.flex1, appStyles.mh25]}>
              <View style={appStyles.mv30}>
                <AppText
                  titleWithI18n={LanguageKey.create_wallet_success_title}
                  variant={TextVariantKeys.titleLarge}
                  styles={appStyles.textAlignCenter}
                  textColor={theme.colors.text_on_surface_text_highest}
                />
              </View>
              <View style={[appStyles.flex1]}>
                <RiskTextWithIcon
                  titleWithI18n={
                    LanguageKey.create_wallet_success_sub_title_1
                  }
                  icon={
                    <CheckCircleSvgIcon color={appColors.main.tokyoRed} />
                  }
                  textColor={theme.colors.text_on_surface_text_high}
                />
                <RiskTextWithIcon
                  titleWithI18n={
                    LanguageKey.create_wallet_success_sub_title_2
                  }
                  icon={
                    <CheckCircleSvgIcon color={appColors.main.tokyoRed} />
                  }
                  textColor={theme.colors.text_on_surface_text_high}
                  style={appStyles.pV10}
                />
                <RiskTextWithIcon
                  titleWithI18n={
                    LanguageKey.create_wallet_success_sub_title_3
                  }
                  icon={
                    <CheckCircleSvgIcon color={appColors.main.tokyoRed} />
                  }
                  textColor={theme.colors.text_on_surface_text_high}
                />
              </View>
            </View>
          </View>
          <AppButton
            onPress={continueAction}
            titleWithI18n={LanguageKey.common_text_finish}
            styles={{
              ...appStyles.fullWidth,
              backgroundColor: theme.colors.label_surface_button_primary,
            }}
            textVariant={TextVariantKeys.bodyMMedium}
            textColor={theme.colors.text_on_surface_text_invert}
          />
        </View>
      ) : (
        <View style={appStyles.flex1}>
          <View style={[styles.header, { marginTop: insets.top + 20 }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Feather name="chevron-left" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <AppText
              titleWithI18n={LanguageKey.pin_input_title}
              variant={TextVariantKeys.bodyRLarge}
              textColor="#1F2937"
              styles={styles.title}
            />

            <PinIndicator length={6} value={value} />
          </View>

          <View style={styles.keypadWrapper}>
            <PinKeypad
              onPressNumber={(num: string) => {
                if (value.length < 6) {
                  onChangeValue(value + num);
                }
              }}
              onPressDelete={() => {
                onChangeValue(value.slice(0, -1));
              }}
            />
          </View>

          <View style={{ height: insets.bottom + 40 }} />
        </View>
      )}
      <LoadingScreen visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    height: 44,
    justifyContent: 'center',
  },
  backButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 12,
  },
  content: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    marginBottom: 20,
    fontWeight: 'bold',

  },
  keypadWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  createAccount: {
    paddingBottom: 20,
  }
});

export default ReEnterPin;
