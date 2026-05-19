import {
  AdEventType,
  AppOpenAd,
  InterstitialAd,
  default as mobileAds,
  RewardedAd,
  RewardedAdEventType,
  RewardedInterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';
import { AppState, AppStateStatus, Platform } from 'react-native';

type AdFormat = 'appOpen' | 'interstitial' | 'rewarded' | 'rewardedInterstitial' | 'banner';

const isDev = __DEV__;

const adUnitIds: Record<AdFormat, string> = {
  appOpen: isDev
    ? TestIds.APP_OPEN
    : Platform.select({
        ios: 'ca-app-pub-4977121797292191/2658828359',
        android: 'ca-app-pub-4977121797292191/6968007786',
      }) || TestIds.APP_OPEN,
  interstitial: isDev
    ? TestIds.INTERSTITIAL
    : Platform.select({
        ios: 'ca-app-pub-4977121797292191/2658828359',
        android: 'ca-app-pub-4977121797292191/6968007786',
      }) || TestIds.INTERSTITIAL,
  rewarded: isDev
    ? TestIds.REWARDED
    : Platform.select({
        ios: 'ca-app-pub-4977121797292191/6604859600',
        android: 'ca-app-pub-4977121797292191/2400326553',
      }) || TestIds.REWARDED,
  rewardedInterstitial: isDev
    ? TestIds.REWARDED_INTERSTITIAL
    : Platform.select({
        ios: 'ca-app-pub-4977121797292191/6604859600',
        android: 'ca-app-pub-4977121797292191/2400326553',
      }) || TestIds.REWARDED_INTERSTITIAL,
  banner: isDev
    ? TestIds.BANNER
    : Platform.select({
        ios: 'ca-app-pub-4977121797292191/2658828359',
        android: 'ca-app-pub-4977121797292191/6968007786',
      }) || TestIds.BANNER,
};

const adRequestOptions = {
  requestNonPersonalizedAdsOnly: true,
};

class AdMobService {
  private static instance: AdMobService;
  private initialized = false;
  private initializingPromise: Promise<void> | null = null;

  private rewarded: RewardedAd | null = null;
  private interstitial: InterstitialAd | null = null;
  private rewardedInterstitial: RewardedInterstitialAd | null = null;
  private appOpen: AppOpenAd | null = null;

  private rewardedLoaded = false;
  private interstitialLoaded = false;
  private rewardedInterstitialLoaded = false;
  private appOpenLoaded = false;
  private isShowingAppOpen = false;
  private appOpenShownAt = 0;

  private appStateSubscription?: { remove: () => void };
  private previousAppState: AppStateStatus = AppState.currentState;

  static getInstance() {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  async init() {
    if (this.initialized) return;
    if (this.initializingPromise) return this.initializingPromise;

    this.initializingPromise = (async () => {
      await mobileAds().initialize();
      this.initialized = true;
      this.attachAppStateListener();
      this.loadRewarded();
      this.loadInterstitial();
      this.loadRewardedInterstitial();
      this.loadAppOpen();
    })();

    try {
      await this.initializingPromise;
    } finally {
      this.initializingPromise = null;
    }
  }

  getBannerAdUnitId() {
    return adUnitIds.banner;
  }

  private attachAppStateListener() {
    if (this.appStateSubscription) return;

    this.appStateSubscription = AppState.addEventListener('change', async (nextAppState) => {
      const movedToForeground =
        this.previousAppState.match(/inactive|background/) &&
        nextAppState === 'active';
      this.previousAppState = nextAppState;
      if (!movedToForeground) return;
      await this.showAppOpenIfAvailable();
    });
  }

  private loadRewarded() {
    if (!this.initialized) return;
    this.rewardedLoaded = false;

    const ad = RewardedAd.createForAdRequest(adUnitIds.rewarded, adRequestOptions);
    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      this.rewardedLoaded = true;
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      this.rewardedLoaded = false;
    });
    ad.load();
    this.rewarded = ad;
  }

  private loadInterstitial() {
    if (!this.initialized) return;
    this.interstitialLoaded = false;

    const ad = InterstitialAd.createForAdRequest(adUnitIds.interstitial, adRequestOptions);
    ad.addAdEventListener(AdEventType.LOADED, () => {
      this.interstitialLoaded = true;
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      this.interstitialLoaded = false;
    });
    ad.load();
    this.interstitial = ad;
  }

  private loadRewardedInterstitial() {
    if (!this.initialized) return;
    this.rewardedInterstitialLoaded = false;

    const ad = RewardedInterstitialAd.createForAdRequest(adUnitIds.rewardedInterstitial, adRequestOptions);
    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      this.rewardedInterstitialLoaded = true;
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      this.rewardedInterstitialLoaded = false;
    });
    ad.load();
    this.rewardedInterstitial = ad;
  }

  private loadAppOpen() {
    if (!this.initialized) return;
    this.appOpenLoaded = false;

    const ad = AppOpenAd.createForAdRequest(adUnitIds.appOpen, adRequestOptions);
    ad.addAdEventListener(AdEventType.LOADED, () => {
      this.appOpenLoaded = true;
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      this.appOpenLoaded = false;
    });
    ad.load();
    this.appOpen = ad;
  }

  async showRewarded(): Promise<boolean> {
    await this.init();
    if (!this.rewarded || !this.rewardedLoaded) {
      this.loadRewarded();
      return false;
    }

    return new Promise((resolve) => {
      let earned = false;
      const unsubscribeEarn = this.rewarded!.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earned = true;
        },
      );
      const unsubscribeClosed = this.rewarded!.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeEarn();
          unsubscribeClosed();
          this.rewardedLoaded = false;
          this.loadRewarded();
          resolve(earned);
        },
      );
      const unsubscribeError = this.rewarded!.addAdEventListener(
        AdEventType.ERROR,
        () => {
          unsubscribeEarn();
          unsubscribeClosed();
          unsubscribeError();
          this.rewardedLoaded = false;
          this.loadRewarded();
          resolve(false);
        },
      );

      this.rewarded!.show().catch(() => {
        unsubscribeEarn();
        unsubscribeClosed();
        unsubscribeError();
        this.rewardedLoaded = false;
        this.loadRewarded();
        resolve(false);
      });
    });
  }

  async showInterstitial(): Promise<boolean> {
    await this.init();
    if (!this.interstitial || !this.interstitialLoaded) {
      this.loadInterstitial();
      return false;
    }
    try {
      await this.interstitial.show();
      this.interstitialLoaded = false;
      this.loadInterstitial();
      return true;
    } catch {
      this.interstitialLoaded = false;
      this.loadInterstitial();
      return false;
    }
  }

  async showRewardedInterstitial(): Promise<boolean> {
    await this.init();
    if (!this.rewardedInterstitial || !this.rewardedInterstitialLoaded) {
      this.loadRewardedInterstitial();
      return false;
    }

    return new Promise((resolve) => {
      let earned = false;
      const unsubscribeEarn = this.rewardedInterstitial!.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earned = true;
        },
      );
      const unsubscribeClosed = this.rewardedInterstitial!.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeEarn();
          unsubscribeClosed();
          this.rewardedInterstitialLoaded = false;
          this.loadRewardedInterstitial();
          resolve(earned);
        },
      );
      const unsubscribeError = this.rewardedInterstitial!.addAdEventListener(
        AdEventType.ERROR,
        () => {
          unsubscribeEarn();
          unsubscribeClosed();
          unsubscribeError();
          this.rewardedInterstitialLoaded = false;
          this.loadRewardedInterstitial();
          resolve(false);
        },
      );

      this.rewardedInterstitial!.show().catch(() => {
        unsubscribeEarn();
        unsubscribeClosed();
        unsubscribeError();
        this.rewardedInterstitialLoaded = false;
        this.loadRewardedInterstitial();
        resolve(false);
      });
    });
  }

  async showAppOpenIfAvailable(): Promise<boolean> {
    await this.init();
    const now = Date.now();
    if (this.isShowingAppOpen || now - this.appOpenShownAt < 30_000) {
      return false;
    }
    if (!this.appOpen || !this.appOpenLoaded) {
      this.loadAppOpen();
      return false;
    }

    this.isShowingAppOpen = true;
    try {
      await this.appOpen.show();
      this.appOpenShownAt = Date.now();
      this.appOpenLoaded = false;
      this.loadAppOpen();
      return true;
    } catch {
      this.appOpenLoaded = false;
      this.loadAppOpen();
      return false;
    } finally {
      this.isShowingAppOpen = false;
    }
  }
}

export default AdMobService.getInstance();
