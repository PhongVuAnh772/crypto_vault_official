import React from "react";
import { View } from "react-native";
import appStyles from "src/core/styles";
import Utils from "src/utils/commonUtils";
import AppLogoLoadingAnimation from "./AppLogoLoadingAnimation";

type AppLoadingType = {
  size?: number | "small" | "large";
  visible?: boolean;
};

const LoadingScreen: React.FC<AppLoadingType> = ({
  size = "large",
  visible = false,
}) => {
  if (!visible) return null;
  return (
    <View
      style={[
        appStyles.center,
        {
          position: "absolute",
          height: Utils.screenHeight,
          width: Utils.screenWidth,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      ]}
    >
      <AppLogoLoadingAnimation isLoading />
    </View>
  );
};

export default LoadingScreen;
