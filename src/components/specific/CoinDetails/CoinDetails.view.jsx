import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import CoinDetailedHeader from "./components/CoinDetailedHeader";
import styles from "./styles";
import { AntDesign } from "@expo/vector-icons";
import { LineChart, CandlestickChart } from "react-native-wagmi-charts";
import {
  getDetailedCoinData,
  getCoinMarketChart,
  getCandleChartData,
} from "./services/requests";
import FilterComponent from "./components/FilterComponent";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "components/AppText";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import appColors from "src/core/constants/AppColors";
import {
  ListButtonTokenTracking,
  TokenInfoTracking,
  TokenBalanceCard,
} from "./CoinDetails.components";
import { useCoinDetails } from "./CoinDetails.hook";
import { Skeleton } from "moti/skeleton";
import { useNavigation, StackActions } from "@react-navigation/native";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import {
  useAccountProtocolSelected,
  useProtocolSelected,
} from "src/core/redux/slice/account.selector";

const filterDaysArray = [
  { filterDay: "1", filterText: "24h" },
  { filterDay: "7", filterText: "7d" },
  { filterDay: "30", filterText: "30d" },
  { filterDay: "365", filterText: "1y" },
  { filterDay: "max", filterText: "All" },
];

const CoinDetailedScreen = ({
  isTransactionHistoryLoading,
  refreshing,
  onRefresh,
  onCloseTypeBottomSheet,
  typeSelect,
  changeTypeSelect,
  balanceTitle,
  balanceCurrencyTitle,
  sendAction,
  receiveAction,
  onShowTypeBottomSheet,
  sectionData,
  icon,
  titleWithI18n,
  titleScreen,
  renderItem,
  onLoadMore,
  ItemSeparatorComponent,
  ListFooterComponent,
  viewMoreHistory,
  onBack,
  refModalShowType,
  hideSendAction,
}) => {
  const { theme, backAction, typeSelectTitle, handleScroll, data } =
    useCoinDetails({
      typeSelect: typeSelect,
      onBack,
      onLoadMore,
    });
  const [coin, setCoin] = useState(null);
  const [coinMarketData, setCoinMarketData] = useState(null);
  const [coinCandleChartData, setCoinCandleChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coinValue, setCoinValue] = useState("1");
  const [usdValue, setUsdValue] = useState("");
  const [selectedRange, setSelectedRange] = useState("1");
  const [isCandleChartVisible, setIsCandleChartVisible] = useState(false);
  const navigation = useNavigation();
  const accountProtocolSelected = useAccountProtocolSelected();
  const protocolBaseData = useProtocolSelected();

  const addressList = accountProtocolSelected?.addressList;
  const selectedAddressId = accountProtocolSelected?.selectedAddressId;
  const selectedAddress = addressList?.find((e) => e.id === selectedAddressId);

  const fetchCoinData = async () => {
    setLoading(true);
    const fetchedCoinData = await getDetailedCoinData("bitcoin");
    setCoin(fetchedCoinData);
    setUsdValue(fetchedCoinData.market_data.current_price.usd.toString());
    setLoading(false);
  };

  const fetchMarketCoinData = async (selectedRangeValue) => {
    const fetchedCoinMarketData = await getCoinMarketChart(
      "bitcoin",
      selectedRangeValue
    );
    setCoinMarketData(fetchedCoinMarketData);
  };

  const fetchCandleStickChartData = async (selectedRangeValue) => {
    const fetchedSelectedCandleChartData = await getCandleChartData(
      "bitcoin",
      selectedRangeValue
    );
    setCoinCandleChartData(fetchedSelectedCandleChartData);
  };

  useEffect(() => {
    fetchCoinData();
    fetchMarketCoinData(1);
    fetchCandleStickChartData();
  }, []);

  const onSelectedRangeChange = (selectedRangeValue) => {
    setSelectedRange(selectedRangeValue);
    fetchMarketCoinData(selectedRangeValue);
    fetchCandleStickChartData(selectedRangeValue);
  };

  const memoOnSelectedRangeChange = React.useCallback(
    (range) => onSelectedRangeChange(range),
    []
  );

  if (loading || !coin || !coinMarketData || !coinCandleChartData) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 10 }}>
          <CoinDetailedHeader
            coinId={0}
            image={small}
            symbol={symbol}
            marketCapRank={market_cap_rank}
          />
          <View style={{ height: 15 }} />
          <Skeleton width={200} height={20} colorMode="light" />
          <View style={{ height: 15 }} />
          <Skeleton width={180} height={40} colorMode="light" />
          <View style={{ height: 15 }} />
          <Skeleton width={120} height={20} colorMode="light" />
          <View style={{ height: 15 }} />
          <Skeleton width={"100%"} height={400} colorMode="light" />
          <View style={{ height: 15 }} />
          <Skeleton width={"100%"} height={400} colorMode="light" />
          <Skeleton width={"100%"} height={400} colorMode="light" />
          <Skeleton width={"100%"} height={400} colorMode="light" />
          <Skeleton width={"100%"} height={400} colorMode="light" />
        </View>
      </SafeAreaView>
    );
  }

  const {
    id,
    image: { small },
    name,
    symbol,
    market_data: {
      market_cap_rank,
      current_price,
      price_change_percentage_24h,
    },
  } = coin;

  const { prices } = coinMarketData;

  const percentageColor =
    price_change_percentage_24h < 0 ? "#ea3943" : "#16c784" || "white";
  const chartColor = current_price.usd > prices[0][1] ? "#16c784" : "#ea3943";
  const screenWidth = Dimensions.get("window").width;

  const formatCurrency = ({ value }) => {
    "worklet";
    if (value === "") {
      if (current_price.usd < 1) {
        return `$${current_price.usd}`;
      }
      return `$${current_price.usd.toFixed(2)}`;
    }
    if (current_price.usd < 1) {
      return `$${parseFloat(value)}`;
    }
    return `$${parseFloat(value).toFixed(2)}`;
  };

  const changeCoinValue = (value) => {
    setCoinValue(value);
    const floatValue = parseFloat(value.replace(",", ".")) || 0;
    setUsdValue((floatValue * current_price.usd).toString());
  };

  const changeUsdValue = (value) => {
    setUsdValue(value);
    const floatValue = parseFloat(value.replace(",", ".")) || 0;
    setCoinValue((floatValue / current_price.usd).toString());
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 10 }}>
          <LineChart.Provider
            data={prices.map(([timestamp, value]) => ({ timestamp, value }))}
          >
            <CoinDetailedHeader
              coinId={id}
              image={small}
              symbol={symbol}
              marketCapRank={market_cap_rank}
            />
            <View style={styles.priceContainer}>
              <View>
                <AppText
                  title={"Etherium Mainnet Network"}
                  variant={TextVariantKeys.bodyRSmall}
                  textColor={"rgb(153, 157, 166)"}
                />
                <View style={{ height: 4 }} />
                <AppText
                  titleWithI18n={`$${usdValue}`}
                  variant={TextVariantKeys.headlineSmall}
                  textColor={appColors.neutral.black}
                />
                <View style={{ height: 4 }} />
                <View style={styles.priceChangeContainer}>
                  <AntDesign
                    name={
                      price_change_percentage_24h < 0 ? "caretdown" : "caretup"
                    }
                    size={12}
                    color={price_change_percentage_24h < 0 ? "red" : "green"}
                    style={{ marginRight: 5 }}
                  />
                  <AppText
                    titleWithI18n={`${price_change_percentage_24h}`}
                    variant={TextVariantKeys.bodyMSmall}
                    textColor={
                      price_change_percentage_24h < 0 ? "red" : "green"
                    }
                  />
                </View>
              </View>
            </View>
            {isCandleChartVisible ? (
              <CandlestickChart.Provider
                data={coinCandleChartData.map(
                  ([timestamp, open, high, low, close]) => ({
                    timestamp,
                    open,
                    high,
                    low,
                    close,
                  })
                )}
              >
                <CandlestickChart height={screenWidth} width={screenWidth}>
                  <CandlestickChart.Candles />
                  <CandlestickChart.Crosshair>
                    <CandlestickChart.Tooltip />
                  </CandlestickChart.Crosshair>
                </CandlestickChart>

                <CandlestickChart.DatetimeText
                  style={{ color: "white", fontWeight: "700", margin: 10 }}
                />
              </CandlestickChart.Provider>
            ) : (
              <LineChart.Provider
                data={prices.map(([timestamp, value]) => ({
                  timestamp,
                  value,
                }))}
              >
                <LineChart height={screenWidth} width={screenWidth}>
                  <LineChart.Path color="rgb(114, 129, 251)" width={2}>
                    <LineChart.Gradient
                      color="rgb(114, 129, 251)"
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      colors={["#7CA6FF", "#FFFFFF"]}
                      stops={[0, 1]}
                    />
                  </LineChart.Path>
                  <LineChart.CursorCrosshair color="rgb(114, 129, 251)" />
                </LineChart>
              </LineChart.Provider>
            )}
            <View style={styles.filtersContainer}>
              {filterDaysArray.map((day) => (
                <FilterComponent
                  filterDay={day.filterDay}
                  filterText={day.filterText}
                  selectedRange={selectedRange}
                  setSelectedRange={memoOnSelectedRangeChange}
                  key={day.filterText}
                />
              ))}
              {isCandleChartVisible ? (
                <MaterialIcons
                  name="show-chart"
                  size={24}
                  color="#16c784"
                  onPress={() => setIsCandleChartVisible(false)}
                />
              ) : (
                <MaterialIcons
                  name="waterfall-chart"
                  size={24}
                  color="#16c784"
                  onPress={() => setIsCandleChartVisible(true)}
                />
              )}
            </View>
            <ListButtonTokenTracking
              onSendPress={() => {
                navigation.navigate(HomeStackScreenKey.Transfer, {
                  isFromHome: true,
                });
              }}
              onReceivePress={() => {
                const symbol = protocolBaseData?.symbol;
                const address = selectedAddress?.address;
                if (symbol != null && address != null) {
                  const receiveProp = {
                    currency: symbol,
                    address: address,
                  };
                  navigation.dispatch(
                    StackActions.push(HomeStackScreenKey.Receive, receiveProp)
                  );
                } else {
                  Utils.showToast({
                    msg: t(LanguageKey.send_push_error_title),
                    type: AppToastType.error,
                    contentOffSet: contentOffsetToast,
                  });
                }
              }}
              onSwapPress={() => {
                navigation.dispatch(StackActions.push(HomeStackScreenKey.Swap));
              }}
              onBuyPress={() => {
                navigation.navigate(HomeStackScreenKey.Transfer, {
                  isFromHome: true,
                });
              }}
            />

            <TokenBalanceCard
              logoUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJDn0ojTITvcdAzMsfBMJaZC4STaDHzduleQ&s"
              name="Tether USD"
              change={-0.03}
              usdValue="$0.78"
              balance="0.77616 USDT"
            />
            <TokenInfoTracking />
          </LineChart.Provider>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CoinDetailedScreen;
