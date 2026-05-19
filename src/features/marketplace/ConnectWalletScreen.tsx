import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTonAddressData } from 'src/core/redux/slice/account.selector';
import { marketplaceSession } from './services/apiClient';
import { nftService } from './services/nftService';

const ConnectWalletScreen: React.FC = () => {
  const tonWallet = useTonAddressData();
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    if (!tonWallet?.address) {
      Alert.alert('Lỗi', 'Chưa có ví TON khả dụng');
      return;
    }
    try {
      setLoading(true);
      const response = await nftService.walletLogin(tonWallet.address.trim());
      await marketplaceSession.setToken(response.token);
      Alert.alert('Thành công', `Connected: ${response.user.wallet_address}`);
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Connect wallet thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Connect Wallet</Text>
      <Text style={styles.text}>TON: {tonWallet?.address || 'Chưa có ví TON'}</Text>
      <TouchableOpacity style={styles.button} onPress={connect} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Đang kết nối...' : 'Wallet Login'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  text: { fontSize: 14, marginBottom: 20 },
  button: { backgroundColor: '#2E6EF7', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default ConnectWalletScreen;

