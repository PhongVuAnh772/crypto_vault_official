import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import { p2pApi } from '../services/p2pApi';
import { P2PChatMessage, P2POrder } from '../shared/types';

type Props = {
  token: string;
  orderId: string;
};

const P2POrderDetailScreen: React.FC<Props> = ({ token, orderId }) => {
  const [order, setOrder] = useState<P2POrder | null>(null);
  const [chat, setChat] = useState<P2PChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isPending = useMemo(() => order?.status === 'PENDING_PAYMENT', [order?.status]);
  const isPaid = useMemo(() => order?.status === 'PAID', [order?.status]);

  const load = async () => {
    setLoading(true);
    const [orderRes, chatRes] = await Promise.all([p2pApi.getOrder(token, orderId), p2pApi.listOrderChat(token, orderId)]);
    setLoading(false);
    if (!orderRes.ok) return Alert.alert('Order error', orderRes.error);
    setOrder(orderRes.data);
    if (chatRes.ok) setChat(chatRes.data);
  };

  useEffect(() => {
    void load();
  }, [orderId, token]);

  const markPaid = async () => {
    const res = await p2pApi.markPaid(token, orderId, 'https://storage.example/proof.jpg');
    if (!res.ok) return Alert.alert('Mark paid failed', res.error);
    setOrder(res.data);
  };

  const release = async () => {
    const res = await p2pApi.releaseOrder(token, orderId, `release-${Date.now()}`);
    if (!res.ok) return Alert.alert('Release failed', res.error);
    setOrder(res.data);
  };

  const openDispute = async () => {
    const res = await p2pApi.openDispute(token, orderId, 'Need admin review');
    if (!res.ok) return Alert.alert('Open dispute failed', res.error);
    Alert.alert('Dispute opened', res.data.id);
    await load();
  };

  const send = async () => {
    if (!message.trim()) return;
    const res = await p2pApi.sendOrderChat(token, orderId, message.trim());
    if (!res.ok) return Alert.alert('Send message failed', res.error);
    setChat((prev) => [...prev, res.data]);
    setMessage('');
  };

  return (
    <ScreenWrapper enableHeader headerTitle="Order Detail">
      <View style={styles.container}>
        <Text style={styles.meta}>Order: {order?.order_no ?? '...'}</Text>
        <Text style={styles.meta}>Status: {order?.status ?? '...'}</Text>
        <Text style={styles.meta}>Amount: {order?.asset_amount ?? '0'} USDT</Text>

        <View style={styles.actions}>
          {isPending && (
            <Pressable style={styles.button} onPress={markPaid} disabled={loading}>
              <Text style={styles.buttonText}>Mark Paid</Text>
            </Pressable>
          )}
          {isPaid && (
            <Pressable style={styles.button} onPress={release} disabled={loading}>
              <Text style={styles.buttonText}>Release</Text>
            </Pressable>
          )}
          <Pressable style={styles.secondary} onPress={openDispute}>
            <Text style={styles.secondaryText}>Open Dispute</Text>
          </Pressable>
        </View>

        <FlatList
          data={chat}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Text style={styles.chatLine}>{item.sender_id.slice(0, 6)}: {item.message}</Text>}
          ListEmptyComponent={<Text style={styles.empty}>No messages</Text>}
        />

        <View style={styles.chatInputWrap}>
          <TextInput placeholder="Type message..." value={message} onChangeText={setMessage} style={styles.chatInput} />
          <Pressable style={styles.send} onPress={send}>
            <Text style={styles.buttonText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  meta: { fontSize: 15, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  button: { backgroundColor: '#1F6BFF', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondary: { borderColor: '#1F6BFF', borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  secondaryText: { color: '#1F6BFF', fontWeight: '700' },
  chatLine: { paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  empty: { textAlign: 'center', marginTop: 16, opacity: 0.6 },
  chatInputWrap: { flexDirection: 'row', gap: 8 },
  chatInput: { flex: 1, borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  send: { backgroundColor: '#111827', borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
});

export default P2POrderDetailScreen;
