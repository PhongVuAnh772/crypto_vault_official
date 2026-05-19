import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  View,
  Modal,
  Share
} from 'react-native';
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
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<'device' | 'gaming'>('device');
  const [activeTab, setActiveTab] = useState('LIVE');
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  
  // States for features
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [activeEffect, setActiveEffect] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const isEndingRef = useRef(false);

  const handleOptionPress = async (optionName: string) => {
    if (optionName === 'Share') {
      setShowOptionsModal(false);
      try {
        await Share.share({
          message: `Join my livestream on CryptoVault!`,
          title: 'Livestream'
        });
      } catch (error) {
        console.error(error);
      }
      return;
    }

    if (optionName === 'Enhance') {
      setIsEnhanced(!isEnhanced);
      return; // Keep modal open or close it? Let's keep it open to allow multiple toggles, or close it. 
    }

    if (optionName === 'Effects') {
      setActiveEffect(!activeEffect);
      return;
    }

    setShowOptionsModal(false);
    Alert.alert('Notice', `${optionName} feature will be available in the next update.`);
  };

  // Prevent going back without ending the live
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!isLive || isEndingRef.current) {
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      Alert.alert(
        'Kết thúc Live?',
        'Bạn có chắc chắn muốn kết thúc phiên live này không? Bản ghi sẽ được xoá.',
        [
          { text: 'Huỷ', style: 'cancel', onPress: () => {} },
          {
            text: 'Kết thúc',
            style: 'destructive',
            onPress: () => {
              // toggleLive will delete the record and then goBack
              toggleLive();
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isLive, currentRoomId]);

  // Mock profile for now
  const [profile] = useState({
    name: 'Lord Busuz',
    avatar: 'https://i.pravatar.cc/150?u=host'
  });

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }

    // 1. Fetch chat history if we are already live (e.g. re-entering screen)
    const fetchHistory = async () => {
      if (currentRoomId) {
        try {
          const response = await fetch(`${BASE_URL}feed/${currentRoomId}/comments`);
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
          console.error('Failed to fetch chat history:', e);
        }
      }
    };

    fetchHistory();

    // 2. WebSocket setup
    const WS_URL = BASE_URL.replace('http', 'ws').replace('/api/v1/feed', '').replace('/api/v1/', '/');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected to live server');
      if (currentRoomId) {
        ws.send(JSON.stringify({ type: 'join_live', roomId: currentRoomId }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'live_chat' && (data.roomId === currentRoomId || data.roomId === 'global')) {
          setMessages(prev => [...prev.slice(-20), data.message]);
        } else if (data.type === 'viewer_count' && data.roomId === currentRoomId) {
          setViewerCount(data.count);
        } else if (data.type === 'send_reaction' && data.roomId === currentRoomId) {
          handleAddHeart();
        }
      } catch (e) {
        console.error('WS Message Error:', e);
      }
    };

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN && currentRoomId) {
        wsRef.current.send(JSON.stringify({ type: 'leave_live', roomId: currentRoomId }));
      }
      ws.close();
    };
  }, [permission, currentRoomId]);

  const handleAddHeart = useCallback(() => {
    setHearts(prev => [...prev, { id: Date.now() + Math.random() }]);
  }, []);

  const toggleLive = async () => {
    try {
      if (!isLive) {
        // 1. Notify backend about new stream
        const response = await fetch(`${BASE_URL}feed/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'live',
            user_name: profile.name,
            content: `${profile.name} is streaming now! Join to chat and react.`,
            images: [profile.avatar]
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create live feed');
        }

        const result = await response.json();
        const newRoomId = result.post.id;

        setCurrentRoomId(newRoomId);
        setIsLive(true);

        // 2. Join WS room
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'join_live', roomId: newRoomId }));
        }
      } else {
        isEndingRef.current = true;
        // End stream
        if (currentRoomId) {
          // 1. Delete post from feed so it doesn't show up anymore
          await fetch(`${BASE_URL}feed/${currentRoomId}`, {
            method: 'DELETE',
          }).catch(err => console.error('Failed to delete live post:', err));

          // 2. Notify WS and cleanup
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'leave_live', roomId: currentRoomId }));
          }
        }

        setIsLive(false);
        setCurrentRoomId(null);
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
          roomId: currentRoomId || 'global',
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
      <TouchableOpacity style={styles.goLiveBtn} onPress={requestPermission}>
        <Text style={styles.goLiveText}>Grant Permission</Text>
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
              <TouchableOpacity style={styles.closeBtn} onPress={() => {
                if (isLive) {
                  Alert.alert(
                    'Kết thúc Live?',
                    'Bạn có chắc chắn muốn kết thúc phiên live này không? Bản ghi sẽ được xoá.',
                    [
                      { text: 'Huỷ', style: 'cancel' },
                      { text: 'Kết thúc', style: 'destructive', onPress: () => toggleLive() }
                    ]
                  );
                } else {
                  navigation.goBack();
                }
              }}>
                <MaterialCommunityIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            {isLive ? (
              <View style={styles.liveIndicator}>
                <View style={styles.dot} />
                <Text style={styles.liveText}>LIVE</Text>
                <View style={styles.separator} />
                <Text style={styles.viewerText}>{viewerCount.toLocaleString()}</Text>
              </View>
            ) : (
              <View style={styles.preLiveBanner}>
                <View style={styles.bannerContent}>
                  <Image source={{ uri: 'https://i.pravatar.cc/100?u=latercon' }} style={styles.bannerImage} />
                  <View style={styles.bannerTextContainer}>
                    <Text style={styles.bannerTitle}>45 minutes out from LaterCon!</Text>
                    <TouchableOpacity style={styles.changeBtn}>
                      <Text style={styles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.headerRight}>
              {isLive && (
                <TouchableOpacity style={styles.circleBtn} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
                  <MaterialCommunityIcons name="camera-flip-outline" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {!isLive && (
            <View style={styles.preLiveActions}>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionItem}>
                  <MaterialCommunityIcons name="pound" size={18} color="#FCD535" />
                  <Text style={styles.actionItemText}>Add topic</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionItem, { marginLeft: 10 }]}>
                  <MaterialCommunityIcons name="target" size={18} color="#A020F0" />
                  <Text style={styles.actionItemText}>Add a LIVE goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Centered Options Modal */}
          <Modal
            visible={showOptionsModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowOptionsModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setShowOptionsModal(false)}
            >
              <View style={styles.optionsGrid}>
                {[
                  { name: 'Enhance', icon: 'auto-fix', active: isEnhanced },
                  { name: 'Effects', icon: 'face-recognition', active: activeEffect },
                  { name: 'Settings', icon: 'cog' },
                  { name: 'Share', icon: 'share-variant' },
                  { name: 'LIVE Center', icon: 'play-box-outline' },
                  { name: 'Get leads', icon: 'clipboard-text-outline' },
                  { name: 'Promote', icon: 'fire' },
                  { name: 'Poll', icon: 'chart-bar' }
                ].map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.gridItem, item.active && { opacity: 1 }]} 
                    onPress={() => handleOptionPress(item.name)}
                  >
                    <MaterialCommunityIcons 
                      name={item.icon as any} 
                      size={32} 
                      color={item.active ? "#FCD535" : "#fff"} 
                    />
                    <Text style={[styles.gridItemText, item.active && { color: "#FCD535" }]}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

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
          <View style={styles.chatContainer} pointerEvents="box-none">
            <FlatList
              data={[...messages].reverse()}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.chatRow}>
                  <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150?u=' + item.user }} style={styles.chatAvatar} />
                  <View style={styles.chatContent}>
                    <Text style={[styles.chatUser, { color: item.user === 'Host' ? '#FCD535' : '#4dff88' }]}>{item.user}</Text>
                    <Text style={styles.chatText}>{item.text}</Text>
                  </View>
                </View>
              )}
              inverted
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.chatList}
            />
          </View>

          {/* Footer Actions */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.footer}>
              {!isLive ? (
                <View style={styles.preLiveFooter}>
                  <TouchableOpacity style={styles.goLiveBtn} onPress={toggleLive}>
                    <Text style={styles.goLiveText}>Go LIVE</Text>
                  </TouchableOpacity>

                  <View style={styles.sourceSelectorWrapper}>
                    <View style={styles.sourceSelector}>
                      <TouchableOpacity 
                        style={[styles.sourceItem, sourceType === 'device' && styles.activeSource]} 
                        onPress={() => setSourceType('device')}
                      >
                        <MaterialCommunityIcons name="video-outline" size={18} color={sourceType === 'device' ? "#000" : "#fff"} />
                        <Text style={[styles.sourceText, { color: sourceType === 'device' ? '#000' : '#fff' }]}>Device camera</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.sourceItem, sourceType === 'gaming' && styles.activeSource]} 
                        onPress={() => setSourceType('gaming')}
                      >
                        <MaterialCommunityIcons name="cellphone" size={18} color={sourceType === 'gaming' ? "#000" : "#fff"} />
                        <Text style={[styles.sourceText, { color: sourceType === 'gaming' ? '#000' : '#fff' }]}>Mobile gaming</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.tabBar}>
                    <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Camera')}>
                      <Text style={[styles.tabText, activeTab === 'Camera' && styles.activeTabText]}>Camera</Text>
                      {activeTab === 'Camera' && <View style={styles.activeDot} />}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Templates')}>
                      <Text style={[styles.tabText, activeTab === 'Templates' && styles.activeTabText]}>Templates</Text>
                      {activeTab === 'Templates' && <View style={styles.activeDot} />}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('LIVE')}>
                      <Text style={[styles.tabText, activeTab === 'LIVE' && styles.activeTabText]}>LIVE</Text>
                      {activeTab === 'LIVE' && <View style={styles.activeDot} />}
                    </TouchableOpacity>
                  </View>
                </View>
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

          {!isLive && (
            <View style={styles.sidebar} pointerEvents="box-none">
              <TouchableOpacity style={styles.sidebarItem} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
                <MaterialCommunityIcons name="camera-flip" size={28} color="#fff" />
                <Text style={styles.sidebarText}>Flip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sidebarItem} onPress={() => setShowOptionsModal(true)}>
                <MaterialCommunityIcons name="view-grid-plus-outline" size={28} color="#fff" />
                <Text style={styles.sidebarText}>Options</Text>
              </TouchableOpacity>
            </View>
          )}
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
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerLeft: {
    width: 44,
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preLiveBanner: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    marginHorizontal: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  bannerTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  changeBtn: {
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  changeBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  preLiveActions: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionItemText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  sidebar: {
    position: 'absolute',
    right: 16,
    top: height * 0.25,
    alignItems: 'center',
  },
  sidebarItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  sidebarText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsGrid: {
    width: '85%',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  gridItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 20,
  },
  gridItemText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  preLiveFooter: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
  },
  goLiveBtn: {
    backgroundColor: '#FF2C55',
    width: '90%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  goLiveText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sourceSelectorWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sourceSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 4,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  activeSource: {
    backgroundColor: '#fff',
  },
  sourceText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: 'bold',
  },
  activeTab: {
    opacity: 1,
  },
  activeTabText: {
    color: '#fff',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginTop: 4,
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
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
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
