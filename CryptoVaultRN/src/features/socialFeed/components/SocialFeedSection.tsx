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
import { useAppSelector } from 'src/core/redux/hooks';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationStackKey, AuthStackScreenKey } from 'src/navigation/enum/NavigationKey';

interface SocialFeedSectionProps {
  limit?: number;
  title?: string;
}

const SocialFeedSection: React.FC<SocialFeedSectionProps> = ({ limit = 5, title = "Khám phá Feed" }) => {
  const navigation = useNavigation<any>();
  const [feedData, setFeedData] = useState<FeedItemData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { isLoggedIn, user } = useAppSelector(state => state.auth);

  const fetchFeed = async () => {
    try {
      const response = await fetch(`${BASE_URL}feed?page=1&limit=${limit}`);
      if (!response.ok) {
        return [];
      }
      const payload = await response.json();
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
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

  const handleCreatePost = () => {
    if (!isLoggedIn) {
      navigation.navigate(NavigationStackKey.AuthStack, {
        screen: AuthStackScreenKey.SocialAuthScreen
      });
    } else {
      navigation.navigate('CreatePostScreen');
    }
  };

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
      {/* Post Entry Bar */}
      <View style={styles.postEntryBar}>
        <View style={styles.avatarPlaceholder}>
           <MaterialCommunityIcons name="account" size={24} color="#848E9C" />
        </View>
        <TouchableOpacity 
          style={styles.inputPlaceholder}
          onPress={handleCreatePost}
        >
          <Text style={styles.inputText} numberOfLines={1}>
            {isLoggedIn ? `Bạn đang nghĩ gì, ${user?.email?.split('@')[0]}?` : "Đăng nhập để chia sẻ cảm nghĩ..."}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCreatePost}>
           <MaterialCommunityIcons name="image-plus" size={24} color="#9E86FF" />
        </TouchableOpacity>
      </View>

      <View style={styles.topNav}>
        <Text style={[styles.navItem, styles.navActive]}>Khám phá</Text>
        <Text style={styles.navItem}>Live</Text>
        <Text style={styles.navItem}>Đang theo dõi</Text>
        <Text style={styles.navItem}>Answer</Text>
      </View>

      {feedData.map(item => (
        <FeedItem
          key={item.id}
          item={item}
          onLivePress={handleLivePress}
        />
      ))}
      {feedData.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.bottomBtnText}>Chưa có bài viết nào</Text>
        </View>
      )}

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
    backgroundColor: '#07051A',
  },
  postEntryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1E4E',
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#131435',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inputPlaceholder: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
  },
  inputText: {
    color: '#8F9BB3',
    fontSize: 14,
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
    color: '#FFFFFF',
  },
  topNav: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1E4E',
    backgroundColor: '#07051A',
    marginBottom: 8,
  },
  navItem: {
    color: '#8F9BB3',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 16,
  },
  navActive: {
    color: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#9E86FF',
    paddingBottom: 4,
  },
  seeAll: {
    color: '#9E86FF',
    fontSize: 14,
  },
  bottomBtn: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1D1E4E',
    backgroundColor: '#131435',
    alignItems: 'center',
  },
  bottomBtnText: {
    color: '#8F9BB3',
    fontSize: 14,
  },
  emptyWrap: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
