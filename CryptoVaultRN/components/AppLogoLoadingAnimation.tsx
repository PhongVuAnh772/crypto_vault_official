import { appAnimations } from "constants/AppAnimations";
import LottieView from "lottie-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import appStyles from "src/core/styles";

type AppLogoLoadingAnimationType = {
  status?: "loading" | "success" | "error";
  width?: number;
  height?: number;
  onAnimationFinish?: () => void;
};

const AppLogoLoadingAnimation: React.FC<AppLogoLoadingAnimationType> = ({
  status = "loading",
  width = 100,
  height = 100,
  onAnimationFinish,
}) => {
  if (status === "loading") {
    return (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          appStyles.center,
          styles.container,
          { marginRight: 20 },
        ]}
      >
        <LottieView
          source={appAnimations.logoLoading}
          style={{ width, height }}
          autoPlay
          loop
        />
      </View>
    );
  }

  if (status === "success") {
    return (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          appStyles.center,
          styles.container,
          { marginRight: 20 },
        ]}
      >
        <LottieView
          source={appAnimations.successAnimation}
          style={{ width, height }}
          autoPlay
          loop={false}
          onAnimationFinish={onAnimationFinish}
        />
      </View>
    );
  }

  if (status === "error") {
    return (
      <View
        style={[
          StyleSheet.absoluteFillObject,
          appStyles.center,
          styles.container,
          { marginRight: 20 },
        ]}
      >
        {/* <LottieView
          source={appAnimations.errorCross} 
          style={{ width, height }}
          autoPlay
          loop={false}
        /> */}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    zIndex: 9999,
  },
});

export default AppLogoLoadingAnimation;
