import React, { useState } from "react";
import { Image, Pressable, TouchableWithoutFeedback, View } from "react-native";
import DeviceInfo from "react-native-device-info";
import { ScreenWrapper } from "src/components";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import { appImages } from "src/core/constants/AppImages";
import EnvConfig from "src/core/constants/EnvConfig";
import AppToastType from "src/core/enum/AppToastType";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import Utils from "src/core/utils/commonUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useStyle from "./aboutus.style";

const AboutUs: React.FC<RootNavigationType> = ({ navigation }) => {
  const versionCode = DeviceInfo.getVersion();
  const theme = useAppTheme();

  const onPressTerms = () =>
    navigation.navigate(HomeStackScreenKey.AboutUsDetail);
  const [count, setCount] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const handlePress = () => {
    if (timer) clearTimeout(timer);
    setCount((prev) => prev + 1);

    const newTimer = setTimeout(() => {
      setCount(0);
    }, 1500);
    setTimer(newTimer);

    if (count + 1 === 7) {
      Utils.showToast({
        msg: `Environment: ${EnvConfig.ENV_NAME}`,
        type: AppToastType.info,
        visibilityTime: 5000,
      });
      setCount(0);
      if (timer) clearTimeout(timer);
    }
  };
  const aboutUsStyles = useStyle(theme);
  return (
    <ScreenWrapper
      headerTitleWithI18n={LanguageKey.setting_about}
      headerTextVariant={TextVariantKeys.titleLarge}
      enableHeader
      paddingTop
      subStyle={[aboutUsStyles.flex1, aboutUsStyles.h100]}
      backgroundColor={theme.colors.surface_surface_default}
    >
      <View
        style={[
          aboutUsStyles.container,

          {
            backgroundColor: theme.colors.surface_surface_high,
          },
        ]}
      >
        <View>
          <TouchableWithoutFeedback onPress={handlePress}>
            <Image source={appImages.logo} style={aboutUsStyles.logo} />
          </TouchableWithoutFeedback>
          <View style={[aboutUsStyles.mt15, aboutUsStyles.flexRow]}>
            <AppText
              titleWithI18n={LanguageKey.setting_red_x_ver}
              variant={TextVariantKeys.bodyMMedium}
              textColor={theme.colors.text_on_surface_text_high}
            />
            <AppText
              title={` ${versionCode}`}
              variant={TextVariantKeys.bodyMMedium}
              textColor={theme.colors.text_on_surface_text_high}
            />
          </View>
          <View style={aboutUsStyles.mt15}>
            <AppText
              titleWithI18n={LanguageKey.setting_copyright_red_x}
              variant={TextVariantKeys.bodyMMedium}
              textColor={theme.colors.text_on_surface_text_high}
            />
          </View>
          <View style={[aboutUsStyles.mt15, aboutUsStyles.flexRow]}>
            <AppText
              titleWithI18n={LanguageKey.setting_app_support}
              textColor={theme.colors.text_on_surface_text_high}
              variant={TextVariantKeys.titleSmall}
            >
              <AppText
                title={`: ${EnvConfig.EMAIL_SUPPORT}`}
                variant={TextVariantKeys.titleSmall}
                textColor={theme.colors.text_on_surface_text_high}
              />
            </AppText>
          </View>
          <Pressable
            style={[aboutUsStyles.mt15, aboutUsStyles.terms]}
            onPress={onPressTerms}
          >
            <AppText
              titleWithI18n={LanguageKey.setting_red_x_term}
              variant={TextVariantKeys.labelLink}
              textColor={appColors.main.tokyoRed}
            />
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default AboutUs;
