import LottieView from "lottie-react-native";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

export type FireworksAnimationRef = {
  triggerFireworks: () => void;
};

// eslint-disable-next-line react/display-name
export const FireworksAnimation = forwardRef<FireworksAnimationRef>(
  (_, ref) => {
    const fireworksRef = useRef<LottieView>(null);
    const opacity = useRef(new Animated.Value(0)).current;

    useImperativeHandle(ref, () => ({
      triggerFireworks: () => {
        opacity.setValue(1); // Hiện animation
        fireworksRef.current?.play(0); // Bắt đầu animation
      },
    }));

    const handleAnimationFinish = () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={[styles.wrapper, { opacity }]}>
        <LottieView
          ref={fireworksRef}
          source={require("../assets/animation/firework.json")}
          loop={false}
          resizeMode="cover"
          onAnimationFinish={handleAnimationFinish}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    pointerEvents: "none",
  },
});
