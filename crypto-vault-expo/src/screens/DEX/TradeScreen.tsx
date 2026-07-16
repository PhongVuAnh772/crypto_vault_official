import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// Note: Ở App thực tế, cần import các components UI có sẵn của dự án và `useAppSelector`
import { DexApi, DexQuoteResponse } from '../../api/dex.api';

// Màn hình Giao dịch DEX Mobile
const TradeScreen = () => {
  const [tokenIn, setTokenIn] = useState('ETH');
  const [tokenOut, setTokenOut] = useState('USDT');
  const [amountIn, setAmountIn] = useState('');
  const [quote, setQuote] = useState<DexQuoteResponse | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Kỹ thuật Debounce để tránh Request 10 lần khi người dùng typing số lượng
  useEffect(() => {
    if (!amountIn || isNaN(Number(amountIn)) || Number(amountIn) <= 0) {
      setQuote(null);
      return;
    }

    const timer = setTimeout(async () => {
      fetchQuote();
    }, 500); // Đợi user dừng gõ nửa giây

    return () => clearTimeout(timer);
  }, [amountIn, tokenIn, tokenOut]);

  const fetchQuote = async () => {
    setIsQuoting(true);
    try {
      const res = await DexApi.getQuote(tokenIn, tokenOut, amountIn);
      setQuote(res);
    } catch (err) {
      console.warn("Pricing engine warning:", err);
      Alert.alert("Lỗi Định Giá", "Không lấy được thanh khoản từ Smart Contract lúc này.");
    } finally {
        setIsQuoting(false);
    }
  };

  const executeSwap = async () => {
    if (!quote) return;
    if (quote.warning === 'HIGH_DEVIATION') {
      Alert.alert(
        "CẢNH BÁO TRƯỢT GIÁ CAO 🚨", 
        "Lệnh này chênh lệch tỷ giá > 5% so với giá sàn Binance. Bạn sẽ bị thiệt rất nặng! Chắc chắn Swap?",
        [
          { text: "Bỏ qua", style: "cancel" },
          { text: "Chấp nhận Thiệt", onPress: buildPayload, style: 'destructive' }
        ]
      );
      return;
    }
    await buildPayload();
  };

  const buildPayload = async () => {
    setIsSwapping(true);
    try {
      // Gọi lên Server để cắt cục Raw Hex Transaction thay vì phải cài Ethers nặng nề lên App
      const txData = await DexApi.buildSwapTransaction({
        userAddress: "0xUserWalletAddressMock", // Ở App thật lấy từ SecureStore Keychain
        amountIn,
        tokenInSymbol: tokenIn,
        tokenOutSymbol: tokenOut,
        slippage: 2 // 2% mốc cơ bản
      });

      console.log("[DEX] Transaction Payload Sẵn Sàng Để Kí:", txData);
      
      // Lúc này Backend đã cấp Hex Array cho. 
      // Gọi logic WalletConnect hoặc react-native-ethers để push lên mạng On-chain On-the-fly.
      Alert.alert("Thành Công", "Đã bắn lệnh lên lưới Blockchain! Bạn vui lòng chờ 1-2 block.");
      setAmountIn('');
      setQuote(null);
    } catch (err) {
      Alert.alert("Lỗi Hợp Đồng", "Thao tác gửi dữ liệu không thành công.");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Giao Dịch Swap (DeFi)</Text>
      
      <View style={styles.card}>
         <Text style={styles.label}>Chi ra ({tokenIn})</Text>
         <View style={styles.inputRow}>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric"
              placeholder="0.00"
              value={amountIn}
              onChangeText={setAmountIn}
              placeholderTextColor="#64748b"
            />
            <Text style={styles.tokenTag}>{tokenIn}</Text>
         </View>
      </View>

      <View style={styles.swapIconBox}>
         <Text style={styles.swapIcon}>⇅</Text>
      </View>

      <View style={styles.card}>
         <Text style={styles.label}>Nhận về ({tokenOut})</Text>
         {isQuoting ? (
            <ActivityIndicator size="small" color="#3b82f6" style={{ alignSelf: 'flex-start', marginVertical: 10 }} />
         ) : (
            <Text style={styles.outputValue}>
              {quote ? Number(quote.expectedOutput).toFixed(4) : "0.00"}
            </Text>
         )}
      </View>

      {/* Rào Chắn Rủi Ro Trượt Giá (Slippage) */}
      {quote && (
        <View style={styles.quoteInfo}>
          <Text style={styles.infoText}>Báo giá DEX: 1 {tokenIn} = {quote.dexPrice.toFixed(2)} {tokenOut}</Text>
          <Text style={styles.infoText}>Giá Binance gốc: 1 {tokenIn} = {quote.binancePrice.toFixed(2)} {tokenOut}</Text>
          
          <View style={[styles.impactBox, quote.deviationPercent > 5 ? styles.impactBoxDanger : styles.impactBoxSafe]}>
             <Text style={quote.deviationPercent > 5 ? styles.impactTextDanger : styles.impactTextSafe}>
                Độ nén trượt giá: {quote.deviationPercent.toFixed(2)}%
             </Text>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.swapBtn, (!quote || isSwapping) && styles.btnDisabled]} 
        disabled={!quote || isSwapping} 
        onPress={executeSwap}
      >
        {isSwapping ? <ActivityIndicator color="#fff" /> : <Text style={styles.swapBtnText}>Xác nhận Swap</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  header: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 10 },
  label: { color: '#94a3b8', fontSize: 14, marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { color: '#fff', fontSize: 32, fontWeight: 'bold', flex: 1 },
  tokenTag: { color: '#fff', fontSize: 18, fontWeight: 'bold', backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  swapIconBox: { alignItems: 'center', zIndex: 10, marginVertical: -15 },
  swapIcon: { fontSize: 24, color: '#38bdf8', backgroundColor: '#0f172a', padding: 5, borderRadius: 20, overflow: 'hidden' },
  outputValue: { color: '#e2e8f0', fontSize: 32, fontWeight: 'bold' },
  quoteInfo: { marginTop: 15, marginBottom: 25, padding: 15, backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: 12 },
  infoText: { color: '#cbd5e1', fontSize: 13, marginBottom: 5 },
  impactBox: { marginTop: 10, padding: 8, borderRadius: 8 },
  impactBoxSafe: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
  impactBoxDanger: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
  impactTextSafe: { color: '#4ade80', fontWeight: 'bold', fontSize: 13 },
  impactTextDanger: { color: '#f87171', fontWeight: 'bold', fontSize: 13 },
  swapBtn: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#475569', opacity: 0.7 },
  swapBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default TradeScreen;
