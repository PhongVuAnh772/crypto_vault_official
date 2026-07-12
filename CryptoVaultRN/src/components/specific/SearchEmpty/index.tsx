import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import AppText from "src/components/common/AppText";
import { NotFoundSvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";

type SearchEmptyType = {
  styles?: StyleProp<ViewStyle>;
};

const SearchEmpty: React.FC<SearchEmptyType> = ({ styles }) => {
  const theme = useAppTheme();
  return (
    <View style={[appStyles.center, styles]}>
      <NotFoundSvgIcon color={theme.colors.text_on_surface_text_high} />
      <View style={appStyles.mv10}>
        <AppText
          titleWithI18n={LanguageKey.search_error_title}
          variant={TextVariantKeys.titleLarge}
          textColor={theme.colors.text_on_surface_text_high}
        />
      </View>
      <AppText
        titleWithI18n={LanguageKey.search_error_sub_title}
        variant={TextVariantKeys.bodyRMedium}
        textColor={theme.colors.text_on_surface_text_light}
      />
    </View>
  );
};

export default SearchEmpty;
