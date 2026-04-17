import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BASE_URL } from '../../../env.config';

const LiveBroadcastScreen = ({ navigation }: any) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<'front' | 'back'>('front');
  const [isLive, setIsLive] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{ id: string, user: string, text: string, avatar?: string }[]>([]);
  const [viewersCount, setViewersCount] = useState(0);
  const [socialProfile, setSocialProfile] = useState<{ name: string, avatar: string } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    const WS_URL = BASE_URL.replace('http', 'ws').replace('/api/v1/', '/');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join_live', roomId: 'global' }));
      console.log('Host connected to WS:', WS_URL);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'live_chat') {
          setMessages(prev => [...prev, data.message]);
        } else if (data.type === 'join_live') {
          setViewersCount(prev => prev + 1);
        }
      } catch (e) {
        console.error(e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const toggleLive = () => {
    if (!socialProfile) {
      Alert.alert(
        'Yêu cầu Đăng nhập',
        'Vui lòng liên kết tài khoản Google hoặc Telegram để bắt đầu phát sóng!',
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Google', onPress: () => mockSocialLogin('Google') },
          { text: 'Telegram', onPress: () => mockSocialLogin('Telegram') },
        ]
      );
      return;
    }

    if (!isLive) {
      // POST to backend to register live stream on feed
      fetch(`${BASE_URL}feed/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'live',
          user_name: socialProfile.name,
          content: `${socialProfile.name} đang phát trực tiếp!`,
          images: [socialProfile.avatar]
        })
      }).catch(console.error);

      Alert.alert('Bắt đầu Phát sóng', 'Luồng Live của bạn đã bắt đầu chia sẻ lên Feed!');
    }
    setIsLive(!isLive);
  };

  const mockSocialLogin = (platform: string) => {
    // Giả lập luồng OAuth trả về profile
    setTimeout(() => {
      setSocialProfile({
        name: platform === 'Google' ? 'Google User' : 'Tele User',
        avatar: platform === 'Google'
          ? 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg'
          : 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg'
      });
      Alert.alert('Thành công', `Đã liên kết tài khoản ${platform}`);
    }, 500);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMsg = { id: Date.now().toString(), user: socialProfile?.name || 'Host (Tôi)', text: chatMessage, avatar: socialProfile?.avatar };
      setMessages(prev => [...prev, newMsg]);

      // Broadcast message to viewers
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'live_chat',
          roomId: 'global',
          message: { id: Date.now().toString(), user: socialProfile?.name || 'Host', text: chatMessage, avatar: socialProfile?.avatar }
        }));
      }

      setChatMessage('');
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text style={styles.text}>Yêu cầu quyền truy cập Camera...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text style={styles.text}>Không có quyền truy cập Camera.</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView style={styles.camera} facing={type}>
        <View style={styles.overlay}>

          {/* Header */}
          <View style={styles.header}>
            {isLive && socialProfile ? (
              <View style={styles.hostInfoPill}>
                <Image source={{ uri: socialProfile.avatar }} style={styles.hostAvatar} />
                <View style={styles.hostTextContainer}>
                  <Text style={styles.hostName} numberOfLines={1}>{socialProfile.name}</Text>
                  <Text style={styles.hostLikes}>🤍 0</Text>
                </View>
              </View>
            ) : (
              <View /> // Placeholder
            )}

            <View style={styles.headerRightControls}>
              {isLive && (
                <View style={styles.viewersPill}>
                  <Text style={styles.viewersCountText}>👁️ {viewersCount}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setType(type === 'back' ? 'front' : 'back')}
              >
                <Text style={styles.iconText}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                <Text style={styles.iconText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Chat List */}
          <View style={styles.chatContainer}>
            {messages.map((msg) => (
              <View key={msg.id} style={styles.chatMessageRow}>
                <Image source={{ uri: msg.avatar || 'https://via.placeholder.com/30' }} style={styles.chatAvatar} />
                <View style={styles.chatBubble}>
                  <Text style={styles.chatUser}>{msg.user}</Text>
                  <Text style={styles.chatText}>{msg.text}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Footer Actions */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.footer}>
              {isLive ? (
                <>
                  <TextInput
                    style={styles.chatInput}
                    placeholder="Nhập bình luận..."
                    placeholderTextColor="#EAECEF"
                    value={chatMessage}
                    onChangeText={setChatMessage}
                    onSubmitEditing={handleSendMessage}
                  />
                  <TouchableOpacity style={styles.endLiveButton} onPress={toggleLive}>
                    <Text style={styles.mainButtonText}>END</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={[styles.startLiveButton, !socialProfile && { backgroundColor: '#848E9C' }]} onPress={toggleLive}>
                  <Text style={styles.mainButtonText}>{socialProfile ? 'GO LIVE' : 'LOGIN TO LIVE'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAvoidingView>

        </View>
      </CameraView>
    </SafeAreaView>
  );
};

export default LiveBroadcastScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  text: { color: '#fff', textAlign: 'center', marginTop: 20 },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', paddingLeft: 12, paddingRight: 10, paddingBottom: 10, paddingTop: Platform.OS === 'ios' ? 10 : 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },

  hostInfoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 30, paddingRight: 8 },
  hostAvatar: { width: 34, height: 34, borderRadius: 17 },
  hostTextContainer: { marginHorizontal: 6, maxWidth: 70 },
  hostName: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  hostLikes: { color: '#eee', fontSize: 10 },

  headerRightControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewersPill: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  viewersCountText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  iconButton: { backgroundColor: 'rgba(0,0,0,0.3)', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  iconText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  chatContainer: { flex: 1, justifyContent: 'flex-end', marginBottom: 10 },
  chatMessageRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  chatAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  chatBubble: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, maxWidth: '85%' },
  chatUser: { color: '#B0C4DE', fontWeight: 'bold', fontSize: 13, marginBottom: 2 },
  chatText: { color: '#fff', fontSize: 14 },

  footer: { flexDirection: 'row', alignItems: 'center', marginBottom: Platform.OS === 'ios' ? 20 : 0 },
  chatInput: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff', padding: 12, borderRadius: 20, marginRight: 10 },
  startLiveButton: { flex: 1, backgroundColor: '#FCD535', padding: 16, borderRadius: 30, alignItems: 'center' },
  endLiveButton: { backgroundColor: '#F6465D', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, justifyContent: 'center' },
  mainButtonText: { color: '#0B0E11', fontSize: 16, fontWeight: 'bold' }
});
