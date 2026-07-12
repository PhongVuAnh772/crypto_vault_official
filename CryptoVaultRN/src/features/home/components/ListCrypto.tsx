import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { AppThemeType } from "src/core/type/ThemeType";
import { ListCryptoDataType } from "../home.type";
import LanguageKey from "src/core/locales/LanguageKey";
import { t } from "i18next";
import Utils from "src/core/utils/commonUtils";
import { useCurrencyRateConversion, useSelectedCurrencySetting } from "src/core/redux/slice/account.selector";
import { useAppSelector } from "src/core/redux/hooks";
import { selectorHomeSearchKeyword } from "../slice/home.slice";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import {
  BitcoinSvgIcon,
  EthereumSvgIcon,
  BscSvgIcon,
  TonSvgIcon,
  PolygonSvgIcon,
} from 'src/core/constants/AppIconsSvg';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getLocalCoinIcon = (symbol: string, size = 32) => {
  const sym = String(symbol ?? "").toUpperCase();
  switch (sym) {
    case "BTC":
      return <BitcoinSvgIcon width={size} height={size} />;
    case "ETH":
      return <EthereumSvgIcon width={size} height={size} />;
    case "BNB":
      return <BscSvgIcon width={size} height={size} />;
    case "TON":
      return <TonSvgIcon width={size} height={size} />;
    case "POL":
    case "MATIC":
      return <PolygonSvgIcon width={size} height={size} />;
    default:
      return null;
  }
};

type ListCryptoType = {
  data: ListCryptoDataType[];
  handlePressItem?: (item: ListCryptoDataType) => void;
  handleSeeAll?: () => void;
};

const PressScaleItem: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}> = ({ onPress, children, style }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};

const ListCryptoComponent: React.FC<ListCryptoType> = ({
  data,
  handlePressItem,
  handleSeeAll,
}) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);
  const selectedCurrencySetting = useSelectedCurrencySetting();
  const currencyRateConversion = useCurrencyRateConversion();
  const searchKeyword = useAppSelector(selectorHomeSearchKeyword);
  const filteredData = React.useMemo(() => {
    const keyword = String(searchKeyword ?? "").trim().toLowerCase();
    if (!keyword) return data;
    return data.filter((item) => {
      const name = String(item.name ?? "").toLowerCase();
      const symbol = String(item.symbol ?? "").toLowerCase();
      const contractAddress = String(item.contractAddress ?? "").toLowerCase();
      return (
        name.includes(keyword) ||
        symbol.includes(keyword) ||
        contractAddress.includes(keyword)
      );
    });
  }, [data, searchKeyword]);

  const getTokenAmount = (item: ListCryptoDataType) => {
    if (typeof item.balanceToken === "number") {
      return item.balanceToken;
    }
    const balanceRaw = Number(item.balance ?? 0);
    if (!item.decimal || !Number.isFinite(balanceRaw)) {
      return balanceRaw;
    }
    if (Math.abs(balanceRaw) < 1e9) {
      return balanceRaw;
    }
    try {
      const converted = Utils.convertBigIntFollowDecimals(
        String(Math.trunc(balanceRaw)),
        item.decimal
      );
      return Number(converted);
    } catch {
      return balanceRaw;
    }
  };

  const getTokenValueInCurrency = (item: ListCryptoDataType) => {
    const amount = getTokenAmount(item);
    const tokenRate = Number(item.tokenRateCurrency ?? item.rateCurrency ?? 0);
    if (!Number.isFinite(amount) || !Number.isFinite(tokenRate)) return 0;
    return (
      amount *
      tokenRate *
      Number(selectedCurrencySetting?.rate ?? 1) *
      Number(currencyRateConversion ?? 1)
    );
  };

  const renderItem = React.useCallback(
    ({ item, index }: { item: ListCryptoDataType; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).springify().damping(15)}>
        <PressScaleItem
          style={styles.itemRow}
          onPress={() => handlePressItem && handlePressItem(item)}
        >
          <View style={styles.tokenInfo}>
            <View style={styles.tokenIcon}>
              {getLocalCoinIcon(item.symbol) || (
                item.logo ? (
                  typeof item.logo === 'string' && item.logo.startsWith('http') ? (
                    <Image source={{ uri: item.logo }} style={styles.logoImage} />
                  ) : typeof item.logo !== 'string' ? (
                    item.logo
                  ) : (
                    <Text style={styles.tokenInitial}>{item.symbol?.[0]}</Text>
                  )
                ) : (
                  <Text style={styles.tokenInitial}>{item.symbol?.[0]}</Text>
                )
              )}
            </View>
            <View>
              <Text style={styles.tokenName}>{item.name}</Text>
              <Text style={styles.tokenSymbol}>{item.symbol}</Text>
            </View>
          </View>
          <View style={styles.amountInfo}>
            <Text style={styles.tokenAmount}>{Utils.formattedBalanceCurrency(getTokenAmount(item))}</Text>
            <Text style={styles.tokenValue}>
              {(selectedCurrencySetting?.sign ?? "$") + " " + Utils.formattedCurrency(getTokenValueInCurrency(item))}
            </Text>
          </View>
        </PressScaleItem>
      </Animated.View>
    ),
    [handlePressItem, styles, selectedCurrencySetting?.sign, selectedCurrencySetting?.rate, currencyRateConversion]
  );

  return (
    <View style={styles.cardContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>{t(LanguageKey.token_list)}</Text>
        <Text style={styles.headerText}>
          {t(LanguageKey.project_detail_amount)}
        </Text>
      </View>
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
      <TouchableOpacity style={styles.seeAllBtn} onPress={handleSeeAll}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="layers" size={16} color="#9E86FF" style={{ marginRight: 6 }} />
          <Text style={styles.seeAllText}>Quản lý tài sản</Text>
        </View>
        <Feather name="chevron-right" size={16} color="#9E86FF" />
      </TouchableOpacity>
    </View>
  );
};

const ListCrypto = React.memo(ListCryptoComponent, (prevProps, nextProps) => {
  return (
    Utils.deepEqual(prevProps.data, nextProps.data) &&
    prevProps.handlePressItem === nextProps.handlePressItem &&
    prevProps.handleSeeAll === nextProps.handleSeeAll
  );
});

export default ListCrypto;

const useStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    cardContainer: {
      backgroundColor: '#131435', // Premium dark blue/purple background matching mockup
      borderRadius: 24,
      paddingVertical: 18,
      marginHorizontal: 16,
      marginTop: -16,
      borderWidth: 1,
      borderColor: '#1D1E4E',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      marginBottom: 10,
    },
    headerText: {
      color: '#8F9BB3', // Muted slate color matching mockup
      fontSize: 12,
      fontWeight: '500',
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(29, 30, 78, 0.5)',
    },
    tokenInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tokenIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#1C1A4A',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: '#2E2B7A',
    },
    logoImage: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },
    tokenInitial: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    tokenName: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 2,
    },
    tokenSymbol: {
      fontSize: 11,
      color: '#8F9BB3',
    },
    amountInfo: {
      alignItems: 'flex-end',
    },
    tokenAmount: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 2,
    },
    tokenValue: {
      fontSize: 11,
      color: '#8F9BB3',
    },
    seeAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 15,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginHorizontal: 18,
      borderRadius: 16,
      backgroundColor: 'rgba(158, 134, 255, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(158, 134, 255, 0.15)',
    },
    seeAllText: {
      color: '#9E86FF',
      fontSize: 14,
      fontWeight: '700',
    },
  });
