import React from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "src/components/common/AppButton";
import appColors from "src/core/constants/AppColors";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import appStyles from "src/core/styles";
import style from "./style";

const isAndroid = Platform.OS === "android";

type Props = {
  onPress: () => void;
  title: string;
  isLoading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  children?: React.ReactNode;
  backgroundButtonColor?: string;
  textColor?: string;
};

const ButtonBottom = ({
  onPress,
  title,
  containerStyle,
  isLoading,
  disabled,
  children,
  backgroundButtonColor,
  textColor,
}: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        appStyles.pH25,
        style.buttonContainer,
        {
          paddingBottom: insets.bottom + (isAndroid ? 15 : 0),
        },
        containerStyle,
      ]}
    >
      <AppButton
        title={title}
        onPress={onPress}
        styles={style.button}
        textVariant={TextVariantKeys.bodyMMedium}
        textColor={appColors.neutral.white}
        isLoading={isLoading}
        disabled={disabled}
      />

      {children}
    </View>
  );
};

export default ButtonBottom;
