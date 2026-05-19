import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { MarketplaceNft } from './services/nftService';

const NFTDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const nft = route.params?.nft as MarketplaceNft;

  if (!nft) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Không có dữ liệu NFT</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image source={{ uri: nft.image_url || 'https://via.placeholder.com/200' }} style={styles.image} />
      <Text style={styles.title}>{nft.name || 'Unnamed NFT'}</Text>
      <Text style={styles.text}>Owner: {nft.owner_address || '--'}</Text>
      <Text style={styles.text}>Collection: {nft.collection_address || '--'}</Text>
      <Text style={styles.text}>Status: {nft.status || '--'}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate(HomeStackScreenKey.CreateAuctionScreen, { nft })}
      >
        <Text style={styles.buttonText}>Create Auction</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  image: { width: '100%', height: 280, borderRadius: 10, marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  text: { marginBottom: 6, color: '#374151' },
  button: { marginTop: 20, backgroundColor: '#111827', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default NFTDetailScreen;

