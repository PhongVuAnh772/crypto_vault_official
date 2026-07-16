import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const titles = [
  "Khám phá thế giới dApp không giới hạn",
  "Kiếm phần thưởng, kiếm tiền mã hoá, kiếm tiền Token",
  "Ví Web3 hoàn chỉnh của bạn",
  "Tận dụng sức mạnh tài sản kỹ thuật số của bạn",
];

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function OnboardingTextSlider() {
  const [index, setIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (index + 1) % titles.length;

      // Animate out
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -SCREEN_WIDTH,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset position to right
        translateX.setValue(SCREEN_WIDTH);
        setIndex(nextIndex);

        // Animate in
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.text,
          {
            transform: [{ translateX }],
            opacity,
          },
        ]}
        allowFontScaling={false}
      >
        {titles[index]}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    justifyContent: "center",
    overflow: "visible",
    paddingBottom: 15,
  },
  text: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
    width: "100%",
    maxWidth: 300,
    lineHeight: 30,
    flexWrap: "wrap",
  },
});
