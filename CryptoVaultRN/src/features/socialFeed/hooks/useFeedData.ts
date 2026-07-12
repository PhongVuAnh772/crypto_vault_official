import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../../env.config';
import { FeedItemData } from '../components/FeedItem';

const CACHE_KEY = '@feed_cache';

export const useFeedData = (selectedTab: string = 'Khám phá') => {
  const [feedData, setFeedData] = useState<FeedItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    try {
      const typeParam = selectedTab !== 'Khám phá' ? `&type=${selectedTab}` : '';
      const response = await fetch(`${BASE_URL}feed?page=${pageNum}&limit=20${typeParam}`);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const newData = await response.json();

      setFeedData(prev => isRefresh ? newData : [...prev, ...newData]);
      setHasMore(newData.length === 20);

      if (pageNum === 1) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newData));
      }
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      if (pageNum === 1) {
        try {
          const cached = await AsyncStorage.getItem(CACHE_KEY);
          if (cached) setFeedData(JSON.parse(cached));
          else if (isRefresh) setFeedData([]);
        } catch (e) {
          if (isRefresh) setFeedData([]);
        }
      } else {
        setHasMore(false);
      }
    } finally {
      if (isRefresh) setRefreshing(false);
      setLoading(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    fetchFeed(1, true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchFeed(1, true);
  }, [fetchFeed]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage, false);
    }
  }, [loading, hasMore, refreshing, page, fetchFeed]);

  const handleLike = useCallback((id: string) => {
    setFeedData(prev => prev.map(item =>
      item.id === id ? { ...item, likes: item.likes + 1 } : item
    ));
  }, []);

  return {
    feedData,
    loading,
    refreshing,
    hasMore,
    onRefresh,
    loadMore,
    handleLike
  };
};
