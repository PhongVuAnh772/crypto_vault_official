enum NavigationStackKey {
  AuthStack = "AuthStack",
  HomeStack = "HomeStack",
  CreateWalletStack = "CreateWalletStack",
  RestoreWalletStack = "RestoreWalletStack",
  PinCodeStack = "PinCodeStack",
}

enum AuthStackScreenKey {
  SplashScreen = "SplashScreen",
  OnboardingScreen = "OnboardingScreen",
  CreatePinCode = "CreatePinCode",
  RePinCode = "RePinCode",
  CreateNewWallet = "CreateNewWallet",
  CongratulationCreateWallet = "CongratulationCreateWallet",
  ImportPassphase = "ImportPassphase",
}

enum HomeStackScreenKey {
  BottomTab = "BottomTab",
  TonSendCoin = "TonSendCoin",
}

enum CreateWalletStackScreenKey {
  RecoveryPhraseWarning = "RecoveryPhraseWarning",
  SecretPhrase = "SecretPhrase",
  ConfirmSecretPhrase = "ConfirmSecretPhrase",
}
enum PinCodeStackScreenKey {
  CreatePin = "CreatePin",
  ReEnterPin = "ReEnterPin",
}
enum RestoreWalletStackScreenKey {
  RestoreWallet = "RestoreWallet",
}

enum BottomTabScreenKey {
  Crypto = "Crypto",
  NFTCollection = "NFT Collection",
  Transaction = "Transaction",
  Explore = "Explore",
  Setting = "Setting",
}
enum RezPointStackScreenKey {
  RezPointMainScreen = "RezPointMainScreen",
  RezPointSignIn = "RezPointSignIn",
  RezPointHistoryScreen = "RezPointHistoryScreen",
  PersonalInformation = "PersonalInformation",
  PointHistory = "PointHistory",
  AboutRezPoint = "AboutRezPoint",
  EmailVerification = "EmailVerification",
  EmailVerifiedSuccessfully = "EmailVerifiedSuccessfully",
}

enum BottomTabBarName {
  Home = "Trang chủ",
  Trending = "Thịnh hành",
  Swap = "Hoán đổi",
  Earn = "Earn",
  Discover = "Khám phá",
}
export {
  AuthStackScreenKey,
  BottomTabBarName,
  BottomTabScreenKey,
  CreateWalletStackScreenKey,
  HomeStackScreenKey,
  NavigationStackKey,
  PinCodeStackScreenKey,
  RestoreWalletStackScreenKey,
  RezPointStackScreenKey,
};
