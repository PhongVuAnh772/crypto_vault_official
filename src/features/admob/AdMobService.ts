import mobileAds, {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

class AdMobService {
  private static instance: AdMobService;
  private rewarded: RewardedAd | null = null;
  private initialized = false;

  private rewardedId = Platform.select({
    ios: 'ca-app-pub-4977121797292191/6604859600', // Actual iOS rewarded ID from previous context if available, or test ID
    android: 'ca-app-pub-4977121797292191/2400326553',
  }) || TestIds.REWARDED;

  private constructor() { }

  static getInstance() {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  async init() {
    if (this.initialized) return;
    try {
      await mobileAds().initialize();
      this.initialized = true;
      console.log('AdMob initialized successfully');
      this.loadRewarded();
    } catch (error) {
      console.error('AdMob initialization failed:', error);
    }
  }

  loadRewarded() {
    if (!this.initialized) return;
    
    this.rewarded = RewardedAd.createForAdRequest(this.rewardedId, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('Rewarded ad loaded');
    });

    this.rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      console.log('User earned reward:', reward);
    });

    this.rewarded.load();
  }

  async showRewarded(): Promise<boolean> {
    if (!this.rewarded) {
        this.loadRewarded();
        return false;
    }

    try {
      await this.rewarded.show();
      this.loadRewarded(); // Load next ad
      return true;
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      this.loadRewarded();
      return false;
    }
  }
}

export default AdMobService.getInstance();
