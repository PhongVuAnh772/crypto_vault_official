// import mobileAds, {
//   InterstitialAd,
//   RewardedAd,
//   BannerAdSize,
//   TestIds,
//   AdEventType,
//   RewardedAdEventType,
//   MaxAdContentRating,
// } from "react-native-google-mobile-ads";

// class AdsService {
//   private static instance: AdsService;

//   private interstitial: InterstitialAd | null = null;
//   private rewarded: RewardedAd | null = null;

//   private initialized = false;

//   private interstitialId = __DEV__
//     ? TestIds.INTERSTITIAL
//     : "ca-app-pub-xxx/interstitial";

//   private rewardedId = __DEV__ ? TestIds.REWARDED : "ca-app-pub-xxx/rewarded";

//   private constructor() {}

//   static getInstance() {
//     if (!AdsService.instance) {
//       AdsService.instance = new AdsService();
//     }
//     return AdsService.instance;
//   }

//   async init() {
//     if (this.initialized) return;

//     await mobileAds().setRequestConfiguration({
//       maxAdContentRating: MaxAdContentRating.PG,
//       tagForChildDirectedTreatment: false,
//       tagForUnderAgeOfConsent: false,
//       testDeviceIdentifiers: ["EMULATOR"],
//     });

//     await mobileAds().initialize();

//     this.initialized = true;

//     console.log("Ads SDK initialized");
//   }

//   getBannerSize() {
//     return BannerAdSize.ADAPTIVE_BANNER;
//   }

//   loadInterstitial() {
//     this.interstitial = InterstitialAd.createForAdRequest(this.interstitialId);

//     this.interstitial.load();
//   }

//   showInterstitial(): Promise<boolean> {
//     return new Promise((resolve) => {
//       if (!this.interstitial) {
//         resolve(false);
//         return;
//       }

//       const unsubscribe = this.interstitial.addAdEventListener(
//         AdEventType.CLOSED,
//         () => {
//           unsubscribe();
//           this.loadInterstitial();
//           resolve(true);
//         },
//       );

//       if (this.interstitial.loaded) {
//         this.interstitial.show();
//       } else {
//         resolve(false);
//       }
//     });
//   }

//   loadRewarded() {
//     this.rewarded = RewardedAd.createForAdRequest(this.rewardedId);

//     this.rewarded.load();
//   }

//   showRewarded(onReward: (amount: number) => void): Promise<boolean> {
//     return new Promise((resolve) => {
//       if (!this.rewarded) {
//         resolve(false);
//         return;
//       }

//       const rewardSub = this.rewarded.addAdEventListener(
//         RewardedAdEventType.EARNED_REWARD,
//         (reward) => {
//           onReward(reward.amount);
//         },
//       );

//       const closeSub = this.rewarded.addAdEventListener(
//         AdEventType.CLOSED,
//         () => {
//           rewardSub();
//           closeSub();
//           this.loadRewarded();
//           resolve(true);
//         },
//       );

//       if (this.rewarded.loaded) {
//         this.rewarded.show();
//       } else {
//         resolve(false);
//       }
//     });
//   }
// }

// export default AdsService.getInstance();
