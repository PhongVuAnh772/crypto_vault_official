import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { PinchGestureHandler, PinchGestureHandlerStateChangeEvent, State } from 'react-native-gesture-handler';
import { CandlestickChart, LineChart } from 'react-native-wagmi-charts';
import { CONFIG } from '../../core/constants/config';
import { usePriceSocket } from '../../core/hooks/usePriceSocket';

// Refactored Imports
import { useChartData } from './hooks/useChartData';
import { Timeframe } from './types/trading';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  bg: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#EAECEF',
  green: '#00C076',
  red: '#CF304A',
  textGray: '#848E9C',
  textBlack: '#1E2329',
  yellow: '#F0B90B',
};

const TradingDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const symbol = route.params?.symbol || 'BTCUSDT';
  const market = route.params?.market || 'futures';
  
  const [tradeType, setTradeType] = useState<'CEX' | 'DEX'>(route.params?.tradeType || 'CEX');

  const { price, priceColor } = usePriceSocket(symbol, market);
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('15p');
  const [chartType, setChartType] = useState<'line' | 'candle'>('candle');

  const {
    visibleLineData,
    visibleCandleData,
    handleZoom,
    reinitializeCandles
  } = useChartData({ price, activeTimeframe });

  const [positions, setPositions] = useState<any[]>([]);

  // Quick Order Bottom Sheet States
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [quickOrderSide, setQuickOrderSide] = useState<'LONG' | 'SHORT' | 'DEX' | null>(null);
  const [amount, setAmount] = useState('0.05');
  const [orderConfirming, setOrderConfirming] = useState(false);

  const fetchLocalPositions = async () => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/positions`);
      const payload = await res.json();
      if (payload.success) setPositions(payload.data);
    } catch (e) {
      console.warn('Failed to fetch positions', e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchLocalPositions();
    }, [])
  );

  const handleOpenOrderSheet = (side: 'LONG' | 'SHORT') => {
    setQuickOrderSide(side);
    setShowQuickOrder(true);
  };

  const submitQuickOrder = async () => {
    if (!quickOrderSide) return;
    setOrderConfirming(true);
    try {
      if (quickOrderSide === 'DEX') {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/dex/swap-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountIn: amount,
            tokenIn: '0xfFf9976782d46CC05630D1f6eBaf18945f85f2b8', // Default WETH
            tokenOut: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // Sepolia USDT
            slippage: 0.5
          })
        });
        const result = await response.json();
        if (result.success) {
          setShowQuickOrder(false);
          Alert.alert('Uniswap Swap', `Báo giá: ~ ${result.data.estimatedOutput} USDT. Yêu cầu ký đã gửi tới ví.`);
        } else {
          Alert.alert('Lỗi DEX', result.error || 'Không thể lấy báo giá');
        }
        return;
      }

      const btcAmount = parseFloat(amount) || 0.05;
      const currentPrice = parseFloat(price || '69000');
      const leverage = 20;
      const marginUsdt = (btcAmount * currentPrice) / leverage;

      const payload = {
        symbol,
        side: quickOrderSide,
        margin: marginUsdt,
        leverage,
        amount: btcAmount
      };

      const res = await fetch(`${CONFIG.API_BASE_URL}/api/positions/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setShowQuickOrder(false); // Close Modal
        fetchLocalPositions();    // Refresh positions immediately
      } else {
        Alert.alert('Lỗi', data.error || 'Opening position failed');
      }
    } catch (e) {
      Alert.alert('Lỗi Mạng', 'Không thể kết nối đến Trading Engine');
    } finally {
      setOrderConfirming(false);
    }
  };

  const handleClosePosition = async (id: string) => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/positions/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        fetchLocalPositions(); // Xóa khỏi UI
        Alert.alert('Thành công', 'Đã chốt (đóng) vị thế thành công trên Binance Testnet');
      } else {
        Alert.alert('Lỗi', data.error || 'Đóng vị thế thất bại');
      }
    } catch (e) {
      console.warn('Failed to close position', e);
    }
  };

  const handleTimeframeChange = (tf: Timeframe) => {
    // ... existing logic will be preserved since we just target up to handleTimeframeChange ...
    setActiveTimeframe(tf);
    if (tf === 'Thời gian') {
      setChartType('line');
    } else {
      setChartType('candle');
      reinitializeCandles(tf, price);
    }
  };

  const onPinchStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      handleZoom(event.nativeEvent.scale);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={COLORS.textBlack} />
        </TouchableOpacity>
        <View style={styles.headerSymbol}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.symbolText}>{symbol}</Text>
            <View style={styles.perpBadge}><Text style={styles.perpText}>Vĩnh cửu</Text></View>
            <TouchableOpacity 
              style={[styles.typeToggle, tradeType === 'DEX' && styles.typeToggleActive]} 
              onPress={() => setTradeType(tradeType === 'CEX' ? 'DEX' : 'CEX')}
            >
              <Text style={[styles.typeToggleText, tradeType === 'DEX' && styles.typeToggleTextActive]}>{tradeType}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.symbolSubText}>{tradeType === 'CEX' ? 'Binance Futures' : 'Uniswap V2 Pool'}</Text>
        </View>
        <View style={styles.headerIcons}>
          <AntDesign name="star" size={22} color={COLORS.yellow} />
          <Feather name="bell" size={22} color={COLORS.textBlack} style={{ marginLeft: 15 }} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Navigation Tabs */}
        <View style={styles.tabBar}>
          {['Giá', 'Thông tin', 'Dữ liệu giao dịch', 'Square', 'Trade-X'].map((tab, i) => (
            <TouchableOpacity key={tab} style={styles.tabItem}>
              <Text style={[styles.tabText, i === 0 && styles.activeTabText]}>{tab}</Text>
              {i === 0 && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Market Stats Bar */}
        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={styles.priceLabel}>Giá {tradeType === 'DEX' ? 'Swap' : 'gần nhất'} <Feather name="chevron-down" size={12} /></Text>
            <Text style={[styles.mainPrice, { color: COLORS.green }]}>{parseFloat(price || '68350').toLocaleString('vi-VN')}</Text>
            <Text style={[styles.subPriceInfo, { color: COLORS.green }]}>{(price || '68350.0').toString().replace('.', ',')}0000$ <Text style={{ fontWeight: '700' }}>+3,39%</Text></Text>
            <Text style={styles.markPriceSub}>{tradeType === 'CEX' ? 'Giá đánh dấu 69.209,8' : 'Price Impact < 0.01%'}</Text>
          </View>
          
          {tradeType === 'CEX' ? (
            <View style={styles.statsGrid}>
              <View style={styles.statLine}><Text style={styles.statLabel}>Giá cao nhất 24h</Text><Text style={styles.statVal}>69.583,0</Text></View>
              <View style={styles.statLine}><Text style={styles.statLabel}>Giá thấp nhất 24h</Text><Text style={styles.statVal}>66.650,0</Text></View>
              <View style={styles.statLine}><Text style={styles.statLabel}>KL 24h(BTC)</Text><Text style={styles.statVal}>134.721,683</Text></View>
              <View style={styles.statLine}><Text style={styles.statLabel}>KL 24h(USDT)</Text><Text style={styles.statVal}>9,19B</Text></View>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statLine}><Text style={styles.statLabel}>TVL (Pool)</Text><Text style={[styles.statVal, { color: COLORS.yellow }]}>$25.84M</Text></View>
              <View style={styles.statLine}><Text style={styles.statLabel}>Khối lượng 24h</Text><Text style={styles.statVal}>$1.11M</Text></View>
              <View style={styles.statLine}><Text style={styles.statLabel}>APR (Phí)</Text><Text style={[styles.statVal, { color: COLORS.green }]}>12.5%</Text></View>
              <View style={styles.statLine}><Text style={styles.statLabel}>Thanh khoản</Text><Text style={styles.statVal}>Cao</Text></View>
            </View>
          )}
        </View>

        {/* Chart Tool Bar */}
        <View style={styles.tfBar}>
          {(['Thời gian', '15p', '1h', '4h', '1n', 'Nhiều hơn'] as Timeframe[]).map((tf) => (
            <TouchableOpacity key={tf} onPress={() => handleTimeframeChange(tf)}>
              <Text style={[styles.tfText, activeTimeframe === tf && styles.activeTfText]}>{tf}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.tfIcons}>
            <TouchableOpacity onPress={() => setChartType(chartType === 'line' ? 'candle' : 'line')}>
              <MaterialCommunityIcons
                name={chartType === 'line' ? "candle" : "chart-line"}
                size={20}
                color={COLORS.yellow}
              />
            </TouchableOpacity>
            <MaterialCommunityIcons name="cog-outline" size={18} color={COLORS.textGray} style={{ marginLeft: 15 }} />
            <MaterialCommunityIcons name="grid-large" size={18} color={COLORS.textGray} style={{ marginLeft: 15 }} />
          </View>
        </View>

        {/* Active Position Marker */}
        {positions.filter(p => p?.symbol?.toUpperCase() === symbol?.toUpperCase()).map((pos) => {
          const currentPrice = parseFloat(price || pos.entryPrice.toString());
          const diff = pos.side === 'LONG' ? (currentPrice - pos.entryPrice) : (pos.entryPrice - currentPrice);
          const pnl = (diff * pos.amount).toFixed(2);
          const roi = ((parseFloat(pnl) / (pos.margin || 1)) * 100).toFixed(2);
          const isPositive = parseFloat(pnl) >= 0;
          return (
            <View key={pos.id} style={styles.positionMarker}>
              <View style={[styles.posBadge, { backgroundColor: pos.side === 'LONG' ? '#E1F6EB' : '#FCE6EA' }]}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: pos.side === 'LONG' ? COLORS.green : COLORS.red }}>{pos.side} {pos.leverage}x</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ fontSize: 11, color: COLORS.textGray }}>Vào lệnh: <Text style={{ color: COLORS.textBlack, fontWeight: '700' }}>{pos.entryPrice}</Text> • Quy mô: <Text style={{ color: COLORS.textBlack, fontWeight: '700' }}>{pos.amount} BTC</Text></Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: isPositive ? COLORS.green : COLORS.red }}>{isPositive ? '+' : ''}{roi}%</Text>
                <TouchableOpacity onPress={() => handleClosePosition(pos.id)} style={{ marginTop: 2, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#EAECEF', borderRadius: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: COLORS.textBlack }}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Chart Core with UI Providers */}
        <PinchGestureHandler onHandlerStateChange={onPinchStateChange}>
          <View style={styles.chartContainer}>
            {chartType === 'line' ? (
              <LineChart.Provider key={`line-${activeTimeframe}`} data={visibleLineData}>
                <LineChart width={SCREEN_WIDTH} height={350}>
                  <LineChart.Path color={COLORS.yellow} width={2}>
                    <LineChart.Gradient color={COLORS.yellow} opacity={0.3} />
                  </LineChart.Path>
                  <LineChart.CursorCrosshair color={COLORS.textGray}>
                    <LineChart.Tooltip textStyle={{ color: 'white' }} cursorGutter={80} />
                  </LineChart.CursorCrosshair>
                </LineChart>
              </LineChart.Provider>
            ) : (
              <CandlestickChart.Provider key={`candle-${activeTimeframe}`} data={visibleCandleData}>
                <CandlestickChart width={SCREEN_WIDTH} height={350}>
                  <CandlestickChart.Candles positiveColor={COLORS.green} negativeColor={COLORS.red} />
                  <CandlestickChart.Crosshair color={COLORS.textGray}>
                    <CandlestickChart.Tooltip textStyle={{ color: 'white' }} />
                  </CandlestickChart.Crosshair>
                </CandlestickChart>
              </CandlestickChart.Provider>
            )}

            {/* Custom Overlay: Position Entry Line */}
            {chartType === 'candle' && visibleCandleData.length > 0 && positions.filter(p => p?.symbol?.toUpperCase() === symbol?.toUpperCase()).map(pos => {
              let visibleHigh = -Infinity;
              let visibleLow = Infinity;
              visibleCandleData.forEach(c => {
                if (c.high > visibleHigh) visibleHigh = c.high;
                if (c.low < visibleLow) visibleLow = c.low;
              });
              const diff = visibleHigh - visibleLow;
              const actualDomainMin = visibleLow - diff * 0.05;
              const actualDomainMax = visibleHigh + diff * 0.05;
              const entryPos = parseFloat(pos.entryPrice);

              if (entryPos > actualDomainMax || entryPos < actualDomainMin) return null;
              const yOffset = 350 - ((entryPos - actualDomainMin) / (actualDomainMax - actualDomainMin)) * 350;

              return (
                <View key={`line-${pos.id}`} style={{ position: 'absolute', top: yOffset, left: 0, right: 0, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, backgroundColor: 'transparent', overflow: 'hidden' }}>
                    <View style={{ height: 2, borderWidth: 1, borderColor: pos.side === 'LONG' ? COLORS.green : COLORS.red, borderStyle: 'dashed', marginRight: -2 }} />
                  </View>
                  <View style={{ backgroundColor: pos.side === 'LONG' ? COLORS.green : COLORS.red, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: '800' }}>{entryPos.toLocaleString()}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </PinchGestureHandler>

        {/* Indicators Display */}
        <View style={styles.indBar}>
          {['MA', 'EMA', 'BOLL', 'SAR', 'AVL', 'SUPER'].map(ind => (
            <Text key={ind} style={styles.indText}>{ind}</Text>
          ))}
          <View style={styles.indVDivider} />
          <Text style={styles.indTextActive}>VOL</Text>
          <Text style={styles.indText}>MA</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Trade Action Footer */}
      <View style={styles.bottomActions}>
        <View style={styles.smallActions}>
          <TouchableOpacity style={styles.smActItem}><Feather name="more-horizontal" size={20} /><Text style={styles.smActText}>Thêm</Text></TouchableOpacity>
          <TouchableOpacity style={styles.smActItem}><MaterialCommunityIcons name="google-circles-communities" size={20} /><Text style={styles.smActText}>Trung...</Text></TouchableOpacity>
          <TouchableOpacity style={styles.smActItem}><MaterialCommunityIcons name="swap-horizontal" size={20} /><Text style={styles.smActText}>Giao...</Text></TouchableOpacity>
        </View>
        
        {tradeType === 'CEX' ? (
          <>
            <TouchableOpacity
              style={[styles.bigBtn, { backgroundColor: COLORS.green }]}
              onPress={() => handleOpenOrderSheet('LONG')}
            >
              <Text style={styles.bigBtnText}>Long</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bigBtn, { backgroundColor: COLORS.red }]}
              onPress={() => handleOpenOrderSheet('SHORT')}
            >
              <Text style={styles.bigBtnText}>Short</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.bigBtn, { backgroundColor: COLORS.yellow }]}
            onPress={() => handleOpenOrderSheet('DEX')}
          >
            <Text style={[styles.bigBtnText, { color: 'black' }]}>Mua / Swap</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Order Bottom Sheet Modal */}
      <Modal visible={showQuickOrder} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowQuickOrder(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{quickOrderSide === 'LONG' ? 'Mua / Long' : 'Bán / Short'} {symbol}</Text>
              <TouchableOpacity onPress={() => setShowQuickOrder(false)}>
                <Feather name="x" size={24} color={COLORS.textBlack} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetContent}>
              <Text style={{ color: COLORS.textGray, fontSize: 13, marginBottom: 8 }}>Đòn bẩy: 20x (Tự động)</Text>

              <View style={styles.inputWrap}>
                <Text style={{ color: COLORS.textGray }}>Số lượng (BTC)</Text>
                <TextInput
                  style={styles.sheetInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputWrap, { marginTop: 15 }]}>
                <Text style={{ color: COLORS.textGray }}>Ký quỹ dự kiến</Text>
                <Text style={{ fontWeight: '700' }}>~ {((parseFloat(amount || '0') * parseFloat(price || '69000')) / 20).toFixed(2)} USDT</Text>
              </View>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: quickOrderSide === 'LONG' ? COLORS.green : COLORS.red }]}
                onPress={submitQuickOrder}
                disabled={orderConfirming}
              >
                <Text style={styles.confirmBtnText}>
                  {orderConfirming ? 'Đang gửi lệnh...' : `Xác nhận ${quickOrderSide}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10 },
  backBtn: { padding: 4 },
  headerSymbol: { marginLeft: 15, flex: 1 },
  symbolText: { fontSize: 18, fontWeight: '800', color: COLORS.textBlack, flexDirection: 'row', alignItems: 'center' },
  perpBadge: { backgroundColor: '#F5F5F5', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2, marginRight: 4 },
  perpText: { fontSize: 10, color: COLORS.textGray },
  symbolSubText: { fontSize: 11, color: COLORS.textGray },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  tabBar: { flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginTop: 15 },
  tabItem: { marginRight: 22, paddingBottom: 8 },
  tabText: { fontSize: 13, color: COLORS.textGray, fontWeight: '600' },
  activeTabText: { color: COLORS.textBlack, fontWeight: '800' },
  tabUnderline: { height: 3, backgroundColor: COLORS.yellow, width: '100%', position: 'absolute', bottom: 0, borderRadius: 2 },
  priceRow: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
  priceCol: { flex: 0.55 },
  priceLabel: { fontSize: 11, color: COLORS.textGray, marginBottom: 5 },
  mainPrice: { fontSize: 26, fontWeight: '800' },
  subPriceInfo: { fontSize: 13, marginTop: 4 },
  markPriceSub: { fontSize: 11, color: COLORS.textGray, marginTop: 6 },
  statsGrid: { flex: 0.42, gap: 5 },
  statLine: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { fontSize: 10, color: COLORS.textGray },
  statVal: { fontSize: 10, color: COLORS.textBlack, fontWeight: '600' },
  tfBar: { flexDirection: 'row', height: 44, alignItems: 'center', paddingHorizontal: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border, marginTop: 10 },
  tfText: { fontSize: 12, color: COLORS.textGray, marginRight: 20, fontWeight: '700' },
  activeTfText: { color: COLORS.textBlack, fontWeight: '800' },
  tfIcons: { flexDirection: 'row', marginLeft: 'auto', alignItems: 'center' },
  chartContainer: { height: 350, width: SCREEN_WIDTH },
  indBar: { flexDirection: 'row', paddingHorizontal: 16, gap: 15, alignItems: 'center', marginVertical: 10 },
  indText: { fontSize: 10, color: COLORS.textGray, fontWeight: '700' },
  indVDivider: { width: 1, height: 12, backgroundColor: COLORS.border },
  indTextActive: { fontSize: 10, color: COLORS.textBlack, fontWeight: '800' },
  bottomActions: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'center', backgroundColor: 'white' },
  smallActions: { flexDirection: 'row', gap: 15, marginRight: 15 },
  smActItem: { alignItems: 'center' },
  smActText: { fontSize: 10, color: COLORS.textBlack, marginTop: 4 },
  bigBtn: { flex: 1, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  bigBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
  positionMarker: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', marginHorizontal: 16, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border, marginBottom: 5 },
  posBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, minHeight: 300, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textBlack },
  sheetContent: { paddingBottom: 30 },
  inputWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#F5F5F5', borderRadius: 8, marginTop: 5 },
  sheetInput: { fontSize: 16, fontWeight: '700', color: COLORS.textBlack, textAlign: 'right', minWidth: 100 },
  confirmBtn: { marginTop: 25, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: 'white', fontSize: 16, fontWeight: '800' },
  typeToggle: {
    marginLeft: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  typeToggleActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.yellow
  },
  typeToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textGray
  },
  typeToggleTextActive: {
    color: COLORS.textBlack
  }
});

export default TradingDetailScreen;
