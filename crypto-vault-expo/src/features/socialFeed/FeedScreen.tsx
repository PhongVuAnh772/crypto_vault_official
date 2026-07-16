import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import FeedItem, { FeedItemData } from './components/FeedItem';
import FeedListHeader from './components/FeedListHeader';
import { useFeedData } from './hooks/useFeedData';

const FeedScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = React.useState('Khám phá');
  const { feedData, refreshing, hasMore, onRefresh, loadMore, handleLike } = useFeedData(activeTab);

  React.useEffect(() => {
    onRefresh();
  }, [activeTab, onRefresh]);

  const handleComment = useCallback((id: string) => {
    const post = feedData.find(p => p.id === id);
    if (post) {
      navigation.navigate('PostDetailScreen', { post });
    }
  }, [feedData, navigation]);

  const handlePost = useCallback(() => {
    navigation.navigate('CreatePostScreen');
  }, [navigation]);

  const handleLiveBroadcast = useCallback(() => {
    navigation.navigate('LiveBroadcastScreen');
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

  return (
    <LinearGradient
      colors={['#E0EAFC', '#CFDEF3', '#E0EAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={feedData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <FeedListHeader 
              onPost={handlePost} 
              onLiveBroadcast={handleLiveBroadcast}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            activeTab === 'Live' && !refreshing ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="video-off-outline" size={64} color="#848E9C" />
                <Text style={styles.emptyText}>No live streams right now</Text>
                <TouchableOpacity style={styles.goLiveBtn} onPress={handleLiveBroadcast}>
                  <Text style={styles.goLiveText}>Go Live Now</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3897f0"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color="#3897f0" />
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#848E9C',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  goLiveBtn: {
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  goLiveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
