import React, { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BASE_URL } from '../../../env.config';

const LiveViewerScreen = ({ route, navigation }: any) => {
  const { title, streamUrl, viewers = 0, hostName = 'Host', roomId, hostAvatar = 'https://via.placeholder.com/40', likes = 0 } = route.params || {};
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<{ id: string, user: string, text: string, avatar?: string }[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // 1. Fetch Real-time data from Backend using WebSockets
  useEffect(() => {
    const WS_URL = BASE_URL.replace('http', 'ws').replace('/api/v1/', '/');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join_live', roomId: roomId || 'global' }));
      console.log('Connected to Live WS:', WS_URL);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'live_chat') {
          setMessages(prev => [...prev, data.message]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMsg = { id: Date.now().toString(), user: 'Tôi', text: chatMessage, avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' };
      setMessages(prev => [...prev, newMsg]);

      // Broadcast via socket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'live_chat',
          roomId: roomId || 'global',
          message: { id: Date.now().toString(), user: 'Viewer', text: chatMessage, avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }
        }));
      }

      setChatMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Real Video Player Component (e.g., expo-av or react-native-video) */}
      <View style={styles.videoPlayer}>
        {/* Placeholder for real stream player */}
        {streamUrl ? (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#0B0E11' }]} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000' }]} />
        )}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.hostInfoPill}>
              <Image source={{ uri: hostAvatar }} style={styles.hostAvatar} />
              <View style={styles.hostTextContainer}>
                <Text style={styles.hostName} numberOfLines={1}>{hostName}</Text>
                <Text style={styles.hostLikes}>🤍 {likes}</Text>
              </View>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinText}>+ Tham gia</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerRightControls}>
              <View style={styles.viewersPill}>
                <Text style={styles.viewersCountText}>{viewers}</Text>
              </View>
              <TouchableOpacity style={styles.iconButton}>
                <Text style={styles.iconText}>˅</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                <Text style={styles.iconText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Banner Overlays */}
          {title ? (
            <View style={styles.bannerContainer}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerText}>{title.length > 30 ? title.substring(0, 30) + '...' : title}</Text>
              </View>
            </View>
          ) : null}

          {/* Chat List */}
          <View style={styles.chatContainer}>
            {messages.length === 0 ? (
              <View style={styles.systemMessage}><Text style={styles.systemText}>Live Support: Hệ thống chat đang kết nối...</Text></View>
            ) : (
              messages.map((msg) => (
                <View key={msg.id} style={styles.chatMessageRow}>
                  <Image source={{ uri: msg.avatar || 'https://via.placeholder.com/30' }} style={styles.chatAvatar} />
                  <View style={styles.chatBubble}>
                    <Text style={styles.chatUser}>{msg.user}</Text>
                    <Text style={styles.chatText}>{msg.text}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Footer Actions */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.footer}>

              {/* Shopping Bag */}
              <TouchableOpacity style={styles.bagIconContainer}>
                <Text style={styles.bagIcon}>🛍️</Text>
                <View style={styles.bagBadge}><Text style={styles.bagBadgeText}>99+</Text></View>
              </TouchableOpacity>

              <TextInput
                style={styles.chatInput}
                placeholder="Nhập..."
                placeholderTextColor="#A0A0A0"
                value={chatMessage}
                onChangeText={setChatMessage}
                onSubmitEditing={handleSendMessage}
              />

              <View style={styles.footerRightIcons}>
                <Text style={styles.emojiIcon}>😃</Text>
                <Text style={styles.emojiIcon}>👥</Text>
                <Text style={styles.emojiIcon}>🌹</Text>
                <Text style={styles.emojiIcon}>🎁</Text>
                <Text style={styles.emojiIcon}>🔁</Text>
              </View>

            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LiveViewerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoPlayer: { flex: 1, backgroundColor: '#1E2329' },
  overlay: { flex: 1, justifyContent: 'space-between', paddingLeft: 12, paddingRight: 10, paddingBottom: 10, paddingTop: Platform.OS === 'ios' ? 10 : 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },

  hostInfoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 30, paddingRight: 8 },
  hostAvatar: { width: 34, height: 34, borderRadius: 17 },
  hostTextContainer: { marginHorizontal: 6, maxWidth: 70 },
  hostName: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  hostLikes: { color: '#eee', fontSize: 10 },
  joinButton: { backgroundColor: '#F08000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  joinText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  headerRightControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewersPill: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  viewersCountText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  iconButton: { backgroundColor: 'rgba(0,0,0,0.3)', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  iconText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  bannerContainer: { alignItems: 'center', marginTop: 10 },
  bannerContent: { backgroundColor: '#0D3A8F', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 12, borderWidth: 1.5, borderColor: '#fff' },
  bannerText: { color: '#FCD535', fontSize: 20, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1 },

  chatContainer: { flex: 1, justifyContent: 'flex-end', marginBottom: 10 },
  systemMessage: { backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 10, marginBottom: 12, alignSelf: 'flex-start' },
  systemText: { color: '#00FA9A', fontSize: 12 },
  chatMessageRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  chatAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  chatBubble: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, maxWidth: '85%' },
  chatUser: { color: '#B0C4DE', fontWeight: 'bold', fontSize: 13, marginBottom: 2 },
  chatText: { color: '#fff', fontSize: 14 },

  footer: { flexDirection: 'row', alignItems: 'center', marginBottom: Platform.OS === 'ios' ? 10 : 0 },
  bagIconContainer: { marginRight: 10, position: 'relative' },
  bagIcon: { fontSize: 26 },
  bagBadge: { position: 'absolute', top: -5, right: -10, backgroundColor: '#FF3366', borderRadius: 10, paddingHorizontal: 4, paddingVertical: 2 },
  bagBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  chatInput: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', color: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, fontSize: 14 },
  footerRightIcons: { flexDirection: 'row', alignItems: 'center', marginLeft: 16, gap: 10 },
  emojiIcon: { fontSize: 22 }
});
