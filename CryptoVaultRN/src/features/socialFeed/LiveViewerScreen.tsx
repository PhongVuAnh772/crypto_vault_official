import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'src/core/redux/store';
import { BASE_URL } from '../../../env.config';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  user: string;
  text: string;
  avatar?: string;
}

const FloatingHeart = ({ onComplete }: { onComplete: () => void }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start(() => onComplete());
  }, []);


  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height * 0.4],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.2, 0.8],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [0, 15, -15, 15, -15, 0],
  });

  return (
    <Animated.View
      style={[
        styles.heartContainer,
        {
          transform: [{ translateY }, { scale }, { translateX }],
          opacity
        }
      ]}
    >
      <MaterialCommunityIcons
        name="heart"
        size={24}
        color={['#ff4d4d', '#ff3366', '#ff66b2', '#FCD535', '#4dff88'][Math.floor(Math.random() * 5)]}
      />
    </Animated.View>
  );
};

const LiveViewerScreen = ({ route, navigation }: any) => {
  const { hostName = 'Lord Busuz', roomId, hostAvatar = 'https://i.pravatar.cc/150?u=host', viewers = 0 } = route.params || {};
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewerCount, setViewerCount] = useState(viewers);
  const [hearts, setHearts] = useState<{ id: number }[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // [FRONTEND DEVELOPER] Get Auth Token from Redux
  const session = useSelector((state: RootState) => state.auth.session);
  const token = session?.access_token;

  const handleSwitchToNextLive = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}feed?type=live&limit=5`);
      const activeLives = await response.json();

      const nextLive = activeLives.find((l: any) => l.id !== roomId);

      if (nextLive) {
        navigation.replace('LiveViewerScreen', {
          roomId: nextLive.id,
          hostName: nextLive.user.name,
          viewers: nextLive.views,
          hostAvatar: nextLive.user.avatar,
          likes: nextLive.likes,
          title: nextLive.content
        });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      navigation.goBack();
    }
  }, [roomId, navigation]);
  const handleAddHeart = useCallback(() => {
    setHearts(prev => [...prev, { id: Date.now() + Math.random() }]);
  }, []);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isEnded, setIsEnded] = useState(false);

  const connectWS = useCallback(() => {
    if (isEnded) return;

    const WS_URL = BASE_URL.replace('http', 'ws').replace('/api/v1/feed', '').replace('/api/v1/', '/');
    console.log(`[WS] Connecting to ${WS_URL}...`);
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected');
      ws.send(JSON.stringify({
        type: 'join_live',
        roomId: roomId || 'global',
        token: token
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'live_chat') {
          setMessages(prev => [...prev.slice(-25), data.message]);
        } else if (data.type === 'viewer_count') {
          setViewerCount(data.count);
        } else if (data.type === 'send_reaction') {
          handleAddHeart();
        } else if (data.type === 'stream_ended') {
          setIsEnded(true);
          Alert.alert("Livestream", "Phiên live này đã kết thúc.", [
            { text: "Xem live khác", onPress: () => handleSwitchToNextLive() }
          ]);
        }
      } catch (e) {
        console.error('[WS] Data error:', e);
      }
    };

    ws.onclose = (e) => {
      console.log('[WS] Closed:', e.code, e.reason);
      // [FRONTEND DEVELOPER] Auto-reconnect after 3 seconds if not explicitly ended
      if (!isEnded) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWS();
        }, 3000);
      }
    };

    ws.onerror = (e) => {
      console.error('[WS] Error:', e);
    };
  }, [roomId, token, isEnded, handleAddHeart, handleSwitchToNextLive]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!roomId) return;
      try {
        const response = await fetch(`${BASE_URL}feed/${roomId}/comments`);
        if (response.status === 404) {
          setIsEnded(true);
          Alert.alert("Thông báo", "Phiên live này đã kết thúc.", [
            { text: "OK", onPress: () => handleSwitchToNextLive() }
          ]);
          return;
        }
        if (response.ok) {
          const history = await response.json();
          const formattedHistory = history.map((c: any) => ({
            id: c.id,
            user: c.user.name,
            text: c.content,
            avatar: c.user.avatar,
            createdAt: c.createdAt
          })).reverse();
          setMessages(formattedHistory);
        }
      } catch (e) {
        console.error('[DEBUG] Fetch error:', e);
      }
    };

    fetchHistory();
    connectWS();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'leave_live', roomId: roomId || 'global' }));
      }
      wsRef.current?.close();
    };
  }, [roomId, connectWS]);



  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const msg: Message = {
        id: Date.now().toString(),
        user: 'Me',
        text: chatMessage,
        avatar: 'https://i.pravatar.cc/150?u=me'
      };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'live_chat',
          roomId: roomId || 'global',
          message: msg,
          token: token // [SECURITY] Send token for identity verification
        }));
      }
      setChatMessage('');
    }
  };

  const handleSendReaction = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'send_reaction',
        roomId: roomId || 'global',
        token: token // [SECURITY] Send token for auth
      }));
    }
    handleAddHeart();
  };

  const renderChatItem = ({ item }: { item: Message }) => (
    <View style={styles.chatRow}>
      <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150?u=' + item.user }} style={styles.chatAvatar} />
      <View style={styles.chatContent}>
        <Text style={[styles.chatUser, { color: item.user === 'Host' || item.user === 'Lord Busuz' ? '#FCD535' : '#4dff88' }]}>{item.user}</Text>
        <Text style={styles.chatText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Real Livestream View Background (Simulated with high-quality image) */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1492619334760-466d74483783?q=80&w=1000' }}
        style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1C1C1E' }]}
        resizeMode="cover"
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.profileChip}>
              <View style={styles.avatarWrap}>
                <Image source={{ uri: hostAvatar }} style={styles.hostAvatar} />
                <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>Live</Text></View>
              </View>
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>{hostName}</Text>
                <MaterialCommunityIcons name="check-decagram" size={14} color="#3897f0" />
              </View>
            </View>
          </View>

          <View style={styles.viewerChip}>
            <MaterialCommunityIcons name="eye-outline" size={16} color="#fff" />
            <Text style={styles.viewerText}>{viewerCount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Reaction Layer */}
        <View style={styles.reactionLayer} pointerEvents="none">
          {hearts.map(heart => (
            <FloatingHeart
              key={heart.id}
              onComplete={() => setHearts(prev => prev.filter(h => h.id !== heart.id))}
            />
          ))}
        </View>

        {/* Chat List Overlay */}
        <View style={styles.chatContainer}>
          <FlatList
            data={[...messages].reverse()}
            keyExtractor={item => item.id}
            renderItem={renderChatItem}
            inverted
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatList}
          />
        </View>

        {/* Footer Actions */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.footer}>
            <View style={styles.inputBar}>
              <TextInput
                style={styles.textInput}
                placeholder="Type your comment..."
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={chatMessage}
                onChangeText={setChatMessage}
                onSubmitEditing={handleSendMessage}
              />
              <TouchableOpacity onPress={handleSendMessage}>
                <MaterialCommunityIcons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.actionIcons}>
              <TouchableOpacity style={styles.iconCircle} onPress={() => console.log('Gift pressed')}>
                <MaterialCommunityIcons name="gift-outline" size={24} color="#FCD535" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle} onPress={handleSendReaction}>
                <MaterialCommunityIcons name="heart" size={24} color="#ff4d4d" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default LiveViewerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22,
    paddingRight: 12,
    height: 44,
  },
  avatarWrap: {
    position: 'relative',
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ff4d4d',
  },
  liveBadge: {
    position: 'absolute',
    bottom: -2,
    alignSelf: 'center',
    backgroundColor: '#ff4d4d',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  hostName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  viewerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  chatContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  chatList: {
    paddingBottom: 20,
  },
  chatRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    borderRadius: 16,
    alignSelf: 'flex-start',
    maxWidth: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  chatContent: {
    flex: 1,
  },
  chatUser: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  chatText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 0 : 16,
  },
  inputBar: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionLayer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 100,
    height: height / 2,
  },
  heartContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  }
});
