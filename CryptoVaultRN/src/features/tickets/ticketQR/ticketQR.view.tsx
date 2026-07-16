import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { useTicketQR } from './ticketQR.hook';

/**
 * Full-screen dynamic QR code display for ticket check-in.
 * Features auto-refreshing nonce, countdown timer, and anti-screenshot design.
 */

const TicketQRScreen: React.FC = () => {
  const route = useRoute<any>();
  const { ticketId } = route.params;

  const {
    qrString,
    isLoading,
    error,
    countdown,
    progress,
    refresh,
  } = useTicketQR(ticketId);

  const progressColor = progress > 0.3 ? '#22C55E' : progress > 0.1 ? '#EAB308' : '#EF4444';

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Ticket</Text>
        <Text style={styles.subtitle}>Show this QR code at the entrance</Text>
      </View>

      {/* QR Code Area */}
      <View style={styles.qrContainer}>
        {isLoading && !qrString ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : qrString ? (
          <>
            <View style={styles.qrWrapper}>
              <QRCode
                value={qrString}
                size={240}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>

            {/* Countdown */}
            <View style={styles.countdownContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progress * 100}%`, backgroundColor: progressColor },
                  ]}
                />
              </View>
              <Text style={[styles.countdownText, { color: progressColor }]}>
                Refreshes in {countdown}s
              </Text>
            </View>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>
                Dynamic QR — Auto-refreshes every 30 seconds for anti-fraud protection
              </Text>
            </View>
          </>
        ) : null}
      </View>

      {/* Brightness Hint */}
      <Text style={styles.brightnessHint}>
        💡 Increase screen brightness for faster scanning
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B95A8',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 340,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  countdownContainer: {
    marginTop: 24,
    alignItems: 'center',
    width: '100%',
  },
  progressBarBg: {
    width: 200,
    height: 4,
    backgroundColor: '#1E2436',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '600',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#151A2D',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: 320,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  securityText: {
    fontSize: 12,
    color: '#8B95A8',
    flex: 1,
    lineHeight: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  brightnessHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 32,
    textAlign: 'center',
  },
});

export default TicketQRScreen;
