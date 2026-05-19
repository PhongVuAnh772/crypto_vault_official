import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import { p2pApi } from '../services/p2pApi';
import { P2PAd } from '../shared/types';

type Props = { token: string };

const P2PMarketScreen: React.FC<Props> = ({ token }) => {
  const [ads, setAds] = React.useState<P2PAd[]>([]);
  const [assetAmount, setAssetAmount] = React.useState('10');
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await p2pApi.listAds(token, { assetCode: 'USDT', fiatCode: 'VND', limit: 30 });
    setLoading(false);
    if (!res.ok) return Alert.alert('Load ads failed', res.error);
    setAds(res.data);
  }, [token]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const createOrder = async (adId: string) => {
    const res = await p2pApi.createOrder(token, adId, assetAmount);
    if (!res.ok) return Alert.alert('Create order failed', res.error);
    Alert.alert('Order created', res.data.order_no);
  };

  return (
    <ScreenWrapper enableHeader headerTitle="P2P Market">
      <View style={styles.container}>
        <TextInput
          value={assetAmount}
          onChangeText={setAssetAmount}
          keyboardType="decimal-pad"
          style={styles.amountInput}
          placeholder="Order amount USDT"
        />
        <FlatList
          refreshing={loading}
          onRefresh={load}
          data={ads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.asset_code}/{item.fiat_code}</Text>
              <Text>Price: {item.price}</Text>
              <Text>Remaining: {item.remaining_asset_amount}</Text>
              <Pressable style={styles.button} onPress={() => createOrder(item.id)}>
                <Text style={styles.buttonText}>Buy</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No ads</Text>}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  amountInput: { borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  card: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginBottom: 10, gap: 6 },
  title: { fontWeight: '700', fontSize: 16 },
  button: { backgroundColor: '#1F6BFF', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 24, opacity: 0.6 },
});

export default P2PMarketScreen;
