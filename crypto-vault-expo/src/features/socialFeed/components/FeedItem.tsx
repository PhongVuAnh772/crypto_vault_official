import React, { memo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Share } from 'react-native';
import TradingCard, { TradeData } from './TradingCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from 'src/core/redux/hooks';
import { useNavigation } from '@react-navigation/native';
import { HomeStackScreenKey, NavigationStackKey, AuthStackScreenKey } from 'src/navigation/enum/NavigationKey';

export interface FeedItemData {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  type: 'text' | 'image' | 'trade' | 'news' | 'live';
  content: string;
  images?: string[];
  location?: {
    name: string;
    address?: string;
  };
  tradeData?: TradeData;
  createdAt: number;
  likes: number;
  comments: number;
  views: number;
  isLiked?: boolean;
}

interface FeedItemProps {
  item: FeedItemData;
  onLike?: (id: string, isLiked: boolean) => void;
  onComment?: (id: string, content: string) => void;
  onShare?: (id: string) => void;
  onLivePress?: (id: string, name: string, views: number, avatar: string, likes: number, title: string) => void;
  isDetail?: boolean;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const FeedItem: React.FC<FeedItemProps> = ({ item, onLike, onComment, onShare, onLivePress, isDetail }) => {
  const [expanded, setExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(item.isLiked || false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const { isLoggedIn } = useAppSelector(state => state.auth);
  const navigation = useNavigation<any>();

  const handleProfilePress = () => {
    navigation.navigate(HomeStackScreenKey.SocialProfileScreen, { userId: item.user.id });
  };

  const handleLike = () => {
    if (!isLoggedIn) {
      navigation.navigate(NavigationStackKey.AuthStack, {
        screen: AuthStackScreenKey.SocialAuthScreen
      });
      return;
    }
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
    onLike?.(item.id, newLikedState);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this post from ${item.user.name}: ${item.content || 'Live stream'}`,
      });
      onShare?.(item.id);
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleBookmark = () => {
    if (!isLoggedIn) {
      navigation.navigate(NavigationStackKey.AuthStack, {
        screen: AuthStackScreenKey.SocialAuthScreen
      });
      return;
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      onComment?.(item.id, commentText);
      setCommentText('');
      setShowCommentInput(false);
    }
  };

  const contentToDisplay = expanded || item.content.length <= 120 
    ? item.content 
    : `${item.content.substring(0, 120)}...`;

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} onPress={handleProfilePress}>
          <Image source={{ uri: item.user.avatar || 'https://i.pravatar.cc/150?u=' + item.user.id }} style={styles.avatar} />
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.user.name}</Text>
              {item.location && (
                <View style={styles.locationContainer}>
                  <Text style={styles.atText}> đang ở </Text>
                  <Text style={styles.locationName}>{item.location.name}</Text>
                </View>
              )}
              <MaterialCommunityIcons name="check-decagram" size={16} color="#3897f0" style={styles.verifiedIcon} />
            </View>
            <Text style={styles.time}>Posted {formatTime(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreBtn}>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#121212" />
        </TouchableOpacity>
      </View>

      {/* Text Content */}
      {item.content ? (
        <View style={styles.contentWrap}>
          <Text style={styles.contentText}>
            {contentToDisplay}
            {!expanded && item.content.length > 120 && (
              <Text style={styles.seeMore} onPress={() => setExpanded(true)}> ...more</Text>
            )}
          </Text>
        </View>
      ) : null}

      {/* Trading Card content */}
      {item.type === 'trade' && item.tradeData && (
        <TradingCard tradeData={item.tradeData} />
      )}

      {/* Image Grid */}
      {(item.type === 'image' || item.type === 'news') && item.images && item.images.length > 0 && (
        <View style={styles.imageGrid}>
          {item.images.map((img, index) => (
            <Image 
              key={`${item.id}-img-${index}`} 
              source={{ uri: img }} 
              style={item.images!.length > 1 ? styles.multiImage : styles.singleImage} 
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {/* Livestream Card */}
      {item.type === 'live' && item.images && item.images.length > 0 && (
        <TouchableOpacity 
          style={styles.liveContainer} 
          activeOpacity={0.8}
          onPress={() => onLivePress?.(item.id, item.user.name, item.views, item.user.avatar, item.likes, item.content)}
        >
          <Image source={{ uri: item.images[0] }} style={styles.liveThumbnail} />
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <View style={styles.viewerBadge}>
            <Text style={styles.viewerText}>👁️ {formatNumber(item.views)} viewers</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Action Buttons Row */}
      <View style={styles.footer}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.pillAction} onPress={handleLike}>
            <MaterialCommunityIcons 
              name={isLiked ? "thumb-up" : "thumb-up-outline"} 
              size={18} 
              color={isLiked ? "#3897f0" : "#121212"} 
            />
            <Text style={styles.pillText}>{formatNumber(likeCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pillAction} onPress={() => {
            if (!isDetail) {
              navigation.navigate('PostDetailScreen', { post: item });
            }
          }}>
            <MaterialCommunityIcons name="comment-outline" size={17} color="#121212" />
            <Text style={styles.pillText}>{formatNumber(item.comments)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.pillAction} onPress={handleShare}>
            <MaterialCommunityIcons name="repeat" size={19} color="#121212" />
            <Text style={styles.pillText}>{formatNumber(item.views / 100)}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.bookmarkBtn} onPress={handleBookmark}>
          <MaterialCommunityIcons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={22} 
            color={isBookmarked ? "#FCD535" : "#121212"} 
          />
        </TouchableOpacity>
      </View>

      {/* Inline Comment Input */}
      {showCommentInput && !isDetail && (
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor="#848E9C"
            value={commentText}
            onChangeText={setCommentText}
            onSubmitEditing={handleCommentSubmit}
          />
          <TouchableOpacity onPress={handleCommentSubmit} disabled={!isLoggedIn}>
             <MaterialCommunityIcons name="send" size={22} color={commentText.trim() ? "#3897f0" : "#848E9C"} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default memo(FeedItem);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 32,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#F2F2F7',
  },
  userName: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  time: {
    color: '#848E9C',
    fontSize: 12,
    marginTop: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  atText: {
    color: '#65676B',
    fontSize: 14,
  },
  locationName: {
    color: '#121212',
    fontSize: 14,
    fontWeight: 'bold',
  },
  moreBtn: {
    padding: 4,
  },
  contentWrap: {
    marginBottom: 16,
  },
  contentText: {
    color: '#121212',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  seeMore: {
    color: '#121212',
    fontWeight: 'bold',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  singleImage: {
    width: '100%',
    height: 300,
    borderRadius: 24,
  },
  multiImage: {
    width: '48%',
    height: 180,
    borderRadius: 16,
  },
  liveContainer: {
    position: 'relative',
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 8,
  },
  liveThumbnail: {
    width: '100%',
    height: 240,
    borderRadius: 24,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#F6465D',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  viewerBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  viewerText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    justifyContent: 'center',
  },
  pillText: {
    color: '#121212',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  bookmarkBtn: {
    backgroundColor: '#F2F2F7',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 12,
    marginTop: 16,
    height: 44,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: '#121212',
    paddingVertical: 0,
  }
});
