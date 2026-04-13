// import mobileAds, {
//   MaxAdContentRating,
//   TestIds,
//   RewardedAd,
//   RewardedAdEventType,
//   AdEventType,
// } from 'react-native-google-mobile-ads';

class AdMobService {
  private static instance: AdMobService;
  private rewarded: any = null;
  private initialized = false;

  private rewardedId = '';

  private constructor() { }

  static getInstance() {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  async init() {
    console.log('AdMob stub initialized');
    this.initialized = true;
  }

  loadRewarded() {
    console.log('AdMob stub loadRewarded');
  }

  showRewarded(): Promise<boolean> {
    console.log('AdMob stub showRewarded');
    return Promise.resolve(true);
  }
}

export default AdMobService.getInstance();
