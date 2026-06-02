import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTonAddressData } from 'src/core/redux/slice/account.selector';
import { useSelector } from 'react-redux';
import { getIsTestnet } from 'src/core/redux/slice/app.selector';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { auctionService, Auction } from './services/auctionService';
import { tonConnectMarketplaceService } from './services/tonConnectService';
import { auctionUtils } from './utils/auction';

const AuctionDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const wallet = useTonAddressData();
  const isTestnet = useSelector(getIsTestnet);
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [finalizeLoading, setFinalizeLoading] = useState(false);
  const auctionId = route.params?.auctionId as string | undefined;

  const load = useCallback(async () => {
    if (auctionId) {
      const detail = await auctionService.getAuctionDetail(auctionId);
      setAuction(detail);
      return;
    }
    const list = await auctionService.getAuctions();
    setAuction(list[0] || null);
  }, [auctionId]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  const onBid = async () => {
    if (!auction || !wallet?.address) return;
    const validate = auctionUtils.validateBidAmount(auction, bidAmount);
    if (!validate.ok) return Alert.alert('Lỗi', validate.message);

    try {
      setBidLoading(true);
      const signed = await tonConnectMarketplaceService.bidAuction({
        auctionContractAddress: auction.auction_contract_address || auction.seller_address,
        amountTon: validate.amount,
      });
      await auctionService.bid({
        auction_id: auction.id,
        bidder_address: wallet.address,
        amount: validate.amount,
        tx_hash: typeof signed === 'string' ? signed : (signed as any)?.txHash,
      });
      setBidAmount('');
      await load();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Bid thất bại');
    } finally {
      setBidLoading(false);
    }
  };

  const onFinalize = async () => {
    if (!auction) return;
    const { isExpired } = auctionUtils.getAuctionMetrics(auction);
    if (!isExpired) return Alert.alert('Lỗi', 'Chưa tới end_time');
    try {
      setFinalizeLoading(true);
      const signed = await tonConnectMarketplaceService.finalizeAuction({
        auctionContractAddress: auction.auction_contract_address || auction.seller_address,
      });
      await auctionService.patchAuction(auction.id, {
        status: 'finished',
        tx_hash: typeof signed === 'string' ? signed : (signed as any)?.txHash,
      });
      await load();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Finalize thất bại');
    } finally {
      setFinalizeLoading(false);
    }
  };

  if (!auction) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Không có auction</Text>
        </View>
      </SafeAreaView>
    );
  }

  const metrics = auctionUtils.getAuctionMetrics(auction);
  const minBidHint = Number.isFinite(metrics.minBidAmount) ? metrics.minBidAmount : 0;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Auction Detail</Text>
        <Text style={styles.subTitle}>{isTestnet ? 'TON Testnet' : 'TON Mainnet'}</Text>

        <View style={styles.infoCard}>
          <Row label="Seller" value={auction.seller_address} mono />
          <Row label="Current" value={`${auction.current_price || 0} TON`} />
          <Row label="Current bidder" value={auction.current_bidder || '--'} mono />
          <Row label="End time" value={auctionUtils.formatDateTime(auction.end_time)} />
          <Row label="Min bid now" value={`${minBidHint} TON`} />
          <Row label="Status" value={auction.status} status />
        </View>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            value={bidAmount}
            onChangeText={setBidAmount}
            placeholder={`Bid amount (>= ${minBidHint} TON)`}
            placeholderTextColor="#6B7280"
            keyboardType="decimal-pad"
            editable={!metrics.isExpired && !bidLoading}
          />
          <TouchableOpacity style={[styles.button, (metrics.isExpired || bidLoading) && styles.buttonDisabled]} onPress={onBid} disabled={metrics.isExpired || bidLoading}>
            {bidLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Place Bid</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, (!metrics.isExpired || finalizeLoading) && styles.buttonDisabled]} onPress={onFinalize} disabled={!metrics.isExpired || finalizeLoading}>
          {finalizeLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Finalize Auction</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate(HomeStackScreenKey.BidHistoryScreen, { auctionId: auction.id })}>
          <Text style={styles.btnText}>Bid History</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean; status?: boolean }> = ({ label, value, mono, status }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text numberOfLines={1} style={[styles.infoValue, mono && styles.mono, status && styles.statusText]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1220' },
  container: { flex: 1, paddingHorizontal: 16 },
  content: { paddingBottom: 20 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#E5E7EB' },
  title: { fontSize: 24, fontWeight: '700', color: '#F9FAFB', marginTop: 10 },
  subTitle: { color: '#93C5FD', marginBottom: 12 },
  infoCard: { borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 12, backgroundColor: '#111827', marginBottom: 12 },
  infoRow: { marginBottom: 8 },
  infoLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 2 },
  infoValue: { color: '#F9FAFB', fontSize: 14, fontWeight: '600' },
  mono: { fontFamily: 'monospace' },
  statusText: { color: '#93C5FD' },
  formCard: { borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 12, backgroundColor: '#111827', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 12, color: '#F9FAFB', backgroundColor: '#0F172A', marginBottom: 10 },
  button: { backgroundColor: '#2563EB', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 10 },
  buttonDisabled: { opacity: 0.65 },
  secondaryButton: { backgroundColor: '#334155', borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
});

export default AuctionDetailScreen;
