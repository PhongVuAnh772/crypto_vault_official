import { appAnimations } from "constants/AppAnimations";
import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import appStyles from "src/core/styles";

type AppLogoLoadingAnimationType = {
  isLoading?: boolean;
};

const AppLogoLoadingAnimation: React.FC<AppLogoLoadingAnimationType> = ({
  isLoading,
}) => {
  return isLoading ? (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        appStyles.center,
        appLogoLoadingAnimationStyle.container,
      ]}
    >
      <LottieView
        source={appAnimations.logoLoading}
        style={appLogoLoadingAnimationStyle.icon}
        autoPlay
        loop
      />
    </View>
  ) : null;
};

const appLogoLoadingAnimationStyle = StyleSheet.create({
  container: {
    zIndex: 9999,
  },
  icon: { width: 100, height: 100 },
});

export default AppLogoLoadingAnimation;
