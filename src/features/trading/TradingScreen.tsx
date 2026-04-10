import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { usePriceSocket } from '../../core/hooks/usePriceSocket';
import { formatVN } from '../../core/utils/formatters';
import { HomeStackScreenKey } from '../../navigation/enum/NavigationKey';
import { CONFIG } from '../../core/constants/config';

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

const TradingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const symbol = route.params?.symbol || 'BTCUSDT';
  const market = route.params?.market || 'futures';

  const { price, priceColor } = usePriceSocket(symbol, market);

  // UI Interaction States
  const [activeTopTab, setActiveTopTab] = useState('USDⓈ-M');
  const [activeBottomTab, setActiveBottomTab] = useState('Vị thế');
  const [priceIn, setPriceIn] = useState('69206.5');
  const [amount, setAmount] = useState('0.05');
  const [activePercentage, setActivePercentage] = useState(0);
  const [isTPSLActive, setIsTPSLActive] = useState(false);
  const [orderConfirming, setOrderConfirming] = useState(false);

  // Backend Simulation States
  const [positions, setPositions] = useState<Position[]>([]);
  const [tradeType, setTradeType] = useState<'CEX' | 'DEX'>('CEX');

  useEffect(() => {
    if (price && parseFloat(priceIn) === 0) setPriceIn(parseFloat(price).toFixed(1));
  }, [price]);

  // Logic: Swap trên Uniswap (DEX)
  const handleDexSwap = async () => {
    setOrderConfirming(true);
    try {
      // Gọi backend lấy dữ liệu swap data
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/dex/swap-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountIn: amount,
          tokenIn: '0xfFf9976782d46CC05630D1f6eBaf18945f85f2b8', // WETH Sepolia
          tokenOut: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // USDT Sepolia
          slippage: 0.5
        })
      });
      const result = await response.json();
      if (result.success) {
        Alert.alert(
          'Chuẩn bị Swap Uniswap',
          `Dự kiến nhận được: ${result.data.estimatedOutput} USDT. Bạn có muốn thực hiện ký giao dịch không?`,
          [
            { text: 'Hủy', style: 'cancel' },
            { 
              text: 'Ký giao dịch', 
              onPress: () => {
                // Ở đây sẽ gọi WalletConnect để ký result.data
                Alert.alert('Thành công', 'Yêu cầu swap đã được gởi tới ví của bạn!');
              } 
            }
          ]
        );
      }
    } catch (e) {
      Alert.alert('Lỗi DEX', 'Không thể lấy báo giá từ Uniswap');
    } finally {
      setOrderConfirming(false);
    }
  };

  // Logic: Fetch and Manage Vị thế thực thụ qua Backend
  const fetchPositions = async () => {
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/positions`);
      const payload = await res.json();
      if (payload.success) setPositions(payload.data);
    } catch (e) {
      console.warn('Failed to fetch positions', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPositions();
    }, [])
  );

  const handleOrder = async (side: 'LONG' | 'SHORT') => {
    if (tradeType === 'DEX') {
      return handleDexSwap();
    }
    
    if (!price) return;
    setOrderConfirming(true);

    try {
      const btcAmount = parseFloat(amount) || 0.1;
      const currentPrice = parseFloat(price) || parseFloat(priceIn) || 69000;
      const leverage = 20;
      const marginUsdt = (btcAmount * currentPrice) / leverage;

      const payload = {
        symbol,
        side,
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
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (data.success) {
        fetchPositions(); // Cập nhật lại UI sau khi khớp lệnh trên Server
        setActiveBottomTab('Vị thế');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setPositions(data.data); // Server trả về ds mới nhất
      }
    } catch (e) {
      console.warn('Failed to close position', e);
    }
  };

  const sellOrders = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    price: (69206.7 - i * 0.1).toFixed(1),
    amount: (Math.random() * 0.1).toFixed(3),
    width: Math.random() * 80 + 10
  })), [price]);

  const buyOrders = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    price: (69205.5 - i * 0.1).toFixed(1),
    amount: (Math.random() * 0.1).toFixed(3),
    width: Math.random() * 80 + 10
  })), [price]);

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
          <Text style={[styles.changeText, { color: LIGHT_COLORS.green }]}>+3,40%</Text>
        </View>

        {/* Dashboard: Order Book (Left) + Trade Form (Right) */}
        <View style={styles.mainGrid}>
          {tradeType === 'CEX' ? (
            <>
              <View style={styles.orderBook}>
                <View style={styles.obLabels}>
                  <Text style={styles.obLabel}>Giá (USDT)</Text>
                  <Text style={styles.obLabel}>Số lượng (BTC)</Text>
                </View>
                {sellOrders.map((o, i) => (
                  <TouchableOpacity key={`s-${i}`} style={styles.obRow} onPress={() => setPriceIn(o.price)}>
                    <View style={[styles.obBar, { width: `${o.width}%`, backgroundColor: '#FDECEF' }]} />
                    <Text style={[styles.obPrice, { color: LIGHT_COLORS.red }]}>{formatVN(o.price, 1)}</Text>
                    <Text style={styles.obAmount}>{o.amount.replace('.', ',')}</Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.centerPrice}>
                  <Text style={[styles.mainLivePrice, { color: priceColor }]}>{formatVN(price || '69205.5', 1)}</Text>
                  <Text style={styles.subLivePrice}>{formatVN(price || '69206.6', 1)}</Text>
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
                <View style={styles.formTopRow}>
                  <TouchableOpacity style={styles.marginBtn}><Text style={styles.marginText}>Cross</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.marginBtn}><Text style={styles.marginText}>20x</Text></TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.orderTypeBtn}>
                  <Text style={styles.orderTypeText}>Limit</Text>
                  <Feather name="chevron-down" size={16} color={LIGHT_COLORS.textSecondary} />
                </TouchableOpacity>

                {/* Price and Amount Step Inputs */}
                <View style={[styles.inputContainer, { marginBottom: 12 }]}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setPriceIn((p) => (parseFloat(p) - 0.1).toFixed(1))}><AntDesign name="minus" size={16} color={LIGHT_COLORS.textSecondary} /></TouchableOpacity>
                  <View style={styles.inputCenter}><Text style={styles.inputHint}>Giá (USDT)</Text><TextInput style={styles.mainInput} value={priceIn.replace('.', ',')} onChangeText={(t) => setPriceIn(t.replace(',', '.'))} keyboardType="numeric" /></View>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setPriceIn((p) => (parseFloat(p) + 0.1).toFixed(1))}><AntDesign name="plus" size={16} color={LIGHT_COLORS.textSecondary} /></TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setAmount((a) => (parseFloat(a) || 0) > 0 ? (parseFloat(a) - 1).toString() : '0')}><AntDesign name="minus" size={16} color={LIGHT_COLORS.textSecondary} /></TouchableOpacity>
                  <View style={styles.inputCenter}><Text style={styles.inputHint}>Số lượng (BTC)</Text><TextInput style={styles.mainInput} value={amount} onChangeText={setAmount} keyboardType="numeric" /></View>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setAmount((a) => (parseFloat(a) || 0) >= 0 ? (parseFloat(a) + 1).toString() : '1')}><AntDesign name="plus" size={16} color={LIGHT_COLORS.textSecondary} /></TouchableOpacity>
                </View>

                {/* Percentage Selector Dots */}
                <View style={styles.dotRow}>
                  {[0, 1, 2, 3, 4].map(idx => (
                    <TouchableOpacity key={idx} style={[styles.dot, activePercentage === idx && styles.dotActive]} onPress={() => { setActivePercentage(idx); setAmount((idx * 25).toString()); }} />
                  ))}
                  <View style={styles.dotLine} />
                </View>

                <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsTPSLActive(!isTPSLActive)}>
                  <Feather name={isTPSLActive ? "check-square" : "square"} size={16} color={isTPSLActive ? LIGHT_COLORS.yellow : LIGHT_COLORS.border} />
                  <Text style={styles.checkboxText}>TP/SL</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: LIGHT_COLORS.green }]} onPress={() => handleOrder('LONG')} disabled={orderConfirming}>
                  {orderConfirming ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Mua/Long</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: LIGHT_COLORS.red, marginTop: 15 }]} onPress={() => handleOrder('SHORT')} disabled={orderConfirming}>
                  {orderConfirming ? <ActivityIndicator color="white" /> : <Text style={styles.primaryBtnText}>Bán/Short</Text>}
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
                      <Text style={styles.tokenSymbol}>ETH</Text>
                      <Feather name="chevron-down" size={16} color={LIGHT_COLORS.textBlack} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.tokenBalance}>Số dư: 1.25 ETH</Text>
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
                      value={formatVN(((parseFloat(amount) || 0) * 3500).toString(), 2)}
                      editable={false}
                      placeholderTextColor={LIGHT_COLORS.textSecondary}
                    />
                    <TouchableOpacity style={styles.tokenSelect}>
                      <View style={[styles.tokenIcon, { backgroundColor: '#26A17B' }]} />
                      <Text style={styles.tokenSymbol}>USDT</Text>
                      <Feather name="chevron-down" size={16} color={LIGHT_COLORS.textBlack} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.tokenBalance}>Số dư: 500.00 USDT</Text>
                </View>

                <TouchableOpacity 
                   style={[styles.primaryBtn, { backgroundColor: LIGHT_COLORS.yellow, marginTop: 24 }]} 
                   onPress={handleDexSwap}
                   disabled={orderConfirming}
                >
                  {orderConfirming ? <ActivityIndicator color="black" /> : <Text style={[styles.primaryBtnText, { color: 'black' }]}>Thực hiện Hoán đổi</Text>}
                </TouchableOpacity>
                
                <View style={styles.priceInfo}>
                   <Text style={styles.priceInfoText}>1 ETH = 3,500.21 USDT</Text>
                   <MaterialCommunityIcons name="gas-station" size={14} color={LIGHT_COLORS.textSecondary} />
                   <Text style={styles.priceInfoText}> $2.41</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Positions History Section */}
        <View style={styles.bottomTabs}>
          {['Vị thế', 'Lệnh chờ (0)', 'Bot'].map(tab => (
            <TouchableOpacity key={tab} style={styles.bottomTabItem} onPress={() => setActiveBottomTab(tab)}>
              <Text style={[styles.bottomTabText, activeBottomTab === tab && styles.activeBottomTabText]}>{tab}{tab === 'Vị thế' ? ` (${positions.length})` : ''}</Text>
              {activeBottomTab === tab && <View style={styles.activeTabIndicator} />}
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
                    <View style={styles.posDetailItem}><Text style={styles.detailLabel}>Quy mô (BTC)</Text><Text style={styles.detailVal}>{(pos.amount * pos.leverage).toFixed(3)}</Text></View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCircle}><View style={styles.emptyInner} /><View style={styles.emptyInnerSmall} /></View>
            <Text style={{ color: LIGHT_COLORS.textSecondary, marginTop: 10 }}>Không có vị thế hoạt động</Text>
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
  changeRow: { paddingHorizontal: 16, marginBottom: 10 },
  changeText: { fontSize: 13, fontWeight: '600' },
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
  formTopRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  marginBtn: { flex: 1, height: 30, backgroundColor: LIGHT_COLORS.surface, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  marginText: { fontSize: 12, fontWeight: '700', color: LIGHT_COLORS.textBlack },
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
    backgroundColor: '#FAF9FA',
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
