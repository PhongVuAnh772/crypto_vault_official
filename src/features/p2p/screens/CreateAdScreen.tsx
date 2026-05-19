import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import { p2pApi } from '../services/p2pApi';

type Props = { token: string };

const CreateAdScreen: React.FC<Props> = ({ token }) => {
  const [walletAssetId, setWalletAssetId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [price, setPrice] = useState('26000');
  const [minFiat, setMinFiat] = useState('100000');
  const [maxFiat, setMaxFiat] = useState('1000000');
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    const res = await p2pApi.createAd(token, {
      walletAssetId,
      paymentMethodId: paymentMethodId || undefined,
      assetCode: 'USDT',
      networkCode: 'TON',
      fiatCode: 'VND',
      price,
      minFiatAmount: minFiat,
      maxFiatAmount: maxFiat,
      totalAssetAmount: amount,
    });
    setLoading(false);
    if (!res.ok) return Alert.alert('Create ad failed', res.error);
    Alert.alert('Success', `Ad ${res.data.id} created`);
  };

  return (
    <ScreenWrapper enableHeader headerTitle="Create P2P Ad">
      <View style={styles.container}>
        <TextInput placeholder="Wallet Asset UUID" style={styles.input} value={walletAssetId} onChangeText={setWalletAssetId} />
        <TextInput placeholder="Payment Method UUID" style={styles.input} value={paymentMethodId} onChangeText={setPaymentMethodId} />
        <TextInput placeholder="Price (VND)" style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
        <TextInput placeholder="Min VND" style={styles.input} value={minFiat} onChangeText={setMinFiat} keyboardType="decimal-pad" />
        <TextInput placeholder="Max VND" style={styles.input} value={maxFiat} onChangeText={setMaxFiat} keyboardType="decimal-pad" />
        <TextInput placeholder="Total USDT" style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <Pressable style={[styles.button, loading && styles.disabled]} onPress={submit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Ad'}</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  button: { backgroundColor: '#1F6BFF', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  disabled: { opacity: 0.6 },
});

export default CreateAdScreen;
