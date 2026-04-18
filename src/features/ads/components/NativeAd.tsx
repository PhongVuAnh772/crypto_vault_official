import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Mã ID thật của bạn
const PRODUCTION_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-4977121797292191/2658828359',
  android: 'ca-app-pub-4977121797292191/6968007786',
});

// Tự động dùng Test ID nếu đang ở chế độ DEV
const adUnitId = __DEV__ ? TestIds.BANNER : (PRODUCTION_AD_UNIT_ID || TestIds.BANNER);

const NativeAd: React.FC = () => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={() => console.log('[AdMob] Premium Banner LOADED')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 20,
    marginVertical: 12,
    width: '100%',
  },
  innerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    // Elevation cho Android
    elevation: 4,
  },
});

export default NativeAd;
