import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function OnboardingTextSlider({
  onPress1,
  onPress2,
}: {
  onPress1: () => void;
  onPress2: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Bằng việc nhấp vào nút bất kỳ, bạn đồng ý và chấp thuận{" "}
        <Text style={styles.link} onPress={onPress1}>
          Điều khoản dịch vụ của Binance
        </Text>{" "}
        và{" "}
        <Text style={styles.link} onPress={onPress2}>
          Chính sách Quyền Riêng Tư
        </Text>{" "}
        của chúng tôi.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 12,
    lineHeight: 21,
    textAlign: "center",
    fontWeight: "500",
  },
  link: {
    color: "rgb(65, 62, 180)",
  },
});
