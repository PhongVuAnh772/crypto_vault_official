import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import AdMobService from 'src/features/admob/AdMobService';

const NativeAd: React.FC = () => {
  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <BannerAd
          unitId={AdMobService.getBannerAdUnitId()}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(err) => {
            console.log('[AdMob] Banner load failed', (err as any)?.code ?? err?.message);
          }}
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
