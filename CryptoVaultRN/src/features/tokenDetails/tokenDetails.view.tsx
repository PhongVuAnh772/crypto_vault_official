import React from "react";
import { ActivityIndicator, View } from "react-native";
import { LineChart } from "react-native-wagmi-charts";

import useCoinChart from "./tokenDetails.hook";
import CoinChartStyles from "./tokenDetails.styles";

const TokenDetails: React.FC = () => {
  const { data, loading } = useCoinChart("ethereum");

  if (loading) {
    return (
      <View style={CoinChartStyles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Chuyển dữ liệu về dạng { timestamp, value }
  const chartData = data.map((item) => ({
    timestamp: new Date(item.x).getTime(),
    value: item.y,
  }));

  return (
    <View style={CoinChartStyles.container}>
      <LineChart.Provider data={chartData}>
        <LineChart height={200}>
          <LineChart.Gradient />
          <LineChart.Path color="#007aff" width={2} />
        </LineChart>
      </LineChart.Provider>
    </View>
  );
};

export default TokenDetails;
