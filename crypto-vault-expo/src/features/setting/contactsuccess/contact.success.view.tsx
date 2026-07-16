import React from "react";
import { ImageBackground, View } from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import { SuccessIllustratorSvgIcon } from "src/core/constants/AppIconsSvg";
import { appImages } from "src/core/constants/AppImages";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useContactSuccess from "./contact.success.hook";
import useStyles from "./contact.success.style";

const ContactSuccess: React.FC<RootNavigationType> = ({ navigation }) => {
  const { insets, theme, handleGoBack } = useContactSuccess({
    navigation,
  });
  const contactSuccessStyles = useStyles(theme, insets);
  return (
    <ScreenWrapper
      headerTitleWithI18n={LanguageKey.setting_about}
      headerTextVariant={TextVariantKeys.titleLarge}
      paddingTop
      backgroundColor={appColors.neutral.n100}
      backgroundImage={appImages.background1}
    >
      <ImageBackground style={appStyles.flex1} source={undefined}>
        <View style={[contactSuccessStyles.flex1, contactSuccessStyles.pH25]}>
          <View style={[contactSuccessStyles.content]}>
            <SuccessIllustratorSvgIcon />
            <View style={contactSuccessStyles.textAppName}>
              <AppText
                titleWithI18n={LanguageKey.app_name}
                variant={TextVariantKeys.titleLarge}
              />
            </View>
            <AppText
              titleWithI18n={LanguageKey.setting_request_successful}
              variant={TextVariantKeys.bodyRMedium}
            />
          </View>
        </View>
      </ImageBackground>
      <View style={[appStyles.pH25]}>
        <AppButton
          onPress={handleGoBack}
          titleWithI18n={LanguageKey.ok}
          textVariant={TextVariantKeys.bodyMMedium}
          textColor={appColors.neutral.white}
          styles={{
            ...contactSuccessStyles.button,
          }}
          textStyles={contactSuccessStyles.textButton}
        />
      </View>
    </ScreenWrapper>
  );
};

export default ContactSuccess;
