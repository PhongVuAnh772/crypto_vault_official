import { BlurView } from "expo-blur";
import React from "react";
import { ImageBackground, View } from "react-native";
import { TextInput } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import { appImages } from "src/core/constants/AppImages";
import InputMode from "src/core/enum/InputMode";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import ThemeKey from "src/core/enum/ThemeKey";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import useReceive from "./receive.hook";
import useStyles from "./receive.styles";

const ReceiveScreen = () => {
  const { theme, address, hederTitle, copyAction, themMode, insets } =
    useReceive();
  const styles = useStyles(theme);

  return (
    <ScreenWrapper
      headerTextVariant={TextVariantKeys.titleLarge}
      headerTitle={hederTitle}
      backgroundImage={
        themMode === ThemeKey.dark
          ? appImages.background1Dark
          : appImages.background1
      }
      enableHeader
      backgroundColor={theme.colors.surface_surface_default}
      paddingTop
    >
      <ImageBackground
        style={[appStyles.flex1, { paddingBottom: insets.bottom }]}
      >
        <View style={[appStyles.flex1, appStyles.justifyContentBetween]}>
          <View style={[appStyles.mt25, appStyles.center]}>
            <View style={styles.qrContainer}>
              <View style={styles.qrContainer2}>
                <QRCode
                  value={address}
                  size={200}
                  logo={appImages.newLogo}
                  logoSize={50}
                />
              </View>
              <View style={[appStyles.mt10, appStyles.mbt5]}>
                <AppText
                  titleWithI18n={LanguageKey.scan_to_receive_title}
                  variant={TextVariantKeys.bodyRMedium}
                  textColor={appColors.neutral.white}
                  styles={appStyles.textAlignCenter}
                />
              </View>
            </View>
          </View>
          <View>
            <BlurView
              intensity={100}
              tint="light"
              style={styles.yourAddressContainer}
            >
              <AppText
                titleWithI18n={LanguageKey.your_address_title}
                textColor={theme.colors.text_on_surface_text_highest}
                variant={TextVariantKeys.titleSmall}
                styles={appStyles.textAlignCenter}
              />
              <TextInput
                value={address}
                readOnly
                mode={InputMode.outlined}
                outlineColor={theme.colors.surface_surface_high}
                activeOutlineColor={theme.colors.surface_surface_high}
                style={styles.addressContainer}
                contentStyle={styles.inputAddressContent}
              />
            </BlurView>

            <AppButton
              titleWithI18n={LanguageKey.common_copy}
              styles={styles.button}
              textVariant={TextVariantKeys.bodyMMedium}
              textColor={theme.colors.text_on_surface_text_brand}
              onPress={copyAction}
            />
          </View>
        </View>
      </ImageBackground>
    </ScreenWrapper>
  );
};

export default ReceiveScreen;
