import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { auctionService, Bid } from './services/auctionService';

const BidHistoryScreen: React.FC = () => {
  const route = useRoute<any>();
  const auctionId = route.params?.auctionId as string;
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!auctionId) return;
    setLoading(true);
    try {
      const data = await auctionService.getBids(auctionId);
      const sorted = [...data].sort((a, b) => {
        const bTime = new Date(b.created_at).getTime();
        const aTime = new Date(a.created_at).getTime();
        return bTime - aTime;
      });
      setBids(sorted);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bid History</Text>
      {loading && bids.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : null}
      {!loading && bids.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.meta}>Chưa có bid nào</Text>
        </View>
      ) : null}
      <FlatList
        data={bids}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.amount}>{item.amount} TON</Text>
            <Text style={styles.meta}>{item.bidder_address}</Text>
            <Text style={styles.meta}>{item.status}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  item: { borderWidth: 1, borderColor: '#ececec', borderRadius: 8, padding: 12, marginBottom: 8 },
  amount: { fontWeight: '700', fontSize: 15 },
  meta: { color: '#6b7280', marginTop: 2, fontSize: 12 },
});

export default BidHistoryScreen;
