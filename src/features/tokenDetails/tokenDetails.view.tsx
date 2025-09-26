import React from "react";
import { ActivityIndicator, View } from "react-native";
import { VictoryArea, VictoryChart, VictoryLine } from "victory-native";

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

  return (
    <View style={CoinChartStyles.container}>
      <VictoryChart
        padding={{ top: 0, bottom: 0, left: 0, right: 0 }}
        height={200}
      >
        <VictoryArea
          data={data}
          x="x"
          y="y"
          style={{
            data: {
              fill: "url(#gradientBlue)",
              strokeWidth: 0,
            },
          }}
          animate={{
            duration: 1500,
            easing: "linear",
            onLoad: { duration: 1500 },
          }}
        />

        <VictoryLine
          data={data}
          x="x"
          y="y"
          style={{
            data: {
              stroke: "#007aff",
              strokeWidth: 2,
            },
          }}
          animate={{
            duration: 2000,
            easing: "linear",
            onLoad: { duration: 2000 },
          }}
        />

        <svg>
          <defs>
            <linearGradient id="gradientBlue" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#007aff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>
      </VictoryChart>
    </View>
  );
};

export default TokenDetails;
