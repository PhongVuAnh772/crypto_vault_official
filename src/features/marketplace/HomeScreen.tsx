import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>TON NFT Marketplace</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(HomeStackScreenKey.ConnectWalletScreen)}>
        <Text style={styles.buttonText}>Connect Wallet</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(HomeStackScreenKey.CreateNFTScreen)}>
        <Text style={styles.buttonText}>Create NFT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(HomeStackScreenKey.MyNFTsScreen)}>
        <Text style={styles.buttonText}>My NFTs</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(HomeStackScreenKey.AuctionDetailScreen)}>
        <Text style={styles.buttonText}>Auctions</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  button: { backgroundColor: '#111827', padding: 14, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default HomeScreen;

