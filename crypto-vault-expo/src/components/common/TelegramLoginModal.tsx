import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

type Props = {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: (data: any) => void;
  botName: string;
  botDomain?: string;
};

const TelegramLoginModal: React.FC<Props> = ({
  visible,
  onClose,
  onLoginSuccess,
  botName,
  botDomain = 'https://cryptovault.app',
}) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  /**
   * Inject JS để bắt event login từ Telegram
   * -> gửi data về React Native qua postMessage
   */
  const injectedJS = `
    window.TelegramLoginWidget = {
      dataOnauth: function(user) {
        window.ReactNativeWebView.postMessage(JSON.stringify(user));
      }
    };
    true;
  `;

  /**
   * HTML Telegram widget
   */
  const html = useMemo(
    () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
          function onTelegramAuth(user) {
            window.ReactNativeWebView.postMessage(JSON.stringify(user));
          }
        </script>
      </head>
      <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
        <script async src="https://telegram.org/js/telegram-widget.js?22"
          data-telegram-login="${botName}"
          data-size="large"
          data-userpic="false"
          data-request-access="write"
          data-onauth="onTelegramAuth(user)">
        </script>
      </body>
    </html>
  `,
    [botName]
  );

  /**
   * Nhận data từ WebView
   */
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      onLoginSuccess(data);
      onClose();
    } catch (e) {
      console.log('Parse Telegram data error:', e);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>Close</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Login with Telegram</Text>

          <View style={{ width: 60 }} />
        </View>

        {/* WEBVIEW */}
        <View style={{ flex: 1 }}>
          {loading && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" />
            </View>
          )}

          <WebView
            originWhitelist={['*']}
            source={{ html, baseUrl: botDomain }}
            injectedJavaScript={injectedJS}
            onMessage={handleMessage}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            style={styles.webview}
          />
        </View>
      </View>
    </Modal>
  );
};

export default TelegramLoginModal;

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  closeBtn: {
    color: '#0088cc',
    fontSize: 16,
    fontWeight: '600',
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
  },

  webview: {
    flex: 1,
  },

  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  },
});