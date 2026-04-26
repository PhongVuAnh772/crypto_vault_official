import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Alert, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  FlatList,
  Dimensions,
  Animated
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from '../../../env.config';

const { height } = Dimensions.get('window');

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
    outputRange: [0, 20, -20, 20, -20, 0],
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

const LiveBroadcastScreen = ({ navigation }: any) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [isLive, setIsLive] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [hearts, setHearts] = useState<{ id: number }[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Mock profile for now
  const [profile] = useState({
    name: 'Lord Busuz',
    avatar: 'https://i.pravatar.cc/150?u=host'
  });

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }

    let ws: WebSocket | null = null;
    try {
      const WS_URL = BASE_URL.replace('http', 'ws').replace('/api/v1/feed', '').replace('/api/v1/', '/');
      ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'join_live', roomId: 'global' }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'live_chat') {
            setMessages(prev => [...prev.slice(-20), data.message]);
          } else if (data.type === 'viewer_count') {
            setViewerCount(data.count);
          } else if (data.type === 'send_reaction') {
            handleAddHeart();
          }
        } catch (e) {
          console.error('WS Message Error:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WS Error:', e);
      };
    } catch (err) {
      console.error('WS Connection Error:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [permission]);

  const handleAddHeart = useCallback(() => {
    setHearts(prev => [...prev, { id: Date.now() + Math.random() }]);
  }, []);

  const toggleLive = async () => {
    try {
      if (!isLive) {
        // Notify backend about new stream
        const response = await fetch(`${BASE_URL}feed/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'live',
            user_name: profile.name,
            content: `${profile.name} is streaming now!`,
            images: [profile.avatar]
          })
        });
        
        if (!response.ok) {
          console.error('Failed to create live feed:', response.status);
        }
        setIsLive(true);
      } else {
        setIsLive(false);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Toggle Live Error:', error);
      Alert.alert('Error', 'Could not start livestream. Please check your connection.');
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const msg: Message = { 
        id: Date.now().toString(), 
        user: 'Host', 
        text: chatMessage, 
        avatar: profile.avatar 
      };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'live_chat',
          roomId: 'global',
          message: msg
        }));
      }
      setChatMessage('');
    }
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) return (
    <View style={styles.container}>
      <Text style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>
        No access to camera. Please enable it in settings.
      </Text>
      <TouchableOpacity style={styles.startBtn} onPress={requestPermission}>
        <Text style={styles.startBtnText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.6)']}
          style={StyleSheet.absoluteFillObject}
        />

        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>
              
              {isLive && (
                <View style={styles.liveIndicator}>
                  <View style={styles.dot} />
                  <Text style={styles.liveText}>LIVE</Text>
                  <View style={styles.separator} />
                  <Text style={styles.viewerText}>{viewerCount.toLocaleString()}</Text>
                </View>
              )}
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.circleBtn} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
                <MaterialCommunityIcons name="camera-flip-outline" size={24} color="#fff" />
              </TouchableOpacity>
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
                  data={messages}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.chatRow}>
                      <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
                      <View style={styles.chatContent}>
                        <Text style={styles.chatUser}>{item.user}</Text>
                        <Text style={styles.chatText}>{item.text}</Text>
                      </View>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.chatList}
              />
          </View>

          {/* Footer Actions */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.footer}>
              {!isLive ? (
                <TouchableOpacity style={styles.startBtn} onPress={toggleLive}>
                  <Text style={styles.startBtnText}>GO LIVE</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.broadcastControls}>
                   <View style={styles.inputBar}>
                      <TextInput
                          style={styles.textInput}
                          placeholder="Type something..."
                          placeholderTextColor="rgba(255,255,255,0.7)"
                          value={chatMessage}
                          onChangeText={setChatMessage}
                          onSubmitEditing={handleSendMessage}
                      />
                      <TouchableOpacity onPress={handleSendMessage}>
                          <MaterialCommunityIcons name="send" size={20} color="#fff" />
                      </TouchableOpacity>
                   </View>
                   <TouchableOpacity style={styles.endBtn} onPress={toggleLive}>
                      <MaterialCommunityIcons name="close" size={24} color="#fff" />
                   </TouchableOpacity>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </CameraView>
    </View>
  );
};

export default LiveBroadcastScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  viewerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    maxWidth: '85%',
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
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  startBtn: {
    backgroundColor: '#ff4d4d',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  broadcastControls: {
    flexDirection: 'row',
    alignItems: 'center',
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
  endBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ff4d4d',
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
