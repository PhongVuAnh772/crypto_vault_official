import { StyleSheet, Text, View } from "react-native";
import React from "react";
import BitcoinChartScreen from "src/features/charts/bitcoin";

const TonSendCoin = () => {
  return (
    <View style={styles.container}>
      <BitcoinChartScreen />
    </View>
  );
};

export default TonSendCoin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
