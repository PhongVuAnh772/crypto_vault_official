import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import appImages from 'src/core/constants/AppImages';
import VMType from 'src/core/enum/VMType';
import { useCurrentWallet, useProtocolSelected } from 'src/core/redux/slice/account.selector';
import MoralisService from 'src/core/services/Moralis';
import { convertChainByProtocol } from 'src/core/utils/evmUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';

const { width } = Dimensions.get('window');

type TopCollection = {
  id: string;
  name: string;
  likes: number;
  image: string;
};

const resolveIpfs = (url?: string | null) => {
  if (!url) return 'https://via.placeholder.com/300';
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
  }
  if (url.startsWith('https://ipfs.moralis.io:2053/ipfs/')) {
    return url.replace('https://ipfs.moralis.io:2053/ipfs/', 'https://cloudflare-ipfs.com/ipfs/');
  }
  return url;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const currentProtocol = useProtocolSelected();
  const currentWallet = useCurrentWallet();
  const [topCollections, setTopCollections] = useState<TopCollection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [headerTitle, setHeaderTitle] = useState('Hey');
  const [headerSubTitle, setHeaderSubTitle] = useState('Loading market data...');

  const shortAddress = (address?: string) => {
    if (!address) return 'Guest';
    if (address.length < 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const loadTopCollections = useCallback(async () => {
    setLoadingCollections(true);
    try {
      if (currentProtocol?.VM === VMType.EVM && currentWallet?.address && currentProtocol?.slip0044) {
        const chain = convertChainByProtocol(currentProtocol.slip0044);
        if (!chain) {
          setTopCollections([]);
          return;
        }
        const moralis = new MoralisService();
        const response = await moralis.getNFTCollectionsByWallet(currentWallet.address, {
          chain,
          limit: 20,
        });

        const result = (response?.data?.result || []) as any[];
        const mapped = result.map((item: any, index: number) => ({
          id: item.token_address || `${item.name || 'evm-collection'}-${index}`,
          name: item.name || item.symbol || 'Unknown Collection',
          likes: Number(item.token_count || 0),
          image: resolveIpfs(
            item.collection_logo || item.collection_banner_image || item.normalized_metadata?.image,
          ),
        }));
        setTopCollections(mapped);
        const totalItems = mapped.reduce((sum, item) => sum + item.likes, 0);
        setHeaderTitle(`Hey ${shortAddress(currentWallet.address)}`);
        setHeaderSubTitle(`${totalItems.toLocaleString()}+ items in market`);
        return;
      }

      const top = await fetch('https://api.getgems.io/public-api/v1/collections/top?kind=day&limit=20', {
        headers: {
          accept: 'application/json',
          Authorization: '1775195839421-mainnet-10926032-r-FKgyDVTiROpQT2dzM5SSXqxXNmMkxqUsFCFtU6xBMCSgVSkr',
        },
      }).then(res => res.json());

      const items = (top?.response?.items || []) as any[];
      const mapped = items.map((item: any, index: number) => ({
        id: item.collection?.address || `ton-collection-${index}`,
        name: item.collection?.name || 'Unknown Collection',
        likes: Number(item.collection?.itemsCount || 0),
        image: item.collection?.image || 'https://via.placeholder.com/300',
      }));
      setTopCollections(mapped);
      const totalItems = mapped.reduce((sum, item) => sum + item.likes, 0);
      setHeaderTitle(`Hey ${shortAddress(currentWallet?.address)}`);
      setHeaderSubTitle(`${totalItems.toLocaleString()}+ items in market`);
    } catch (error) {
      console.log('Error loading marketplace collections:', error);
      setTopCollections([]);
      setHeaderTitle(`Hey ${shortAddress(currentWallet?.address)}`);
      setHeaderSubTitle('Unable to load market data');
    } finally {
      setLoadingCollections(false);
    }
  }, [currentProtocol?.VM, currentProtocol?.slip0044, currentWallet?.address]);

  useFocusEffect(
    useCallback(() => {
      loadTopCollections().catch(() => setLoadingCollections(false));
    }, [loadTopCollections]),
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Background concentric arch lines & sparkles */}
      <View style={StyleSheet.absoluteFillObject}>
        <Svg height="100%" width="100%">
          <Ellipse cx="70%" cy="12%" rx="320" ry="240" fill="none" stroke="rgba(180, 249, 142, 0.05)" strokeWidth="1" />
          <Ellipse cx="70%" cy="12%" rx="250" ry="180" fill="none" stroke="rgba(180, 249, 142, 0.05)" strokeWidth="1" />
          <Ellipse cx="70%" cy="12%" rx="180" ry="120" fill="none" stroke="rgba(180, 249, 142, 0.05)" strokeWidth="1" />
        </Svg>
        
        {/* Top-Right Sparkle */}
        <View style={styles.sparkle1Container}>
          <Svg height="18" width="18" viewBox="0 0 24 24">
            <Path d="M12,0 C12,6 18,12 24,12 C18,12 12,18 12,24 C12,18 6,12 0,12 C6,12 12,6 12,0 Z" fill="#b4f98e" />
          </Svg>
        </View>

        {/* Lower-Left Sparkle */}
        <View style={styles.sparkle2Container}>
          <Svg height="10" width="10" viewBox="0 0 24 24">
            <Path d="M12,0 C12,6 18,12 24,12 C18,12 12,18 12,24 C12,18 6,12 0,12 C6,12 12,6 12,0 Z" fill="rgba(180, 249, 142, 0.7)" />
          </Svg>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Top Bar Section */}
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.heroTitle}>{headerTitle}</Text>
            <Text style={styles.heroSubTitle}>{headerSubTitle}</Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }}
            style={styles.avatar}
          />
        </View>

        {/* Category Preview Row with Left & Right Off-screen hints */}
        <View style={styles.previewRow}>
          {/* Left Ghost Card */}
          <View style={[styles.previewCard, styles.previewCardLeft]}>
            <Image source={appImages.blueLiquidWave} style={styles.previewCardImage} />
          </View>

          {/* Center Main Category Card */}
          <View style={styles.previewCardMain}>
            <Image
              source={appImages.kintsugiBust}
              style={styles.previewImage}
            />
            <View style={styles.previewLabelContainer}>
              <Text style={styles.previewLabel}>Art</Text>
            </View>
          </View>

          {/* Right Ghost Card */}
          <View style={[styles.previewCard, styles.previewCardRight]}>
            <Image source={appImages.waterCaustics} style={styles.previewCardImage} />
          </View>
        </View>

        {/* Top Collections Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top collections</Text>
        </View>

        {/* Top Collections Horizontal List */}
        {loadingCollections ? (
          <View style={styles.collectionLoadingWrap}>
            <ActivityIndicator size="small" color="#b4f98e" />
          </View>
        ) : (
          <FlatList
            horizontal
            data={topCollections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.collectionCard}>
                <Image source={{ uri: item.image }} style={styles.collectionImage} />
                <View style={styles.collectionFooter}>
                  <Text numberOfLines={1} style={styles.collectionName}>{item.name}</Text>
                  <Text style={styles.collectionLike}>♡ {item.likes.toLocaleString()}</Text>
                </View>
              </View>
            )}
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.collectionScroll}
            decelerationRate="fast"
            snapToInterval={170}
            snapToAlignment="start"
            disableIntervalMomentum
          />
        )}

        {/* Featured Creator Section */}
        <View style={[styles.sectionHeader, styles.featuredHeader]}>
          <Text style={styles.sectionTitle}>Feauted Creator</Text>
          <TouchableOpacity onPress={() => navigation.navigate(HomeStackScreenKey.MyNFTsScreen)}>
            <Text style={styles.viewMore}>View More</Text>
          </TouchableOpacity>
        </View>

        {/* Creator Glass Card */}
        <View style={styles.creatorCard}>
          <View style={styles.creatorMeta}>
            <Image
              source={appImages.silverRayleigh}
              style={styles.creatorAvatar}
            />
            <View>
              <Text style={styles.creatorName}>Silver Rayleigh</Text>
              <Text style={styles.creatorSub}>1200 Follower</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Translucent Glass Bottom Tab Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navActive]} onPress={() => navigation.navigate(HomeStackScreenKey.ConnectWalletScreen)}>
          <Text style={styles.navTextActive}>H</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate(HomeStackScreenKey.CreateNFTScreen)}>
          <Text style={styles.navText}>C</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate(HomeStackScreenKey.AuctionDetailScreen)}>
          <Text style={styles.navText}>A</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate(HomeStackScreenKey.MyNFTsScreen)}>
          <Text style={styles.navText}>N</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#02221A', // Rich dark forest green matching mockup
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  // Concentric curved lines absolute positions
  sparkle1Container: {
    position: 'absolute',
    top: 50,
    right: 95,
  },
  sparkle2Container: {
    position: 'absolute',
    top: 105,
    right: 215,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroSubTitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 15,
    marginTop: 4,
    fontWeight: '400',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    marginBottom: 28,
  },
  previewCard: {
    width: 60,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    opacity: 0.6,
  },
  previewCardLeft: {
    marginRight: -10,
    transform: [{ scale: 0.82 }, { translateX: -8 }],
  },
  previewCardRight: {
    marginLeft: -10,
    transform: [{ scale: 0.82 }, { translateX: 8 }],
  },
  previewCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewCardMain: {
    flex: 1,
    height: 165,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewLabelContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  collectionScroll: {
    marginBottom: 26,
  },
  collectionLoadingWrap: {
    marginBottom: 26,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionCard: {
    width: 156,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 8,
    marginRight: 14,
  },
  collectionImage: {
    width: '100%',
    height: 115,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  collectionFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  collectionName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  collectionLike: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '500',
  },
  featuredHeader: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewMore: {
    color: '#b4f98e',
    fontSize: 16,
    fontWeight: '600',
  },
  creatorCard: {
    marginTop: 6,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  creatorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },
  creatorName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  creatorSub: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
  },
  followButton: {
    backgroundColor: '#b4f98e',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  followText: {
    color: '#02221A',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 24,
    left: 28,
    right: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(2, 34, 26, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  navItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navActive: {
    backgroundColor: '#b4f98e',
  },
  navText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#02221A',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default HomeScreen;
