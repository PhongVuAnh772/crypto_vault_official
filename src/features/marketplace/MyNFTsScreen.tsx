import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTonAddressData } from 'src/core/redux/slice/account.selector';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { MarketplaceNft, nftService } from './services/nftService';

const MyNFTsScreen: React.FC = () => {
  const tonWallet = useTonAddressData();
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<MarketplaceNft[]>([]);

  const load = useCallback(async () => {
    if (!tonWallet?.address) return;
    const data = await nftService.getMyNfts(tonWallet.address);
    setItems(data);
  }, [tonWallet?.address]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My NFTs</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate(HomeStackScreenKey.NFTDetailScreen, { nft: item })}
          >
            <Image source={{ uri: item.image_url || 'https://via.placeholder.com/120' }} style={styles.image} />
            <Text style={styles.name}>{item.name || 'Unnamed NFT'}</Text>
            <Text style={styles.meta}>{item.status || 'pending'}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  item: { marginBottom: 12, borderWidth: 1, borderColor: '#ececec', borderRadius: 8, padding: 10 },
  image: { width: '100%', height: 170, borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#6b7280', marginTop: 4 },
});

export default MyNFTsScreen;

