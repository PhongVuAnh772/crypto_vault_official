import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTonAddressData } from 'src/core/redux/slice/account.selector';
import { useSelector } from 'react-redux';
import { getIsTestnet } from 'src/core/redux/slice/app.selector';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { auctionService } from './services/auctionService';
import { MarketplaceNft } from './services/nftService';
import { tonConnectMarketplaceService } from './services/tonConnectService';
import { auctionUtils } from './utils/auction';

const CreateAuctionScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const wallet = useTonAddressData();
  const isTestnet = useSelector(getIsTestnet);
  const nft = route.params?.nft as MarketplaceNft;
  const [startPrice, setStartPrice] = useState('1');
  const [minStep, setMinStep] = useState('0.1');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!nft?.nft_address) return Alert.alert('Lỗi', 'NFT chưa có nft_address');
    if (!wallet?.address) return Alert.alert('Lỗi', 'Không có ví TON');
    if (wallet.address.trim() !== (nft.owner_address || '').trim()) {
      return Alert.alert('Lỗi', 'NFT không thuộc owner hiện tại');
    }
    const validate = auctionUtils.validateCreateAuctionInput({
      startPrice,
      minStep,
      endTime,
    });
    if (!validate.ok) return Alert.alert('Lỗi', validate.message);

    try {
      setLoading(true);
      const deployCall = await tonConnectMarketplaceService.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [{ address: wallet.address, amount: '1' }],
      });

      const created = await auctionService.createAuction({
        nft_address: nft.nft_address,
        seller_address: wallet.address,
        start_price: validate.startPrice,
        min_bid_step: validate.minBidStep,
        end_time: validate.endTime,
        status: 'pending',
        tx_hash: typeof deployCall === 'string' ? deployCall : (deployCall as any)?.txHash || null,
      });
      navigation.navigate(HomeStackScreenKey.AuctionDetailScreen, { auctionId: created.id });
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Create auction thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Auction</Text>
        <Text style={styles.subTitle}>{isTestnet ? 'TON Testnet' : 'TON Mainnet'}</Text>

        <View style={styles.nftCard}>
          <Text style={styles.nftName}>{nft?.name || 'Unnamed NFT'}</Text>
          <Text style={styles.nftAddress} numberOfLines={1}>
            {nft?.nft_address || '--'}
          </Text>
        </View>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            value={startPrice}
            onChangeText={setStartPrice}
            keyboardType="decimal-pad"
            placeholder="Start price (TON)"
            placeholderTextColor="#6B7280"
          />
          <TextInput
            style={styles.input}
            value={minStep}
            onChangeText={setMinStep}
            keyboardType="decimal-pad"
            placeholder="Minimum bid step (TON)"
            placeholderTextColor="#6B7280"
          />
          <TextInput
            style={styles.input}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="End time ISO (2026-05-20T12:00:00Z)"
            placeholderTextColor="#6B7280"
          />
        </View>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Auction</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1220' },
  container: { flex: 1, paddingHorizontal: 16 },
  content: { paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#F9FAFB', marginTop: 10 },
  subTitle: { color: '#93C5FD', marginBottom: 12 },
  nftCard: { borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 12, backgroundColor: '#111827', marginBottom: 12 },
  nftName: { color: '#F9FAFB', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  nftAddress: { color: '#9CA3AF', fontSize: 12 },
  formCard: { borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 12, backgroundColor: '#111827' },
  input: { borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 12, marginBottom: 10, color: '#F9FAFB', backgroundColor: '#0F172A' },
  button: { marginTop: 12, backgroundColor: '#2563EB', borderRadius: 10, padding: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default CreateAuctionScreen;
