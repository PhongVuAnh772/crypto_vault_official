import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { useCurrentWallet, useProtocolSelected } from 'src/core/redux/slice/account.selector';
import { RootState } from 'src/core/redux/store';
import { CONFIG } from '../../core/constants/config';
import { usePriceSocket } from '../../core/hooks/usePriceSocket';
import { formatVN } from '../../core/utils/formatters';
import { HomeStackScreenKey } from '../../navigation/enum/NavigationKey';
import { createEmbeddedEvmSigner } from './services/dexSigners';
import { runDexSwapFlow } from './services/dexTradeFlow';
import { createWalletConnectSessionSigner, findActiveWalletConnectSession } from './services/walletConnectTradingSigner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LIGHT_COLORS = {
  bg: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#EAECEF',
  green: '#02C076',
  red: '#F6465D',
  textBlack: '#1E2329',
  textSecondary: '#707A8A',
  yellow: '#F0B90B',
};

interface Position {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  leverage: number;
  margin: number;
  amount: number;
  entryPrice: number;
  liqPrice: number;
}

interface PendingOrder {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  price: number;
  amount: number;
  leverage: number;
  margin: number;
  status: string;
  createdAt?: string;
}

interface TradingBalance {
  symbol: string;
  available: number;
  locked: number;
  total: number;
}

interface TradingAccount {
  balances: TradingBalance[];
  availableMargin: number;
  walletBalance: number;
  marginAsset: string;
}

interface MarketSummary {
  priceChangePercent?: string;
  highPrice?: string;
  lowPrice?: string;
  volume?: string;
  quoteVolume?: string;
  weightedAvgPrice?: string;
}

const normalizePosition = (raw: any): Position => ({
  id: raw.id,
  symbol: raw.symbol,
  side: raw.side,
  leverage: Number(raw.leverage || 1),
  margin: Number(raw.margin || 0),
  amount: Number(raw.amount || 0),
  entryPrice: Number(raw.entryPrice ?? raw.entry_price ?? 0),
  liqPrice: Number(raw.liqPrice ?? raw.liq_price ?? 0),
});

const normalizeOrder = (raw: any): PendingOrder => ({
  id: raw.id,
  symbol: raw.symbol,
  side: raw.side,
  type: raw.type,
  price: Number(raw.price || 0),
  amount: Number(raw.amount || 0),
  leverage: Number(raw.leverage || 1),
  margin: Number(raw.margin ?? ((Number(raw.amount || 0) * Number(raw.price || 0)) / Number(raw.leverage || 1))),
  status: raw.status,
  createdAt: raw.createdAt ?? raw.created_at,
});

const TradingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const symbol = route.params?.symbol || 'BTCUSDT';
  const market = route.params?.market || 'futures';
  const baseAsset = symbol.replace('USDT', '');

  const session = useSelector((state: RootState) => state.auth.session);
  const currentWallet = useCurrentWallet();
  const protocolSelected = useProtocolSelected();
  const token = session?.access_token;
  const { price, priceColor, orderBook, lastMessage } = usePriceSocket(symbol, market, token);

  // UI Interaction States
  const [activeTopTab, setActiveTopTab] = useState('USDⓈ-M');
  const [activeBottomTab, setActiveBottomTab] = useState('Vị thế');
  const [priceIn, setPriceIn] = useState('');
  const [amount, setAmount] = useState('');
  const [leverage, setLeverage] = useState<number>(Number(route.params?.leverage) || 1);
  const [activePercentage, setActivePercentage] = useState(0);
  const [isTPSLActive, setIsTPSLActive] = useState(false);
  const [sideTab, setSideTab] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [orderConfirming, setOrderConfirming] = useState(false);

  // Backend Simulation States
  const [positions, setPositions] = useState<Position[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [tradingAccount, setTradingAccount] = useState<TradingAccount | null>(null);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [tradeType, setTradeType] = useState<'CEX' | 'DEX'>('CEX');
  const [lastDexIntentStatus, setLastDexIntentStatus] = useState<string | null>(null);

  const baseBalance = useMemo(
    () => tradingAccount?.balances.find((item) => item.symbol === baseAsset),
    [baseAsset, tradingAccount?.balances]
  );
  const quoteBalance = useMemo(
    () => tradingAccount?.balances.find((item) => item.symbol === 'USDT'),
    [tradingAccount?.balances]
  );
  const currentNumericPrice = useMemo(() => Number(price || priceIn || 0), [price, priceIn]);
  const estimatedMargin = useMemo(() => {
    const size = Number(amount || 0);
    if (!size || !currentNumericPrice || !leverage) return 0;
    return (size * currentNumericPrice) / leverage;
  }, [amount, currentNumericPrice, leverage]);

  useEffect(() => {
    if (price && (!priceIn || parseFloat(priceIn) === 0)) setPriceIn(parseFloat(price).toFixed(1));
  }, [price]);

  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.event === 'position_update' && Array.isArray(lastMessage.data)) {
      setPositions(lastMessage.data.map(normalizePosition));
    }
    if (lastMessage.event === 'order_update' && Array.isArray(lastMessage.data)) {
      setPendingOrders(lastMessage.data.map(normalizeOrder));
    }
  }, [lastMessage]);

  // Logic: Swap trên Uniswap (DEX)
  const handleDexSwap = async () => {
    if (!currentWallet?.address || !token) {
      Alert.alert('Lỗi DEX', 'Không tìm thấy ví hiện tại');
      return;
    }
    setOrderConfirming(true);
    try {
      const tokenInSymbol = ['ETH', 'WETH'].includes(baseAsset.toUpperCase()) ? 'ETH' : 'WETH';
      if (!currentWallet.privateKey || !protocolSelected?.rpcUrl || !protocolSelected?.chainId) {
        throw new Error('Thiếu cấu hình signer (privateKey/rpcUrl/chainId)');
      }
      const dexChainId = Number(protocolSelected.chainId);
      const hasWalletConnectSession = !!findActiveWalletConnectSession(dexChainId, currentWallet.address);
      const signTransaction = hasWalletConnectSession
        ? createWalletConnectSessionSigner({
            chainId: dexChainId,
            fromAddress: currentWallet.address,
          })
        : createEmbeddedEvmSigner({
            privateKey: currentWallet.privateKey,
            rpcUrl: protocolSelected.rpcUrl,
            chainId: dexChainId,
            fromAddress: currentWallet.address,
          });
      const dexResult = await runDexSwapFlow({
        authToken: token,
        walletAddress: currentWallet.address,
        chainId: dexChainId,
        tokenIn: tokenInSymbol,
        tokenOut: 'USDT',
        amountIn: amount || '0',
        slippageBps: 50,
        deadlineSec: 1200,
        onStatusChange: (status) => setLastDexIntentStatus(status),
        signTransaction,
      });
      Alert.alert(
        dexResult.finalStatus === 'confirmed' ? 'Swap thành công' : 'Swap đã gửi',
        `Intent: ${dexResult.intentId}\nTx: ${dexResult.txHash || '--'}\nTrạng thái: ${dexResult.finalStatus}\nƯớc tính nhận: ${dexResult.amountOutMin || dexResult.amountOut || '--'} USDT`
      );
    } catch (e) {
      Alert.alert('Lỗi DEX', e instanceof Error ? e.message : 'Không thể thực hiện swap');
    } finally {
      setOrderConfirming(false);
    }
  };

  // Logic: Fetch and Manage Vị thế thực thụ qua Backend
  const fetchPositions = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/positions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payload = await res.json();
      if (payload.success) setPositions(payload.data.map(normalizePosition));
    } catch (e) {
      console.warn('Failed to fetch positions', e);
    }
  };

  const fetchPendingOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/orders/open`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payload = await res.json();
      if (payload.success) setPendingOrders(payload.data.map(normalizeOrder));
    } catch (e) {
      console.warn('Failed to fetch open orders', e);
    }
  };

  const fetchTradingAccount = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/v1/dex/account/trading`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payload = await res.json();
      if (!payload.error) {
        setTradingAccount({
          balances: (payload.balances || []).map((item: any) => ({
            symbol: item.symbol,
            available: Number(item.available || 0),
            locked: Number(item.locked || 0),
            total: Number(item.available || 0) + Number(item.locked || 0),
          })),
          availableMargin: Number(payload.availableMargin || 0),
          walletBalance: Number(payload.walletBalance || 0),
          marginAsset: payload.marginAsset || 'USDT',
        });
      }
    } catch (e) {
      console.warn('Failed to fetch trading account', e);
    }
  };

  const fetchMarketSummary = async () => {
    try {
      const query = new URLSearchParams({ market, symbol });
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/v1/dex/market/summary?${query.toString()}`);
      const payload = await res.json();
      if (!payload.error) {
        setMarketSummary({
          priceChangePercent: payload.change24hPct,
          highPrice: payload.high24h,
          lowPrice: payload.low24h,
          quoteVolume: payload.volume24h,
        });
      }
    } catch (e) {
      console.warn('Failed to fetch market summary', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPositions();
      fetchPendingOrders();
      fetchTradingAccount();
      fetchMarketSummary();
    }, [token, symbol, market])
  );

  const handleOrder = async (side: 'LONG' | 'SHORT') => {
    if (tradeType === 'DEX') {
      return handleDexSwap();
    }
    
    if (!token) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để giao dịch');
      return;
    }

    if (orderType === 'MARKET' && !price) {
      Alert.alert('Lỗi', 'Chưa có giá thị trường, vui lòng thử lại sau');
      return;
    }
    setOrderConfirming(true);

    try {
      const btcAmount = parseFloat(amount) || 0;
      const currentPrice = orderType === 'LIMIT'
        ? parseFloat(priceIn)
        : parseFloat(price || priceIn) || 0;
      const marginUsdt = (btcAmount * currentPrice) / leverage;

      if (!currentPrice || currentPrice <= 0 || btcAmount <= 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập giá và số lượng hợp lệ');
        return;
      }

      if (tradingAccount && marginUsdt > tradingAccount.availableMargin) {
        Alert.alert('Lỗi', `Số dư ${tradingAccount.marginAsset} khả dụng không đủ`);
        return;
      }

      const payload = {
        symbol,
        side,
        margin: marginUsdt,
        leverage, 
        amount: btcAmount,
        orderType,
        price: currentPrice
      };

      const res = await fetch(`${CONFIG.API_BASE_URL}/api/positions/open`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (data.success) {
        fetchPositions();
        fetchPendingOrders();
        fetchTradingAccount();
        setActiveBottomTab(orderType === 'LIMIT' ? 'Lệnh chờ' : 'Vị thế');
      } else {
        Alert.alert('Lỗi', data.error || 'Opening position failed');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Không thể kết nối đến Trading Engine');
    } finally {
      setOrderConfirming(false);
    }
  };

  const closePosition = async (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/positions/close`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setPositions(data.data.map(normalizePosition)); // Server trả về ds mới nhất
        fetchTradingAccount();
      }
    } catch (e) {
      console.warn('Failed to close position', e);
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/orders/cancel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPendingOrders(data.data.map(normalizeOrder));
        fetchTradingAccount();
      } else {
        Alert.alert('Lỗi', data.error || 'Cancel order failed');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Không thể hủy lệnh');
    }
  };

  const sellOrders = useMemo(() => {
    if (!orderBook.asks || orderBook.asks.length === 0) {
      return Array.from({ length: 7 }, (_, i) => ({ price: '0.0', amount: '0.000', width: 0 }));
    }
    return orderBook.asks.slice(0, 7).map(order => ({
      price: order[0],
      amount: order[1],
      width: Math.min(parseFloat(order[1]) * 1000, 100) // Visual bar based on amount
    })).reverse(); // Asks should be ordered from high to low for display
  }, [orderBook.asks]);

  const buyOrders = useMemo(() => {
    if (!orderBook.bids || orderBook.bids.length === 0) {
      return Array.from({ length: 7 }, (_, i) => ({ price: '0.0', amount: '0.000', width: 0 }));
    }
    return orderBook.bids.slice(0, 7).map(order => ({
      price: order[0],
      amount: order[1],
      width: Math.min(parseFloat(order[1]) * 1000, 100)
    }));
  }, [orderBook.bids]);

  const setAmountByPercent = (percent: number) => {
    setActivePercentage(percent);
    if (!currentNumericPrice || !tradingAccount?.availableMargin) {
      setAmount('');
      return;
    }
    const notional = tradingAccount.availableMargin * (percent / 100) * leverage;
    setAmount((notional / currentNumericPrice).toFixed(6));
  };

  const changeLeverage = (delta: number) => {
    setLeverage((current) => Math.min(125, Math.max(1, current + delta)));
  };

  const TradingViewChart = () => {
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>body { margin: 0; background-color: #FFFFFF; }</style>
        </head>
        <body>
          <div class="tradingview-widget-container">
            <div id="tradingview_widget"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
            <script type="text/javascript">
              new TradingView.widget({
                "autosize": true,
                "symbol": "BINANCE:${symbol}",
                "interval": "15",
                "timezone": "Etc/UTC",
                "theme": "light",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#FFFFFF",
                "enable_publishing": false,
                "hide_top_toolbar": true,
                "hide_legend": true,
                "save_image": false,
                "container_id": "tradingview_widget"
              });
            </script>
          </div>
        </body>
      </html>
    `;
    return (
      <View style={{ height: 220, backgroundColor: '#FFF', marginBottom: 10 }}>
        <WebView 
          source={{ html }} 
          style={{ backgroundColor: '#FFF' }}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        {['USDⓈ-M', 'COIN-M', 'Quyền Chọn', 'Đòn '].map((tab) => (
          <TouchableOpacity key={tab} style={styles.topNavTab} onPress={() => setActiveTopTab(tab)}>
            <Text style={[styles.topNavText, activeTopTab === tab && styles.activeTopNavText]}>{tab}</Text>
            {activeTopTab === tab && <View style={styles.activeLine} />}
          </TouchableOpacity>
        ))}
        <Feather name="menu" size={20} color={LIGHT_COLORS.textBlack} style={{ marginLeft: 'auto' }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Symbol */}
        <View style={styles.header}>
          <View style={styles.symbolRow}>
            <Text style={styles.symbolName}>{symbol}</Text>
            <View style={styles.perpBadge}><Text style={styles.perpText}>Vĩnh cửu</Text></View>
            <TouchableOpacity 
              style={[styles.typeToggle, tradeType === 'DEX' && styles.typeToggleActive]} 
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setTradeType(tradeType === 'CEX' ? 'DEX' : 'CEX');
              }}
            >
              <Text style={[styles.typeToggleText, tradeType === 'DEX' && styles.typeToggleTextActive]}>
                {tradeType}
              </Text>
            </TouchableOpacity>
            <Feather name="chevron-down" size={16} color={LIGHT_COLORS.textBlack} style={{ marginLeft: 4 }} />
          </View>
          <View style={styles.headerIcons}>
            <MaterialCommunityIcons name="help-circle-outline" size={20} color={LIGHT_COLORS.textSecondary} style={{ marginRight: 15 }} />
            <TouchableOpacity onPress={() => (navigation as any).navigate(HomeStackScreenKey.TradingDetail, { symbol, market })}>
              <MaterialCommunityIcons name="chart-areaspline" size={22} color={LIGHT_COLORS.textSecondary} />
            </TouchableOpacity>
            <Feather name="more-horizontal" size={22} color={LIGHT_COLORS.textSecondary} style={{ marginLeft: 16 }} />
          </View>
        </View>

        <View style={styles.changeRow}>
          <Text
            style={[
              styles.changeText,
              { color: Number(marketSummary?.priceChangePercent || 0) >= 0 ? LIGHT_COLORS.green : LIGHT_COLORS.red }
            ]}
          >
            {marketSummary?.priceChangePercent ? `${Number(marketSummary.priceChangePercent).toFixed(2)}%` : '--'}
          </Text>
          <Text style={styles.accountSummaryText}>
            Khả dụng: {formatVN(tradingAccount?.availableMargin ?? null, 2)} {tradingAccount?.marginAsset || 'USDT'}
          </Text>
        </View>

        {/* REAL TRADINGVIEW CHART */}
        <TradingViewChart />

        {/* Dashboard: Order Book (Left) + Trade Form (Right) */}
        <View style={styles.mainGrid}>
          {tradeType === 'CEX' ? (
            <>
              <View style={styles.orderBook}>
                <View style={styles.obLabels}>
                  <Text style={styles.obLabel}>Giá (USDT)</Text>
                  <Text style={styles.obLabel}>Số lượng ({baseAsset})</Text>
                </View>
                {sellOrders.map((o, i) => (
                  <TouchableOpacity key={`s-${i}`} style={styles.obRow} onPress={() => setPriceIn(o.price)}>
                    <View style={[styles.obBar, { width: `${o.width}%`, backgroundColor: '#FDECEF' }]} />
                    <Text style={[styles.obPrice, { color: LIGHT_COLORS.red }]}>{formatVN(o.price, 1)}</Text>
                    <Text style={styles.obAmount}>{o.amount.replace('.', ',')}</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.centerPrice}>
                  <Text style={[styles.mainLivePrice, { color: priceColor }]}>{price ? formatVN(price, 1) : '--'}</Text>
                  <Text style={styles.subLivePrice}>Mark {price ? formatVN(price, 1) : '--'}</Text>
                </View>
                {buyOrders.map((o, i) => (
                  <TouchableOpacity key={`b-${i}`} style={styles.obRow} onPress={() => setPriceIn(o.price)}>
                    <View style={[styles.obBar, { width: `${o.width}%`, backgroundColor: '#E6F9F1' }]} />
                    <Text style={[styles.obPrice, { color: LIGHT_COLORS.green }]}>{formatVN(o.price, 1)}</Text>
                    <Text style={styles.obAmount}>{o.amount.replace('.', ',')}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.tradingForm}>
                {/* Buy/Sell Tabs */}
                <View style={styles.sideTabRow}>
                  <TouchableOpacity 
                    style={[styles.sideTab, sideTab === 'BUY' && styles.sideTabBuyActive]} 
                    onPress={() => setSideTab('BUY')}
                  >
                    <Text style={[styles.sideTabText, sideTab === 'BUY' && styles.sideTabTextActive]}>Mua</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.sideTab, sideTab === 'SELL' && styles.sideTabSellActive]} 
                    onPress={() => setSideTab('SELL')}
                  >
                    <Text style={[styles.sideTabText, sideTab === 'SELL' && styles.sideTabTextActive]}>Bán</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formTopRow}>
                  <TouchableOpacity style={styles.marginBtn}><Text style={styles.marginText}>Cross</Text></TouchableOpacity>
                  <View style={styles.leverageControl}>
                    <TouchableOpacity style={styles.leverageStep} onPress={() => changeLeverage(-1)}>
                      <AntDesign name="minus" size={12} color={LIGHT_COLORS.textBlack} />
                    </TouchableOpacity>
                    <Text style={styles.marginText}>{leverage}x</Text>
                    <TouchableOpacity style={styles.leverageStep} onPress={() => changeLeverage(1)}>
                      <AntDesign name="plus" size={12} color={LIGHT_COLORS.textBlack} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Order Type Selector */}
                <View style={styles.orderTypeContainer}>
                  <TouchableOpacity 
                    style={styles.orderTypeBtn} 
                    onPress={() => setOrderType(orderType === 'LIMIT' ? 'MARKET' : 'LIMIT')}
                  >
                    <Text style={styles.orderTypeText}>{orderType === 'LIMIT' ? 'Lệnh Limit' : 'Lệnh Market'}</Text>
                    <Feather name="chevron-down" size={16} color={LIGHT_COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Price Input (Disabled for Market) */}
                <View style={[styles.inputContainer, { marginBottom: 12, opacity: orderType === 'MARKET' ? 0.6 : 1 }]}>
                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    disabled={orderType === 'MARKET'}
                    onPress={() => setPriceIn((p) => (parseFloat(p) - 0.1).toFixed(1))}
                  ><AntDesign name="minus" size={16} color={LIGHT_COLORS.textSecondary} /></TouchableOpacity>
                  
                  <View style={styles.inputCenter}>
                    <Text style={styles.inputHint}>Giá (USDT)</Text>
                    <TextInput 
                      style={styles.mainInput} 
                      value={orderType === 'MARKET' ? 'Giá thị trường' : priceIn.replace('.', ',')} 
                      onChangeText={(t) => setPriceIn(t.replace(',', '.'))} 
                      keyboardType="numeric" 
                      editable={orderType === 'LIMIT'}
                    />
                  </View>

                  <TouchableOpacity 
                    style={styles.stepBtn} 
                    disabled={orderType === 'MARKET'}
                    onPress={() => setPriceIn((p) => (parseFloat(p) + 0.1).toFixed(1))}
                  ><AntDesign name="plus" size={16} color={LIGHT_COLORS.textSecondary} /></TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setAmount((a) => (parseFloat(a) || 0) > 0 ? (parseFloat(a) - 0.01).toFixed(3) : '0')}><AntDesign name="minus" size={16} color={LIGHT_COLORS.textSecondary} /></TouchableOpacity>
                  <View style={styles.inputCenter}><Text style={styles.inputHint}>Số lượng ({baseAsset})</Text><TextInput style={styles.mainInput} value={amount} onChangeText={setAmount} keyboardType="numeric" /></View>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setAmount((a) => (parseFloat(a) || 0) >= 0 ? (parseFloat(a) + 0.01).toFixed(3) : '0.01')}><AntDesign name="plus" size={16} color={LIGHT_COLORS.textSecondary} /></TouchableOpacity>
                </View>

                {/* Percentage Selector Slider Mockup */}
                <View style={styles.dotRow}>
                  {[0, 25, 50, 75, 100].map(val => (
                    <TouchableOpacity 
                      key={val} 
                      style={[styles.dot, activePercentage === val && styles.dotActive]} 
                      onPress={() => setAmountByPercent(val)} 
                    />
                  ))}
                  <View style={styles.dotLine} />
                </View>

                <View style={styles.orderMeta}>
                  <Text style={styles.orderMetaText}>Ký quỹ: {estimatedMargin ? formatVN(estimatedMargin, 2) : '--'} USDT</Text>
                  <Text style={styles.orderMetaText}>Ví: {formatVN(tradingAccount?.walletBalance ?? null, 2)} USDT</Text>
                </View>

                <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsTPSLActive(!isTPSLActive)}>
                  <Feather name={isTPSLActive ? "check-square" : "square"} size={16} color={isTPSLActive ? LIGHT_COLORS.yellow : LIGHT_COLORS.border} />
                  <Text style={styles.checkboxText}>TP/SL</Text>
                </TouchableOpacity>

                {/* Dynamic Action Button */}
                <TouchableOpacity 
                  style={[
                    styles.primaryBtn, 
                    { backgroundColor: sideTab === 'BUY' ? LIGHT_COLORS.green : LIGHT_COLORS.red, marginTop: 10 }
                  ]} 
                  onPress={() => handleOrder(sideTab === 'BUY' ? 'LONG' : 'SHORT')} 
                  disabled={orderConfirming}
                >
                  {orderConfirming ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      {sideTab === 'BUY' ? 'Mua/Long' : 'Bán/Short'} {baseAsset}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Uniswap Swap UI */
            <View style={styles.dexContainer}>
              <View style={styles.swapCard}>
                <View style={styles.swapHeader}>
                  <Text style={styles.swapTitle}>Hoán đổi</Text>
                  <Feather name="settings" size={18} color={LIGHT_COLORS.textSecondary} />
                </View>

                {/* Token In */}
                <View style={styles.tokenBox}>
                  <View style={styles.tokenRow}>
                    <TextInput 
                      style={styles.tokenInput} 
                      placeholder="0" 
                      value={amount} 
                      onChangeText={setAmount}
                      keyboardType="numeric"
                      placeholderTextColor={LIGHT_COLORS.textSecondary}
                    />
                    <TouchableOpacity style={styles.tokenSelect}>
                      <View style={[styles.tokenIcon, { backgroundColor: '#627EEA' }]} />
                      <Text style={styles.tokenSymbol}>{baseAsset}</Text>
                      <Feather name="chevron-down" size={16} color={LIGHT_COLORS.textBlack} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.tokenBalance}>Số dư: {formatVN(baseBalance?.available ?? null, 6)} {baseAsset}</Text>
                </View>

                {/* Swap Icon */}
                <View style={styles.swapIconContainer}>
                   <View style={styles.swapIconLine} />
                   <TouchableOpacity style={styles.swapIconBtn}>
                      <AntDesign name="arrowdown" size={20} color={LIGHT_COLORS.textBlack} />
                   </TouchableOpacity>
                </View>

                {/* Token Out */}
                <View style={styles.tokenBox}>
                  <View style={styles.tokenRow}>
                    <TextInput 
                      style={styles.tokenInput} 
                      placeholder="0" 
                      value={formatVN(((parseFloat(amount) || 0) * parseFloat(price || '0')).toString(), 2)}
                      editable={false}
                      placeholderTextColor={LIGHT_COLORS.textSecondary}
                    />
                    <TouchableOpacity style={styles.tokenSelect}>
                      <View style={[styles.tokenIcon, { backgroundColor: '#26A17B' }]} />
                      <Text style={styles.tokenSymbol}>USDT</Text>
                      <Feather name="chevron-down" size={16} color={LIGHT_COLORS.textBlack} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.tokenBalance}>Số dư: {formatVN(quoteBalance?.available ?? null, 2)} USDT</Text>
                </View>

                <TouchableOpacity 
                   style={[styles.primaryBtn, { backgroundColor: LIGHT_COLORS.yellow, marginTop: 24 }]} 
                   onPress={handleDexSwap}
                   disabled={orderConfirming}
                >
                  {orderConfirming ? <ActivityIndicator color="black" /> : <Text style={[styles.primaryBtnText, { color: 'black' }]}>Thực hiện Hoán đổi</Text>}
                </TouchableOpacity>
                
                <View style={styles.priceInfo}>
                   <Text style={styles.priceInfoText}>1 {baseAsset} = {formatVN(price || '0', 2)} USDT</Text>
                   <MaterialCommunityIcons name="gas-station" size={14} color={LIGHT_COLORS.textSecondary} />
                   <Text style={styles.priceInfoText}> Gas --</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Positions History Section */}
        <View style={styles.bottomTabs}>
          {[
            { key: 'Vị thế', label: `Vị thế (${positions.length})` },
            { key: 'Lệnh chờ', label: `Lệnh chờ (${pendingOrders.length})` },
            { key: 'Bot', label: 'Bot' },
          ].map(tab => (
            <TouchableOpacity key={tab.key} style={styles.bottomTabItem} onPress={() => setActiveBottomTab(tab.key)}>
              <Text style={[styles.bottomTabText, activeBottomTab === tab.key && styles.activeBottomTabText]}>{tab.label}</Text>
              {activeBottomTab === tab.key && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {activeBottomTab === 'Vị thế' && positions.length > 0 ? (
          <View style={styles.positionsList}>
            {positions.map(pos => {
              const currentPrice = parseFloat(price || pos.entryPrice.toString());
              const diff = pos.side === 'LONG' ? (currentPrice - pos.entryPrice) : (pos.entryPrice - currentPrice);
              const pnl = (diff * pos.amount).toFixed(2);
              const roi = ((parseFloat(pnl) / pos.margin) * 100).toFixed(2);
              const isPositive = parseFloat(pnl) >= 0;

              return (
                <View key={pos.id} style={styles.posCard}>
                  <View style={styles.posHeader}>
                    <View style={[styles.sideBadge, { backgroundColor: pos.side === 'LONG' ? '#EDFBF3' : '#FDF2F3' }]}>
                      <Text style={{ color: pos.side === 'LONG' ? LIGHT_COLORS.green : LIGHT_COLORS.red, fontWeight: '800', fontSize: 13 }}>{pos.side} {pos.leverage}x</Text>
                    </View>
                    <Text style={styles.posSymbol}>{pos.symbol} Vĩnh cửu</Text>
                    <TouchableOpacity onPress={() => closePosition(pos.id)}><AntDesign name="close" size={16} color={LIGHT_COLORS.textSecondary} /></TouchableOpacity>
                  </View>
                  <View style={styles.pnlRow}>
                    <View><Text style={styles.pnlLabel}>PNL (USDT)</Text><Text style={[styles.pnlVal, { color: isPositive ? LIGHT_COLORS.green : LIGHT_COLORS.red }]}>{isPositive ? '+' : ''}{formatVN(pnl, 2)}</Text></View>
                    <View style={{ alignItems: 'flex-end' }}><Text style={styles.pnlLabel}>ROI</Text><Text style={[styles.roiVal, { color: isPositive ? LIGHT_COLORS.green : LIGHT_COLORS.red }]}>{isPositive ? '+' : ''}{roi}%</Text></View>
                  </View>
                  <View style={styles.posDetailsGrid}>
                    <View style={styles.posDetailItem}><Text style={styles.detailLabel}>Giá vào lệnh</Text><Text style={styles.detailVal}>{formatVN(pos.entryPrice, 1)}</Text></View>
                    <View style={styles.posDetailItem}><Text style={styles.detailLabel}>Giá thanh lý</Text><Text style={[styles.detailVal, { color: LIGHT_COLORS.yellow }]}>{formatVN(pos.liqPrice, 1)}</Text></View>
                    <View style={styles.posDetailItem}><Text style={styles.detailLabel}>Giá đánh dấu</Text><Text style={styles.detailVal}>{formatVN(price || pos.entryPrice, 1)}</Text></View>
                    <View style={styles.posDetailItem}><Text style={styles.detailLabel}>Quy mô ({baseAsset})</Text><Text style={styles.detailVal}>{pos.amount.toFixed(3)}</Text></View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : activeBottomTab === 'Lệnh chờ' && pendingOrders.length > 0 ? (
          <View style={styles.positionsList}>
            {pendingOrders.map(order => (
              <View key={order.id} style={styles.posCard}>
                <View style={styles.posHeader}>
                  <View style={[styles.sideBadge, { backgroundColor: order.side === 'BUY' ? '#EDFBF3' : '#FDF2F3' }]}>
                    <Text style={{ color: order.side === 'BUY' ? LIGHT_COLORS.green : LIGHT_COLORS.red, fontWeight: '800', fontSize: 13 }}>
                      {order.side === 'BUY' ? 'Mua/Long' : 'Bán/Short'} {order.leverage}x
                    </Text>
                  </View>
                  <Text style={styles.posSymbol}>{order.symbol} Limit</Text>
                  <TouchableOpacity onPress={() => cancelOrder(order.id)}>
                    <Text style={styles.cancelOrderText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.posDetailsGrid}>
                  <View style={styles.posDetailItem}><Text style={styles.detailLabel}>Giá đặt</Text><Text style={styles.detailVal}>{formatVN(order.price, 1)}</Text></View>
                  <View style={styles.posDetailItem}><Text style={styles.detailLabel}>Giá đánh dấu</Text><Text style={styles.detailVal}>{formatVN(price || order.price, 1)}</Text></View>
                  <View style={styles.posDetailItem}><Text style={styles.detailLabel}>Số lượng ({baseAsset})</Text><Text style={styles.detailVal}>{order.amount.toFixed(3)}</Text></View>
                  <View style={styles.posDetailItem}><Text style={styles.detailLabel}>Margin</Text><Text style={styles.detailVal}>{formatVN(order.margin, 2)} USDT</Text></View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCircle}><View style={styles.emptyInner} /><View style={styles.emptyInnerSmall} /></View>
            <Text style={{ color: LIGHT_COLORS.textSecondary, marginTop: 10 }}>
              {activeBottomTab === 'Lệnh chờ' ? 'Không có lệnh chờ' : 'Không có vị thế hoạt động'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Persistence Navigation */}
      <View style={styles.footerNav}>
        <FooterIcon name="home-variant-outline" label="Trang chủ" />
        <FooterIcon name="chart-line" label="Thị trường" />
        <FooterIcon name="swap-horizontal" label="Giao dịch" />
        <FooterIcon name="file-document-edit-outline" label="Futures" active />
        <FooterIcon name="wallet-outline" label="Tài sản" />
      </View>
    </SafeAreaView>
  );
};

const FooterIcon = ({ name, label, active }: any) => (
  <TouchableOpacity style={styles.footerIconItem}>
    <MaterialCommunityIcons name={name} size={24} color={active ? LIGHT_COLORS.textBlack : LIGHT_COLORS.textSecondary} />
    <Text style={[styles.footerLabel, active && styles.activeFooterLabel]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LIGHT_COLORS.bg },
  topNav: { flexDirection: 'row', paddingHorizontal: 16, height: 44, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: LIGHT_COLORS.border },
  topNavTab: { marginRight: 20, height: '100%', justifyContent: 'center', alignItems: 'center' },
  topNavText: { fontSize: 13, fontWeight: '700', color: LIGHT_COLORS.textSecondary },
  activeTopNavText: { color: LIGHT_COLORS.textBlack },
  activeLine: { position: 'absolute', bottom: 0, height: 3, backgroundColor: LIGHT_COLORS.yellow, width: '100%', borderRadius: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', paddingBottom: 5 },
  symbolRow: { flexDirection: 'row', alignItems: 'center' },
  symbolName: { fontSize: 24, fontWeight: '800', color: LIGHT_COLORS.textBlack },
  perpBadge: { backgroundColor: LIGHT_COLORS.surface, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2, marginLeft: 6 },
  perpText: { fontSize: 10, color: LIGHT_COLORS.textSecondary, fontWeight: '400' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  changeRow: { paddingHorizontal: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  changeText: { fontSize: 13, fontWeight: '600' },
  accountSummaryText: { fontSize: 12, color: LIGHT_COLORS.textSecondary, fontWeight: '600' },
  mainGrid: { flexDirection: 'row', paddingHorizontal: 16 },
  orderBook: { flex: 0.45, paddingRight: 5 },
  obLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  obLabel: { fontSize: 10, color: LIGHT_COLORS.textSecondary },
  obRow: { flexDirection: 'row', justifyContent: 'space-between', height: 22, alignItems: 'center', position: 'relative' },
  obBar: { position: 'absolute', right: 0, height: '90%' },
  obPrice: { fontSize: 13, fontWeight: '600' },
  obAmount: { fontSize: 12, color: LIGHT_COLORS.textBlack },
  centerPrice: { paddingVertical: 12, alignItems: 'center' },
  mainLivePrice: { fontSize: 20, fontWeight: '800' },
  subLivePrice: { fontSize: 12, color: LIGHT_COLORS.textSecondary, marginTop: 2 },
  tradingForm: { flex: 0.55, paddingLeft: 10 },
  orderTypeContainer: {},
  sideTabRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    marginBottom: 12,
    height: 36,
    padding: 2,
  },
  sideTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  sideTabBuyActive: {
    backgroundColor: LIGHT_COLORS.green,
  },
  sideTabSellActive: {
    backgroundColor: LIGHT_COLORS.red,
  },
  sideTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#707A8A',
  },
  sideTabTextActive: {
    color: '#FFFFFF',
  },
  formTopRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  marginBtn: { flex: 1, height: 30, backgroundColor: LIGHT_COLORS.surface, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  marginText: { fontSize: 12, fontWeight: '700', color: LIGHT_COLORS.textBlack },
  leverageControl: { flex: 1, height: 30, backgroundColor: LIGHT_COLORS.surface, borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 6 },
  leverageStep: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  orderTypeBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: LIGHT_COLORS.border, padding: 8, borderRadius: 4, marginBottom: 12 },
  orderTypeText: { fontSize: 14, fontWeight: '700', color: LIGHT_COLORS.textBlack },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: LIGHT_COLORS.border, borderRadius: 4, height: 48 },
  stepBtn: { width: 36, height: '100%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 0.5, borderLeftWidth: 0.5, borderColor: LIGHT_COLORS.border },
  inputCenter: { flex: 1, height: '100%', paddingHorizontal: 8, justifyContent: 'center' },
  inputHint: { fontSize: 9, color: LIGHT_COLORS.textSecondary, position: 'absolute', top: 4, left: 8 },
  mainInput: { color: LIGHT_COLORS.textBlack, fontSize: 15, fontWeight: '800', marginTop: 8 },
  dotRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, position: 'relative' },
  dotLine: { position: 'absolute', height: 1, width: '100%', backgroundColor: LIGHT_COLORS.border, top: 22, zIndex: -1 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: LIGHT_COLORS.bg, borderWidth: 1, borderColor: LIGHT_COLORS.border },
  dotActive: { borderColor: LIGHT_COLORS.yellow, borderWidth: 2 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  checkboxText: { fontSize: 12, color: LIGHT_COLORS.textSecondary, fontWeight: '600' },
  orderMeta: { marginBottom: 8, gap: 3 },
  orderMetaText: { fontSize: 11, color: LIGHT_COLORS.textSecondary, fontWeight: '600' },
  primaryBtn: { height: 46, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
  bottomTabs: { flexDirection: 'row', paddingHorizontal: 16, borderTopWidth: 6, borderTopColor: '#F5F5F5', marginTop: 20, height: 44, alignItems: 'center' },
  bottomTabItem: { marginRight: 20, height: '100%', justifyContent: 'center' },
  bottomTabText: { fontSize: 14, color: LIGHT_COLORS.textSecondary, fontWeight: '600' },
  activeBottomTabText: { fontSize: 14, color: LIGHT_COLORS.textBlack, fontWeight: '800' },
  activeTabIndicator: { position: 'absolute', bottom: 10, height: 3, width: 24, backgroundColor: LIGHT_COLORS.yellow, borderRadius: 2, alignSelf: 'center' },
  positionsList: { padding: 16 },
  posCard: { backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 15 },
  posHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sideBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, marginRight: 8 },
  posSymbol: { fontSize: 15, fontWeight: '800', flex: 1, color: '#000' },
  pnlRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  pnlLabel: { fontSize: 11, color: '#848E9C', marginBottom: 4 },
  pnlVal: { fontSize: 20, fontWeight: '900' },
  roiVal: { fontSize: 16, fontWeight: '800' },
  posDetailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  posDetailItem: { width: '45%' },
  detailLabel: { fontSize: 10, color: '#848E9C', marginBottom: 2 },
  detailVal: { fontSize: 13, fontWeight: '700', color: '#000' },
  cancelOrderText: { fontSize: 13, fontWeight: '800', color: LIGHT_COLORS.red },
  emptyContainer: { height: 150, justifyContent: 'center', alignItems: 'center' },
  emptyCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: LIGHT_COLORS.border, justifyContent: 'center', alignItems: 'center' },
  emptyInner: { width: 20, height: 1, backgroundColor: LIGHT_COLORS.border },
  emptyInnerSmall: { width: 8, height: 1, backgroundColor: LIGHT_COLORS.border, marginTop: 4 },
  footerNav: { flexDirection: 'row', height: 60, borderTopWidth: 1, borderTopColor: LIGHT_COLORS.border, backgroundColor: 'white', paddingBottom: Platform.OS === 'ios' ? 10 : 0 },
  footerIconItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footerLabel: { fontSize: 10, color: LIGHT_COLORS.textSecondary, marginTop: 2 },
  activeFooterLabel: { color: LIGHT_COLORS.textBlack, fontWeight: '700' },
  dexContainer: {
    flex: 1,
    paddingVertical: 10
  },
  swapCard: {
    backgroundColor: '#FAF9FA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECEF'
  },
  swapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  swapTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: LIGHT_COLORS.textBlack
  },
  tokenBox: {
    backgroundColor: '#EDF1F5',
    borderRadius: 12,
    padding: 12
  },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tokenInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: LIGHT_COLORS.textBlack,
    padding: 0
  },
  tokenSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6
  },
  tokenIcon: {
    width: 20,
    height: 20,
    borderRadius: 10
  },
  tokenSymbol: {
    fontSize: 14,
    fontWeight: '800',
    color: LIGHT_COLORS.textBlack
  },
  tokenBalance: {
    fontSize: 12,
    color: LIGHT_COLORS.textSecondary,
    marginTop: 8
  },
  swapIconContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: -8,
    zIndex: 1
  },
  swapIconLine: {
    position: 'absolute',
    height: '100%',
    width: 2,
    backgroundColor: '#FAF9FA'
  },
  swapIconBtn: {
    borderWidth: 4,
    borderColor: '#FAF9FA',
    borderRadius: 12,
    backgroundColor: '#EDF1F5'
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4
  },
  priceInfoText: {
    fontSize: 12,
    color: LIGHT_COLORS.textSecondary,
    fontWeight: '600'
  },
  typeToggle: {
    marginLeft: 10,
    backgroundColor: LIGHT_COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LIGHT_COLORS.border
  },
  typeToggleActive: {
    backgroundColor: LIGHT_COLORS.yellow,
    borderColor: LIGHT_COLORS.yellow
  },
  typeToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: LIGHT_COLORS.textSecondary
  },
  typeToggleTextActive: {
    color: LIGHT_COLORS.textBlack
  }
});

export default TradingScreen;
