import React from "react";
import { useTranslation } from "react-i18next";
import { StyleProp, TextStyle } from "react-native";
import { customText } from "react-native-paper";
import { VariantProp } from "react-native-paper/lib/typescript/components/Typography/types";
import TextVariantKeys from "src/core/constants/TextVariantKeys";
import appStyles from "src/core/styles";

type AppTextProps = {
  title?: string;
  titleWithI18n?: string;
  i18nParam?: object;
  variant?: TextVariantKeys;
  textColor?: string;
  styles?: StyleProp<TextStyle>;
  children?: React.ReactElement<Text>;
  allowFontScaling?: boolean;
  numberOfLines?: number;
  maxFontSizeMultiplier?: number;
  ellipsizeMode?: "middle" | "head" | "tail" | "clip";
  onTextLayout?: (e: any) => void;
  onPress?: () => void;
  buttonInline?: Element | null | any;
};

type AppVariant = VariantProp<TextVariantKeys>;

const Text = customText<AppVariant>();

const AppText: React.FC<AppTextProps> = (props) => {
  const {
    title,
    titleWithI18n,
    variant,
    textColor,
    styles,
    i18nParam,
    children,
    allowFontScaling = true,
    numberOfLines,
    maxFontSizeMultiplier = 1.5,
    ellipsizeMode,
    onTextLayout,
    onPress,
    buttonInline,
  } = props;
  const { t } = useTranslation();

  return (
    <>
      <Text
        variant={variant}
        onTextLayout={onTextLayout}
        onPress={onPress}
        allowFontScaling={allowFontScaling}
        numberOfLines={numberOfLines}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        ellipsizeMode={ellipsizeMode}
        style={[
          {
            ...appStyles.flexShrink1,
            color: textColor,
          },
          styles,
          buttonInline && { ...appStyles.flex1 },
        ]}
      >
        {titleWithI18n
          ? t(titleWithI18n, {
              ...i18nParam,
            })
          : title}
        {children}
      </Text>
      {buttonInline}
    </>
  );
};

export default AppText;
