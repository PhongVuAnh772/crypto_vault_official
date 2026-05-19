import { useFocusEffect, useRoute } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { auctionService, Bid } from './services/auctionService';

const BidHistoryScreen: React.FC = () => {
  const route = useRoute<any>();
  const auctionId = route.params?.auctionId as string;
  const [bids, setBids] = useState<Bid[]>([]);

  const load = useCallback(async () => {
    if (!auctionId) return;
    const data = await auctionService.getBids(auctionId);
    setBids(data);
  }, [auctionId]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bid History</Text>
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
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  item: { borderWidth: 1, borderColor: '#ececec', borderRadius: 8, padding: 12, marginBottom: 8 },
  amount: { fontWeight: '700', fontSize: 15 },
  meta: { color: '#6b7280', marginTop: 2, fontSize: 12 },
});

export default BidHistoryScreen;

