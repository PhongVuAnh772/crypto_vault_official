import React, { memo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import TradingCard, { TradeData } from './TradingCard';

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
  tradeData?: TradeData;
  createdAt: number;
  likes: number;
  comments: number;
  views: number;
}

interface FeedItemProps {
  item: FeedItemData;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onShare?: (id: string) => void;
  onLivePress?: (id: string, name: string, views: number, avatar: string, likes: number, title: string) => void;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatTime = (timestamp: number) => {
  // Simplified time formatter
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const FeedItem: React.FC<FeedItemProps> = ({ item, onLike, onComment, onShare, onLivePress }) => {
  const [expanded, setExpanded] = useState(false);
  
  const contentToDisplay = expanded || item.content.length <= 150 
    ? item.content 
    : `${item.content.substring(0, 150)}...`;

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user.avatar || 'https://via.placeholder.com/40' }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.moreOptions}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Text Content */}
      {item.content ? (
        <View style={styles.contentWrap}>
          <Text style={styles.contentText}>
            {contentToDisplay}
            {!expanded && item.content.length > 150 && (
              <Text style={styles.seeMore} onPress={() => setExpanded(true)}> See more</Text>
            )}
          </Text>
        </View>
      ) : null}

      {/* Trading Card content */}
      {item.type === 'trade' && item.tradeData && (
        <TradingCard tradeData={item.tradeData} />
      )}

      {/* Image Grid */}
      {item.type === 'image' && item.images && item.images.length > 0 && (
        <View style={styles.imageGrid}>
          {item.images.map((img, index) => (
            <Image 
              key={`${item.id}-img-${index}`} 
              source={{ uri: img }} 
              style={item.images!.length > 1 ? styles.multiImage : styles.singleImage} 
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

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike?.(item.id)}>
          <Text style={styles.actionIcon}>👍</Text>
          <Text style={styles.actionText}>{formatNumber(item.likes)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onComment?.(item.id)}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{formatNumber(item.comments)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onShare?.(item.id)}>
          <Text style={styles.actionIcon}>🔁</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        <View style={[styles.actionBtn, styles.viewsContainer]}>
          <Text style={styles.actionIcon}>👁️</Text>
          <Text style={styles.actionText}>{formatNumber(item.views)}</Text>
        </View>
      </View>
    </View>
  );
};

export default memo(FeedItem);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#2B3139',
  },
  userName: {
    color: '#121212',
    fontSize: 15,
    fontWeight: '600',
  },
  time: {
    color: '#848E9C',
    fontSize: 12,
    marginTop: 2,
  },
  moreOptions: {
    color: '#848E9C',
    fontSize: 16,
  },
  contentWrap: {
    marginBottom: 12,
  },
  contentText: {
    color: '#121212',
    fontSize: 14,
    lineHeight: 20,
  },
  seeMore: {
    color: '#FCD535',
    fontWeight: '500',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  singleImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  multiImage: {
    width: '48%',
    height: 150,
    borderRadius: 8,
  },
  liveContainer: {
    position: 'relative',
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  liveThumbnail: {
    width: '100%',
    height: 220,
    borderRadius: 8,
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F6465D', // Red live dot
    marginRight: 4,
  },
  liveText: {
    color: '#EAECEF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewerBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewerText: {
    color: '#EAECEF',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionText: {
    color: '#848E9C',
    fontSize: 13,
  },
  viewsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
