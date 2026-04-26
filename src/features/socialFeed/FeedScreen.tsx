import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FeedItem, { FeedItemData } from './components/FeedItem';
import FeedListHeader from './components/FeedListHeader';
import { useFeedData } from './hooks/useFeedData';

const FeedScreen = () => {
  const navigation = useNavigation<any>();
  const { feedData, refreshing, hasMore, onRefresh, loadMore, handleLike } = useFeedData();

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
            />
          }
          contentContainerStyle={styles.listContent}
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
});
