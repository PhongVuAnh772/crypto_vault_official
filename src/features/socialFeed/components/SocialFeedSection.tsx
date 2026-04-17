import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BASE_URL } from '../../../../env.config';
import FeedItem, { FeedItemData } from './FeedItem';

interface SocialFeedSectionProps {
  limit?: number;
  title?: string;
}

const SocialFeedSection: React.FC<SocialFeedSectionProps> = ({ limit = 5, title = "Khám phá Feed" }) => {
  const navigation = useNavigation<any>();
  const [feedData, setFeedData] = useState<FeedItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const response = await fetch(`${BASE_URL}feed?page=1&limit=${limit}`);
      if (!response.ok) {
        return [];
      }
      return await response.json();
    } catch (error) {
      console.log('Feed API Error:', error);
      return [];
    }
  };


  useEffect(() => {
    fetchFeed().then(data => {
      setFeedData(data);
      setLoading(false);
    });
  }, []);

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

  if (loading) {
    return <ActivityIndicator style={{ marginVertical: 20 }} color="#FCD535" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <Text style={[styles.navItem, styles.navActive]}>Khám phá</Text>
        <Text style={styles.navItem}>Đang theo dõi</Text>
        <Text style={styles.navItem}>Chiến dịch</Text>
        <Text style={styles.navItem}>Live</Text>
      </View>

      {feedData.map(item => (
        <FeedItem
          key={item.id}
          item={item}
          onLivePress={handleLivePress}
        />
      ))}

      <TouchableOpacity
        style={styles.bottomBtn}
        onPress={() => navigation.navigate('FeedScreen')}
      >
        <Text style={styles.bottomBtnText}>Xem thêm trên Social Feed</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SocialFeedSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  topNav: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  navItem: {
    color: '#848E9C',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 16,
  },
  navActive: {
    color: '#121212',
    borderBottomWidth: 2,
    borderBottomColor: '#FCD535',
    paddingBottom: 4,
  },
  seeAll: {
    color: '#FCD535',
    fontSize: 14,
  },
  bottomBtn: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  bottomBtnText: {
    color: '#848E9C',
    fontSize: 14,
  }
});
