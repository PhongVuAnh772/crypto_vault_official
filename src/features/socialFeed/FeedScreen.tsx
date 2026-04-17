import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BASE_URL } from '../../../env.config';
import FeedItem, { FeedItemData } from './components/FeedItem';

// Skeleton component for loading state
const SkeletonItem = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonHeader}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonTextGroup}>
        <View style={styles.skeletonTextLine} />
        <View style={[styles.skeletonTextLine, { width: '40%', marginTop: 6 }]} />
      </View>
    </View>
    <View style={styles.skeletonBody} />
    <View style={[styles.skeletonBody, { width: '80%' }]} />
  </View>
);

const FeedScreen = () => {
  const navigation = useNavigation<any>();
  const [feedData, setFeedData] = useState<FeedItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Call REST API
  const fetchFeed = async (pageNum: number, isRefresh: boolean = false) => {
    try {
      const response = await fetch(`${BASE_URL}feed?page=${pageNum}&limit=10`);
      if (!response.ok) {
        console.warn(`HTTP Error: ${response.status} - Replace BASE_URL with your real endpoint.`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const newData = await response.json();

      setFeedData(prev => isRefresh ? newData : [...prev, ...newData]);
      setHasMore(newData.length === 10);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      // In case server fails or is not running, stop loader
      if (isRefresh) setFeedData([]);
    } finally {
      if (isRefresh) setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(1, true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchFeed(1, true);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage, false);
    }
  }, [loading, hasMore, refreshing, page]);

  const handleLike = useCallback((id: string) => {
    setFeedData(prev => prev.map(item =>
      item.id === id ? { ...item, likes: item.likes + 1 } : item
    ));
    fetch(`${BASE_URL}feed/${id}/like`, { method: 'POST' })
      .catch(console.error);
  }, []);

  const handleComment = useCallback((id: string) => {
    console.log(`Open comments for post: ${id}`);
  }, []);

  const handlePost = useCallback(() => {
    Alert.alert(
      'Tạo mới',
      'Bạn muốn làm gì?',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng bài', onPress: () => Alert.alert('Đăng bài', 'Chuyển hướng màn hình tạo bài viết') },
        { text: 'Phát trực tiếp (Live)', onPress: () => navigation.navigate('LiveBroadcastScreen') }
      ]
    );
  }, [navigation]);

  const handleLivePress = useCallback((id: string, name: string, views: number, avatar: string, likes: number, title: string) => {
    navigation.navigate('LiveViewerScreen', {
      roomId: id,
      hostName: name,
      viewers: views,
      hostAvatar: avatar,
      likes: likes,
      title: title
    });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: FeedItemData }) => (
    <FeedItem
      item={item}
      onLike={handleLike}
      onComment={handleComment}
      onLivePress={handleLivePress}
    />
  ), [handleLike, handleComment, handleLivePress]);

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <Text style={[styles.navItem, styles.navActive]}>Khám phá</Text>
        <Text style={styles.navItem}>Đang theo dõi</Text>
        <Text style={styles.navItem}>Chiến dịch</Text>
        <Text style={styles.navItem}>Live</Text>
      </View>

      <FlatList
        data={feedData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FCD535"
            colors={['#FCD535']}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#FCD535" />
            </View>
          ) : null
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handlePost}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E11', // Binance pure dark background
  },
  topNav: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2B3139',
    backgroundColor: '#1E2329',
  },
  navItem: {
    color: '#848E9C',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 20,
  },
  navActive: {
    color: '#EAECEF',
    borderBottomWidth: 2,
    borderBottomColor: '#FCD535', // Binance Yellow
    paddingBottom: 4,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  skeletonContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2B3139',
    backgroundColor: '#1E2329',
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2B3139',
    marginRight: 12,
  },
  skeletonTextGroup: {
    flex: 1,
  },
  skeletonTextLine: {
    height: 12,
    backgroundColor: '#2B3139',
    borderRadius: 6,
    width: '70%',
  },
  skeletonBody: {
    height: 14,
    backgroundColor: '#2B3139',
    borderRadius: 6,
    width: '100%',
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30, // Adjust according to tab bar
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FCD535', // Binance yellow
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    fontWeight: '400',
    color: '#0B0E11', // Dark text
    marginTop: -2,
  },
});
