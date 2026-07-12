import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import ThemeKey from "src/core/enum/ThemeKey";
import { TransactionType } from "src/core/enum/TransactionType";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppSelector } from "src/core/redux/hooks";
import { getThemeMode } from "src/core/redux/slice/app.slice";
import { ChartPoint } from "./CoinDetails.type";
import axios from "axios";

export const useCoinDetails = ({
  typeSelect,
  onBack,
  onLoadMore,
}: {
  typeSelect: TransactionType;
  onBack?: () => void;
  onLoadMore?: () => void;
}) => {
  const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
  const { t } = useTranslation();
  const theme = useAppTheme();
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const navigation = useNavigation();
  const [hasCalledLoadMore, setHasCalledLoadMore] = useState(false);

  const backAction = () => {
    navigation.goBack();
    if (onBack) {
      onBack();
    }
  };
  const getSelectTypeTitle = () => {
    switch (typeSelect) {
      case TransactionType.All:
        return LanguageKey.transaction_all_type;
      case TransactionType.Sent:
        return LanguageKey.home_send_title;
      case TransactionType.Receive:
        return LanguageKey.home_receive_title;
      default:
        break;
    }
  };

  const typeSelectTitle = getSelectTypeTitle();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const distanceToEnd =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);

    if (distanceToEnd < -30 && !hasCalledLoadMore) {
      if (onLoadMore) {
        onLoadMore();
      }
      setHasCalledLoadMore(true);
    } else if (distanceToEnd >= -30 && hasCalledLoadMore) {
      setHasCalledLoadMore(false);
    }
  };
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCoinData = async (retryCount: number = 0): Promise<void> => {
    try {
      const res = await axios.get(
        `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7`
      );
      if (res.status === 200) {
        const json = res.data;
        console.log("res data", json);

        const prices: [number, number][] = json.prices || [];

        const formatted: ChartPoint[] = prices.map(([timestamp, price]) => ({
          timestamp,
          value: price,
        }));

        setData(formatted);
        
      } else if (res.status === 429) {
        console.warn("429 Too Many Requests - retry sau 1 phút...");
        setTimeout(() => fetchCoinData(retryCount + 1), 60000);
      } else {
        throw new Error("API Error: " + res.status);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoinData();
  }, []);

  return {
    t,
    insets,
    theme,
    lightMode,
    navigation,
    backAction,
    typeSelectTitle,
    handleScroll,
    data,
  };
};
