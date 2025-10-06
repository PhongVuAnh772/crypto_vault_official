import React from "react";
import {
  FlatList,
  ImageBackground,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import { CopySvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { usePhrase } from "./recoveryPhrase.hook";

const PharaseScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    theme,
    styles,
    copyAction,
    mnemonicData,
    backgroundWithTheme,
    widthView,
    handleLayout,
  } = usePhrase();

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    return (
      <View style={styles.secretPhraseItem}>
        <View style={styles.secretPhraseItemViewIndex}>
          <AppText
            title={(index + 1).toString()}
            variant={TextVariantKeys.bodyRSmall}
            textColor={theme.colors.text_on_surface_text_high}
          />
        </View>
        <View style={styles.secretPhraseItemViewPhrase}>
          <View style={styles.secretPhraseItemViewPhrase2}>
            <AppText
              allowFontScaling={false}
              title={item}
              variant={TextVariantKeys.labelSmall}
              textColor={theme.colors.text_on_surface_text_high}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper
      enableHeader
      paddingTop
      headerTitleWithI18n={LanguageKey.secret_phrase_risk_header}
      headerTextVariant={TextVariantKeys.titleLarge}
      headerTextColor={theme.colors.text_on_surface_text_highest}
      backgroundColor={theme.colors.surface_surface_default}
      backButtonColor={appColors.neutral.black}
      backgroundImage={backgroundWithTheme}
    >
      <ImageBackground
        source={undefined}
        style={[appStyles.alignItemsCenter, appStyles.flex1]}
      >
        <View style={[appStyles.mbt25, appStyles.mh25]}>
          <AppText
            titleWithI18n={LanguageKey.secret_phrase_sub_title}
            variant={TextVariantKeys.bodyRLarge}
            styles={[appStyles.textAlignCenter]}
            textColor={theme.colors.text_on_surface_text_medium}
          />
        </View>
        <View style={[appStyles.fullWidth, appStyles.pH25]}>
          <FlatList
            scrollEnabled={false}
            style={appStyles.fullWidth}
            data={mnemonicData}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            numColumns={3}
          />
        </View>
        <TouchableOpacity
          onPress={copyAction}
          style={[appStyles.center, appStyles.flexRow, appStyles.mt25]}
        >
          <View style={[appStyles.mr10, appStyles.center]}>
            <CopySvgIcon color={appColors.main.tokyoRed} />
          </View>
          <AppText
            titleWithI18n={LanguageKey.secret_phrase_copy_clipboard}
            variant={TextVariantKeys.bodyMMedium}
            styles={appStyles.textAlignCenter}
            textColor={theme.colors.label_surface_button_primary}
          />
        </TouchableOpacity>
        <View
          style={[
            appStyles.flex1,
            appStyles.fullWidth,
            appStyles.justifyContentEnd,
          ]}
        >
          <View style={styles.viewButton}>
            <AppButton
              onPress={() => navigation.goBack()}
              titleWithI18n={LanguageKey.done_title}
              styles={styles.button}
              textVariant={TextVariantKeys.titleSmall}
              textColor={appColors.neutral.white}
            />
          </View>
        </View>
      </ImageBackground>
    </ScreenWrapper>
  );
};

export default PharaseScreen;
