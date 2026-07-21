import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { Feather } from '@expo/vector-icons';
import { appImages } from 'src/core/constants/AppImages';

import Utils from 'src/core/utils/commonUtils';
import AppToastType from 'src/core/enum/AppToastType';

type WalletAddressModalProps = {
  visible: boolean;
  onClose: () => void;
  address: string;
  walletName?: string;
};

const WalletAddressModal: React.FC<WalletAddressModalProps> = ({
  visible,
  onClose,
  address,
  walletName = 'Ví của bạn',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (address) {
      try {
        await Clipboard.setStringAsync(String(address));
      } catch (e) {
        console.warn('Clipboard setStringAsync error:', e);
      }
      setCopied(true);
      try {
        Utils.showToast({
          msg: 'Đã sao chép địa chỉ ví vào bộ nhớ tạm!',
          type: AppToastType.success,
        });
      } catch (e) {}
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalCard}>
              {/* Header with Title and Close button */}
              <View style={styles.header}>
                <Text style={styles.title}>{walletName}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Feather name="x" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* QR Code */}
              <View style={styles.qrWrapper}>
                {address ? (
                  <QRCode
                    value={address}
                    size={170}
                    logo={appImages.newLogo}
                    logoSize={40}
                    backgroundColor="#FFFFFF"
                    color="#07051A"
                  />
                ) : (
                  <Text style={{ color: '#888' }}>Không có địa chỉ ví</Text>
                )}
              </View>

              {/* Subtitle */}
              <Text style={styles.subtitle}>Địa chỉ ví nhận tài sản (Chạm để sao chép):</Text>

              {/* Full Wallet Address - Pressable */}
              <TouchableOpacity
                style={styles.addressBox}
                onPress={handleCopy}
                activeOpacity={0.7}
              >
                <Text style={styles.addressText} selectable={true}>
                  {address || 'Chưa cập nhật'}
                </Text>
              </TouchableOpacity>

              {/* Actions */}
              <TouchableOpacity
                style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
                onPress={handleCopy}
                activeOpacity={0.8}
              >
                <Feather
                  name={copied ? 'check' : 'copy'}
                  size={16}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.copyBtnText}>
                  {copied ? 'Đã sao chép địa chỉ!' : 'Sao chép địa chỉ ví'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 5, 26, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#161338',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(158, 134, 255, 0.25)',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#5A3FFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#B3C2D8',
    marginBottom: 8,
    textAlign: 'center',
  },
  addressBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(158, 134, 255, 0.15)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  addressText: {
    fontSize: 13,
    color: '#9E86FF',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
  copyBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#6A56FD',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtnSuccess: {
    backgroundColor: '#10B981',
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default WalletAddressModal;
