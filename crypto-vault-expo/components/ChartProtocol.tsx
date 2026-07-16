import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Line } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth - 40;

type TimeRange = "1w" | "1m" | "3m" | "6m" | "1y";

type Props = {
  data: number[];
  labels: string[];
  price: string;
  percentChange: string;
  onRangeChange?: (range: TimeRange) => void;
  unit?: "" | "M" | "B"; // Đơn vị tiền tệ
};

const timeRanges: TimeRange[] = ["1w", "1m", "3m", "6m", "1y"];

const CryptoChart: React.FC<Props> = ({
  data,
  labels,
  price,
  percentChange,
  onRangeChange,
  unit = "",
}) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("1w");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const cursorX = useSharedValue(0);

  const formatNumber = (num: number): string => {
    if (unit === "M") {
      return (num / 1_000_000).toFixed(2) + "M";
    } else if (unit === "B") {
      return (num / 1_000_000_000).toFixed(2) + "B";
    } else {
      // Raw number with commas
      return num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    setSelectedIndex(null);
    cursorX.value = withTiming(0);
    onRangeChange?.(range);
  };

  const handleDataPointClick = (index: number) => {
    const pointX = (chartWidth / (data.length - 1)) * index;
    cursorX.value = withTiming(pointX);
    setSelectedIndex(index);
  };

  const animatedLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cursorX.value }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.price}>
        {selectedIndex !== null
          ? `$${formatNumber(data[selectedIndex])}`
          : price}
      </Text>
      <Text
        style={[
          styles.percentChange,
          {
            color:
              percentChange.startsWith("-") ||
              (selectedIndex !== null && data[selectedIndex] < data[0])
                ? "#dc3545"
                : "#28a745",
          },
        ]}
      >
        {percentChange}
      </Text>

      <View style={styles.rangeSelector}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range}
            onPress={() => handleRangeChange(range)}
            style={[
              styles.rangeButton,
              selectedRange === range && styles.activeRangeButton,
            ]}
          >
            <Text
              style={[
                styles.rangeText,
                selectedRange === range && styles.activeRangeText,
              ]}
            >
              {range}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ position: "relative" }}>
        <LineChart
          data={{
            labels,
            datasets: [{ data }],
          }}
          width={chartWidth}
          height={220}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLabels={true}
          yAxisSuffix={unit} // Hiển thị đơn vị ở trục y
          formatYLabel={(yValue: string) => {
            const num = parseFloat(yValue);
            return formatNumber(num);
          }}
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: () => "#999",
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#007AFF",
            },
          }}
          bezier
          withDots
          onDataPointClick={({ index }) => handleDataPointClick(index)}
          style={styles.chart}
        />
        {selectedIndex !== null && (
          <>
            <Animated.View
              style={[
                styles.cursorLineContainer,
                animatedLineStyle,
                { height: 220, position: "absolute", top: 0, left: 0 },
              ]}
            >
              <Svg height="220" width={chartWidth}>
                <Line
                  x="0"
                  y1="0"
                  y2="220"
                  stroke="#007AFF"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
              </Svg>
            </Animated.View>

            <View
              style={{
                position: "absolute",
                left: (chartWidth / (data.length - 1)) * selectedIndex - 30,
                top: 30,
                backgroundColor: "#007AFF",
                padding: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "white", fontSize: 12 }}>
                ${formatNumber(data[selectedIndex])}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default CryptoChart;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
  },
  percentChange: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  rangeSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  rangeButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  activeRangeButton: {
    backgroundColor: "#007AFF",
  },
  rangeText: {
    color: "#007AFF",
    fontWeight: "500",
  },
  activeRangeText: {
    color: "#fff",
  },
  chart: {
    borderRadius: 12,
  },
  cursorLineContainer: {
    width: 1,
    zIndex: 10,
  },
});
