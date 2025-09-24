import { ResizeMode, Video } from "expo-av"; // ✅ dùng expo-av
import React, { useEffect, useRef } from "react";
import {
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import BottomSheetWarningWallet from "src/components/specific/BottomSheetWalletWarning/bottomSheetWalletWarning.view";
import appColors from "src/core/constants/AppColors";
import { DropdowSvgIcon } from "src/core/constants/AppIconsSvg";
import { appImages } from "src/core/constants/AppImages";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import useOnboardingScreen from "src/features/auth/onboardingScreen/onboarding.hook";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import OnboardingTextSlider from "../components/TextSlideAnimate";
import useStyles from "./onboarding.styles";

const videoSource = require("../../../../assets/video/onboarding.mp4");

const OnboardingScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    createRestoreWalletAction,
    onChangeLanguage,
    nextAction,
    getTitle,
    getSubTitle,
    openDropdown,
    closeDropdown,
    showDropdown,
    count,
    listLanguage,
    languageType,
    insets,
    theme,
    isVisible,
    openModalCreateNewWallet,
    closeModalCreateNewWallet,
    createWalletAction,
    onModalConfirmDismiss,
    isFirstScreen,
  } = useOnboardingScreen({ navigation });

  const styles = useStyles(theme, isFirstScreen);

  const prevCount = useRef(count);
  const isFirstRender = useRef(true);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevCount.current = count;
      return;
    }

    if (count > prevCount.current) {
      progress.value = withTiming(
        1,
        { duration: 300, easing: Easing.out(Easing.cubic) },
        () => {
          prevCount.current = count;
          progress.value = 0;
        }
      );
    } else {
      prevCount.current = count;
    }
  }, [count]);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(progress.value * -300, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
    opacity: 1 - progress.value,
  }));

  const getIcon = (step: number) => {
    switch (step) {
      case 1:
        return appImages.onboarding1;
      case 2:
        return appImages.onboarding2;
      case 3:
        return appImages.onboarding3;
      default:
        return null;
    }
  };

  return (
    <ScreenWrapper
      mainStyle={[appStyles.flex1]}
      subStyle={[appStyles.flex1]}
      backgroundImage={appImages.onboardingBackground}
    >
      <TouchableWithoutFeedback onPress={closeDropdown}>
        <View style={appStyles.flex1}>
          {/* Top / Language */}
          <View
            style={[
              styles.viewTop,
              {
                backgroundColor:
                  count === 1
                    ? "rgb(23, 24, 29)"
                    : theme.colors.surface_surface_brand,
              },
            ]}
          >
            <TouchableOpacity
              onPress={openDropdown}
              style={[
                styles.button_language,
                styles.bdr100,
                styles.customBorderButtonInitialUI,
              ]}
            >
              <AppText
                title={languageType === "en" ? "English" : "日本語"}
                variant={TextVariantKeys.bodyMSmall}
                textColor={theme.colors.text_on_surface_text_high}
                maxFontSizeMultiplier={1.3}
              />
              <DropdowSvgIcon
                color={theme.colors.text_on_surface_text_medium_high}
              />
            </TouchableOpacity>

            {/* Animated Image */}
            {count !== 1 ? (
              <Animated.View style={[slideStyle]}>
                <Image
                  source={getIcon(prevCount.current)}
                  style={[styles.imageOnboarding, appStyles.mt25]}
                />
              </Animated.View>
            ) : (
              <Video
                source={videoSource}
                style={{
                  width: 300,
                  height: 300,

                  zIndex: 9999,
                }}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
              />
            )}
          </View>

          {/* Bottom */}
          <View style={styles.viewBottom}>
            <Animated.View style={[slideStyle, appStyles.flex1, styles.pT32]}>
              <View style={[appStyles.pH10]}>
                <AppText
                  styles={styles.title}
                  titleWithI18n={getTitle()}
                  variant={TextVariantKeys.headlineMedium}
                  textColor={theme.colors.text_on_surface_text_highest}
                />
              </View>
              {count == 1 ? (
                <OnboardingTextSlider />
              ) : (
                <AppText
                  styles={[styles.titleSub, styles.pT16]}
                  titleWithI18n={getSubTitle()}
                  variant={TextVariantKeys.bodyRMedium}
                  textColor={theme.colors.text_on_surface_text_medium_high}
                />
              )}
            </Animated.View>

            <View style={{ paddingBottom: insets.bottom }}>
              {count === 3 ? (
                <View style={styles.viewButton}>
                  <AppButton
                    styles={{
                      backgroundColor: appColors.main.tokyoRed,
                      ...appStyles.fullWidth,
                    }}
                    onPress={openModalCreateNewWallet}
                    titleWithI18n={
                      LanguageKey.onboarding_new_wallet_button_title
                    }
                    textVariant={TextVariantKeys.titleSmall}
                    textColor={appColors.neutral.white}
                  />

                  <View style={styles.h10} />

                  <AppButton
                    onPress={createRestoreWalletAction}
                    styles={{
                      backgroundColor: theme.colors.label_surface_button_light,
                      ...appStyles.fullWidth,
                    }}
                    titleWithI18n={
                      LanguageKey.onboarding_restore_wallet_button_title
                    }
                    textVariant={TextVariantKeys.titleSmall}
                    textColor={theme.colors.text_on_surface_text_highest}
                  />
                </View>
              ) : (
                <View style={styles.viewCounterWithButton}>
                  <View
                    style={[
                      appStyles.alignItemsCenter,
                      appStyles.flexRow,
                      appStyles.justifyContentBetween,
                      appStyles.fullWidth,
                    ]}
                  >
                    <AppText
                      title={`${count}/3`}
                      variant={TextVariantKeys.labelSmall}
                      textColor={theme.colors.text_on_surface_text_medium_high}
                    />

                    <AppButton
                      forceStyles={styles.nextButton}
                      titleWithI18n={LanguageKey.common_text_next}
                      textStyles={styles.nextTextStyle}
                      onPress={nextAction}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <BottomSheetWarningWallet
        isVisible={isVisible}
        closeModalCreateNewWallet={closeModalCreateNewWallet}
        continueAction={createWalletAction}
        onDismiss={onModalConfirmDismiss}
      />
    </ScreenWrapper>
  );
};

export default OnboardingScreen;
