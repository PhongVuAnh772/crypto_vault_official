import React from "react";
import { ScreenWrapper } from "src/components";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";

import { View } from "react-native";
import appStyles from "src/core/styles";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { ViewListLanguage } from "./changeLanguage.compoent";
import useChangeLanguage from "./changeLanguage.hook";
import useStyles from "./changeLanguage.style";

const ChangeLanguageScreen: React.FC<RootNavigationType> = ({ navigation }) => {
  const { theme, insets, listLanguage, languageType, onChangeLanguage } =
    useChangeLanguage();
  const styles = useStyles(theme, insets);
  return (
    <ScreenWrapper
      enableHeader
      paddingTop
      headerTitleWithI18n={LanguageKey.language_title}
      headerTextVariant={TextVariantKeys.titleLarge}
      backgroundColor={theme.colors.surface_surface_default}
    >
      <View style={styles.container}>
        <View style={styles.box_language}>
          <ViewListLanguage
            theme={theme}
            listLanguage={listLanguage}
            languageActive={languageType}
            style={appStyles.pd15}
            onChangeLanguage={onChangeLanguage}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ChangeLanguageScreen;
