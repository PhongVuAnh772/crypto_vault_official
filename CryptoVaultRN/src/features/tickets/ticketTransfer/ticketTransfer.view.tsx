import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as TicketService from 'src/core/services/TicketService';
import { useAppDispatch } from 'src/core/redux/hooks';
import { updateTicketStatus } from 'src/core/redux/slice/ticket.slice';

/**
 * Ticket Transfer Screen
 * Allows users to transfer their active ticket to another wallet address.
 */

const TicketTransferScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { ticketId } = route.params;

  const [toAddress, setToAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidAddress = toAddress.length >= 26; // Basic check

  const handleTransfer = async () => {
    if (!isValidAddress) return;

    Alert.alert(
      '⚠️ Confirm Transfer',
      `Are you sure you want to transfer this ticket to:\n\n${toAddress.slice(0, 12)}...${toAddress.slice(-6)}\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Transfer',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await TicketService.transferTicket(ticketId, toAddress);
              dispatch(updateTicketStatus({ id: ticketId, status: 'TRANSFERRED' }));
              Alert.alert('✅ Success', 'Ticket has been transferred.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (err: any) {
              Alert.alert('❌ Transfer Failed', err.message);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Transfer Ticket</Text>
        <Text style={styles.subtitle}>
          Enter the recipient's wallet address. The ticket will be permanently transferred.
        </Text>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Once transferred, you will lose ownership of this ticket. This action cannot be reversed.
          </Text>
        </View>

        {/* Address Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Recipient Wallet Address</Text>
          <TextInput
            style={styles.input}
            placeholder="0x... or UQ..."
            placeholderTextColor="#6B7280"
            value={toAddress}
            onChangeText={setToAddress}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Transfer Button */}
        <TouchableOpacity
          style={[styles.transferButton, !isValidAddress && styles.disabledButton]}
          onPress={handleTransfer}
          disabled={!isValidAddress || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.transferButtonText}>↗️ Transfer Ticket</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B95A8',
    lineHeight: 20,
    marginBottom: 24,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#EAB308',
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B95A8',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#151A2D',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1E2436',
  },
  transferButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.4,
  },
  transferButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default TicketTransferScreen;
