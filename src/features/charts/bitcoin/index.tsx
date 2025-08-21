// src/screens/BitcoinChartScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { fetchBitcoinChart } from "src/core/apis/crypto";

const screenWidth = Dimensions.get("window").width;

const BitcoinChartScreen = () => {
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChart = async () => {
      try {
        const prices = await fetchBitcoinChart();
        const pricesOnly = prices.map((item: any) => item[1]);
        setChartData(pricesOnly);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadChart();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bitcoin - 7 ngày gần nhất</Text>
      <LineChart
        data={{
          labels: ["03:00", "06:00", "09:00", "12:00", "15:00", "18:00"],
          datasets: [{ data: chartData }],
        }}
        width={screenWidth - 32}
        height={220}
        withDots={false}
        withInnerLines={false}
        withOuterLines={false}
        withShadow={false}
        fromZero={false}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 102, 255, ${opacity})`,
          labelColor: () => "#999999",
          propsForBackgroundLines: {
            stroke: "transparent",
          },
          propsForLabels: {
            fontSize: 10,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 12,
          backgroundColor: "#fff",
        }}
      />
    </View>
  );
};

export default BitcoinChartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
  },
  title: { fontSize: 18, color: "#fff", marginBottom: 12 },
  chart: { borderRadius: 12 },
});
