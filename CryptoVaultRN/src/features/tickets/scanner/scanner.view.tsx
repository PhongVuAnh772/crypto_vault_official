import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAppDispatch } from 'src/core/redux/hooks';
import { setLastScanResult, addToOfflineQueue } from 'src/core/redux/slice/ticket.slice';
import * as TicketService from 'src/core/services/TicketService';
import type { VerifyQRResponse } from 'src/core/redux/slice/ticket.type';

/**
 * Scanner Screen
 * Camera-based QR scanner for staff ticket verification.
 */

const ScannerScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [lastResult, setLastResult] = useState<VerifyQRResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBarCodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (!scanning || isProcessing) return;
    setScanning(false);
    setIsProcessing(true);
    Vibration.vibrate(100);

    try {
      const payload = JSON.parse(data);

      // Verify QR code
      const result = await TicketService.verifyQR(payload);

      setLastResult(result);
      dispatch(setLastScanResult({
        status: result.status,
        message: result.message,
        ticket: result.ticket,
      }));

      if (result.status === 'VALID') {
        // Show check-in confirmation
        Alert.alert(
          '✅ Valid Ticket',
          `${result.ticket?.event_name}\n${result.ticket?.seat_info || 'No seat info'}\n\nCheck in this ticket?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resetScanner() },
            {
              text: 'Check In',
              onPress: async () => {
                try {
                  await TicketService.checkIn(payload.tid);
                  Alert.alert('✅ Checked In', 'Ticket has been marked as used.', [
                    { text: 'OK', onPress: () => resetScanner() },
                  ]);
                } catch (err: any) {
                  Alert.alert('❌ Check-in Failed', err.message, [
                    { text: 'OK', onPress: () => resetScanner() },
                  ]);
                }
              },
            },
          ]
        );
      } else {
        // Show invalid result
        Alert.alert(
          getStatusEmoji(result.status) + ' ' + getStatusTitle(result.status),
          result.message,
          [{ text: 'Scan Again', onPress: () => resetScanner() }]
        );
      }
    } catch (err: any) {
      // Could be offline or invalid QR
      Alert.alert('❌ Error', err.message || 'Invalid QR code', [
        { text: 'Scan Again', onPress: () => resetScanner() },
      ]);
    } finally {
      setIsProcessing(false);
    }
  }, [scanning, isProcessing, dispatch]);

  const resetScanner = useCallback(() => {
    setScanning(true);
    setLastResult(null);
  }, []);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionEmoji}>📸</Text>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          Grant camera access to scan ticket QR codes
        </Text>
        <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.scanHeader}>
            <Text style={styles.scanTitle}>Scan Ticket QR</Text>
            <Text style={styles.scanSubtitle}>
              Point your camera at the ticket QR code
            </Text>
          </View>

          {/* Scan Frame */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>

          {/* Status indicator */}
          <View style={styles.statusIndicator}>
            {isProcessing ? (
              <Text style={styles.statusText}>⏳ Verifying...</Text>
            ) : scanning ? (
              <Text style={styles.statusText}>📷 Ready to scan</Text>
            ) : (
              <TouchableOpacity onPress={resetScanner}>
                <Text style={styles.statusText}>🔄 Tap to scan again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
};

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'VALID': return '✅';
    case 'ALREADY_USED': return '🔄';
    case 'EXPIRED': return '⏰';
    case 'CANCELLED': return '❌';
    case 'NOT_FOUND': return '❓';
    default: return '⚠️';
  }
}

function getStatusTitle(status: string): string {
  switch (status) {
    case 'VALID': return 'Valid Ticket';
    case 'ALREADY_USED': return 'Already Used';
    case 'EXPIRED': return 'Expired';
    case 'CANCELLED': return 'Cancelled';
    case 'NOT_FOUND': return 'Not Found';
    default: return 'Invalid';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  scanHeader: {
    alignItems: 'center',
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scanSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  scanFrame: {
    width: 260,
    height: 260,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#2563EB',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  statusIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  permissionEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#8B95A8',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  grantButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  grantButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ScannerScreen;
