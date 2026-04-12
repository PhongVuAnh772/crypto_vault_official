import React from "react";
import { View } from "react-native";
import appStyles from "src/core/styles";
import Utils from "src/core/utils/commonUtils";
import AppLogoLoadingAnimation from "./AppLogoLoadingAnimation";

type AppLoadingType = {
  size?: number | "small" | "large";
  visible?: boolean;
  status?: "loading" | "success" | "error";
  onAnimationFinish?: () => void;
};

const LoadingScreen: React.FC<AppLoadingType> = ({
  size = "large",
  status = "loading",
  visible = false,
  onAnimationFinish,
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
      <AppLogoLoadingAnimation
        status={status}
        width={300}
        height={300}
        onAnimationFinish={onAnimationFinish}
      />
    </View>
  );
};

export default LoadingScreen;
