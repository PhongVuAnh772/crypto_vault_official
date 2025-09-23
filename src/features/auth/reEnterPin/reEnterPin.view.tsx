import React from "react";
import { View } from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import LoadingScreen from "src/components/common/LoadingScreen";
import PinCodeInput from "src/components/common/PinCodeInput";
import appColors from "src/core/constants/AppColors";
import {
  CheckCircleSvgIcon,
  CreateWalletSuccessSvgIcon,
} from "src/core/constants/AppIconsSvg";
import { appImages } from "src/core/constants/AppImages";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import ThemeKey from "src/core/enum/ThemeKey";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import RiskTextWithIcon from "src/features/auth/components/RiskTextWithIcon";
import useRePinCode from "src/features/auth/reEnterPin/rePinCode.hook";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useStyles from "./reEnterPin.style";

const ReEnterPin: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    correctPin,
    continueAction,
    value,
    onChangeValue,
    incorrectPin,
    theme,
    themeMode,
    isLoading,
    insets,
  } = useRePinCode({
    navigation,
  });

  const getBackgroundImage = () => {
    return themeMode === ThemeKey.dark
      ? appImages.background1Dark
      : appImages.background1;
  };
  const styles = useStyles(theme, insets);
  return (
    <ScreenWrapper
      enableDismissKeyboard
      enableHeader={!correctPin}
      paddingTop={!correctPin}
      headerTitleWithI18n={
        !correctPin ? LanguageKey.re_enter_pin_title : undefined
      }
      headerTextVariant={TextVariantKeys.titleLarge}
      backgroundImage={correctPin ? getBackgroundImage() : undefined}
      backgroundColor={theme.colors.surface_surface_default}
      headerTextColor={undefined}
      backButtonColor={undefined}
    >
      <View style={styles.container}>
        {correctPin ? (
          <View
            style={[
              appStyles.flex1,
              appStyles.justifyContentBetween,
              styles.createAccount,
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
          <View
            style={[
              appStyles.justifyContentBetween,
              appStyles.flex1,
              undefined,
            ]}
          >
            <View style={[appStyles.alignItemsCenter]}>
              <View style={[appStyles.mt55, appStyles.alignItemsCenter]}>
                <View style={[appStyles.mbt15]}>
                  <AppText
                    titleWithI18n={LanguageKey.pin_input_title}
                    variant={TextVariantKeys.bodyRLarge}
                    textColor={theme.colors.text_on_surface_text_medium}
                  />
                </View>
                <PinCodeInput
                  value={value}
                  setValue={onChangeValue}
                  error={incorrectPin}
                />
              </View>
            </View>
          </View>
        )}
      </View>
      <LoadingScreen visible={isLoading} />
    </ScreenWrapper>
  );
};

export default ReEnterPin;
