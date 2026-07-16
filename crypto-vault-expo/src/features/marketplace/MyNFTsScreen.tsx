import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { useCurrentWallet, useProtocolSelected, useTonAddressData } from 'src/core/redux/slice/account.selector';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { MarketplaceNft, nftService } from './services/nftService';
import MoralisService from 'src/core/services/Moralis';
import { convertChainByProtocol } from 'src/core/utils/evmUtils';
import VMType from 'src/core/enum/VMType';

// Helper to resolve IPFS links to gateway URLs
const resolveIpfs = (url?: string | null) => {
  if (!url) return 'https://via.placeholder.com/150';
  if (url.startsWith('ipfs://')) {
    // Convert ipfs://... to a public gateway link
    return url.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
  }
  if (url.startsWith('https://ipfs.moralis.io:2053/ipfs/')) {
    return url.replace('https://ipfs.moralis.io:2053/ipfs/', 'https://cloudflare-ipfs.com/ipfs/');
  }
  return url;
};

const parseMoralisMetadata = (metadata: unknown) => {
  if (!metadata) return {};
  if (typeof metadata === 'string') {
    try {
      return JSON.parse(metadata);
    } catch (error) {
      return {};
    }
  }
  if (typeof metadata === 'object') return metadata as Record<string, any>;
  return {};
};

const MyNFTsScreen: React.FC = () => {
  const tonWallet = useTonAddressData();
  const currentWallet = useCurrentWallet();
  const currentProtocol = useProtocolSelected();
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<MarketplaceNft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(async () => {
    setLoading(true);
    let combinedNfts: MarketplaceNft[] = [];

    // 1. Fetch local/stored Ton NFTs from backend
    if (tonWallet?.address) {
      try {
        const data = await nftService.getMyNfts(tonWallet.address);
        if (data && Array.isArray(data)) {
          combinedNfts = [...combinedNfts, ...data];
        }
      } catch (err) {
        console.log('Error fetching TON NFTs from backend:', err);
      }
    }

    // 2. Fetch live blockchain NFTs from selected EVM network using Moralis API
    const isEvmProtocol = currentProtocol?.VM === VMType.EVM;
    const evmWalletAddress = isEvmProtocol ? currentWallet?.address : undefined;
    const chain = currentProtocol ? convertChainByProtocol(currentProtocol.slip0044) : undefined;

    if (evmWalletAddress && chain) {
      try {
        const moralis = new MoralisService();
        const response = await moralis.getDetailNFTsByCollection(evmWalletAddress, {
          chain,
          limit: 20,
          normalizeMetadata: true,
          media_items: true,
        });

        // Moralis API response structure check
        const moralisNfts = response?.data?.result;
        if (moralisNfts && Array.isArray(moralisNfts)) {
          const mappedMoralisNfts: MarketplaceNft[] = moralisNfts.map((nft) => {
            const nftAny = nft as any;
            const parsedMetadata = parseMoralisMetadata(nftAny.normalized_metadata || nftAny.metadata);
            const mediaUrl =
              nftAny?.media?.[0]?.media_collection?.high?.url ||
              nftAny?.media?.[0]?.media_collection?.low?.url ||
              nftAny?.media?.[0]?.original_media_url;

            return {
              id: `moralis-${nft.token_address}-${nft.token_id}`,
              nft_address: nft.token_address,
              collection_address: nft.token_address,
              owner_address: evmWalletAddress,
              name: parsedMetadata.name || nft.name || `EVM NFT #${nft.token_id}`,
              description: parsedMetadata.description || `Token ID: ${nft.token_id}`,
              image_url: resolveIpfs(mediaUrl || parsedMetadata.image || parsedMetadata.image_url || nftAny.image),
              status: nft.contract_type || 'ERC721',
            };
          });
          combinedNfts = [...combinedNfts, ...mappedMoralisNfts];
        }
      } catch (err) {
        console.log('Error fetching Moralis EVM NFTs:', err);
      }
    }

    setItems(combinedNfts);
    setLoading(false);
  }, [tonWallet?.address, currentWallet?.address, currentProtocol?.VM, currentProtocol?.slip0044]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => setLoading(false));
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative SVG curves in the background */}
      <View style={StyleSheet.absoluteFillObject}>
        <Svg height="100%" width="100%">
          <Ellipse cx="30%" cy="10%" rx="280" ry="200" fill="none" stroke="rgba(180, 249, 142, 0.04)" strokeWidth="1" />
          <Ellipse cx="30%" cy="10%" rx="200" ry="140" fill="none" stroke="rgba(180, 249, 142, 0.04)" strokeWidth="1" />
        </Svg>
      </View>

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My NFTs</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#b4f98e" />
          <Text style={styles.loadingText}>Fetching blockchain assets...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No NFTs found in your wallets.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(HomeStackScreenKey.NFTDetailScreen, { nft: item })}
            >
              <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
                style={styles.image}
              />
              <View style={styles.itemFooter}>
                <View style={styles.metaRow}>
                  <Text style={styles.name} numberOfLines={1}>{item.name || 'Unnamed NFT'}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.status || 'Active'}</Text>
                  </View>
                </View>
                {item.description ? (
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#02221A', // Brand matching rich dark green
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 14,
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#b4f98e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryButtonText: {
    color: '#02221A',
    fontWeight: '700',
    fontSize: 15,
  },
  item: {
    marginBottom: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    padding: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  itemFooter: {
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    backgroundColor: 'rgba(180, 249, 142, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(180, 249, 142, 0.25)',
  },
  badgeText: {
    color: '#b4f98e',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default MyNFTsScreen;
