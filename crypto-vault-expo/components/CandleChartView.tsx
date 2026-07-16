// components/CandlestickChartScreen.tsx
import { useBinanceCandles } from "hooks/useCandleChart";
import React, { useState } from "react";
import { View, Button, ScrollView } from "react-native";
import { CandlestickChart } from "react-native-wagmi-charts";

const intervals = ["1m", "5m", "15m", "1h", "4h", "1d"];

export default function CandlestickChartScreen() {
  const [interval, setInterval] = useState("1m");
  const candles = useBinanceCandles(interval);

  const data = candles.map((item) => ({
    timestamp: item.timestamp,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
  }));

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {intervals.map((i) => (
          <Button
            key={i}
            title={i}
            onPress={() => setInterval(i)}
            color={i === interval ? "blue" : "gray"}
          />
        ))}
      </ScrollView>

      <CandlestickChart.Provider data={data}>
        <CandlestickChart height={300}>
          <CandlestickChart.Candles />
          <CandlestickChart.Crosshair />
        </CandlestickChart>
      </CandlestickChart.Provider>
    </View>
  );
}
