import messaging from "@react-native-firebase/messaging";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import * as React from "react";
import AccountListener from "src/components/layout/AccountListener";
import HideHeaderStack from "src/components/layout/HideHeaderStack";
import { useAppDispatch } from "src/core/redux/hooks";
import ChatScreen from "src/features/chat";
import BitcoinScreen from "src/features/coinDetails/bitcoin/bitcoin.coinDetails.view";
import JettonScreen from "src/features/coinDetails/jetton/jetton.coinDetails.view";
import TonScreen from "src/features/coinDetails/ton/ton.coinDetails.view";
import AddCustomTokenWrapper from "src/features/home/addCustomToken/index.view";
import AIDetailScreen from "src/features/home/AIDetail/AIDetail.view";
import NFTCollectionContainerScreen from "src/features/home/bottomTab/NFTCollection";
import NFTMarketplaceScreen from "src/features/home/bottomTab/NFTMarketplace/NFTMarketplace.view";
import ConnectionScreen from "src/features/home/connected";
import DepositOptionsScreen from "src/features/home/deposit/index.view";
import P2PMarketScreen from "src/features/home/p2pMarket/index.view";
import P2PBuyDetailScreen from "src/features/home/p2pMarket/buyDetail/index.view";
import P2POrderDetailsScreen from "src/features/home/p2pMarket/orderDetails/index.view";
import SelectTokenEVM from "src/features/home/evm/selectToken/selectToken.view";
import TokenDetailEVM from "src/features/home/evm/tokenDetail/token.detail.view";
import ManageCryptoScreen from "src/features/home/manageCrypto/manageCrypto.view";
import AddProtocol from "src/features/home/manageProtocol/addProtocol/addProtocol.view";
import MoreActionScreen from "src/features/home/moreAction/index.view";
import NFTConfirmationSend from "src/features/home/NFTCollection/evm/NFTConfirmationSendNFT/NFTConfirmationSendNFT.view";
import NFTDetail from "src/features/home/NFTCollection/evm/NFTDetail/NFTDetail.view";
import NFTImport from "src/features/home/NFTCollection/evm/NFTImport/NFTImport.view";
import NFTList from "src/features/home/NFTCollection/evm/NFTList/NFTList.view";
import NFTSend from "src/features/home/NFTCollection/evm/NFTSend/NFTSend.view";
import NFTTonConfirmationSend from "src/features/home/NFTCollection/ton/NFTConfirmationSend/NFTConfirmationSend.view";
import NFTTonImport from "src/features/home/NFTCollection/ton/NFTImport/NFTTonImport.view";
import NFTTonList from "src/features/home/NFTCollection/ton/NFTList/NFTTonList.view";
import NFTTonSend from "src/features/home/NFTCollection/ton/NFTSend/NFTTonSend.view";
import NFTTonSendDetail from "src/features/home/NFTCollection/ton/NFTSendDetail/NFTSendDetail.view";
import NFTTonDetail from "src/features/home/NFTCollection/ton/NFTTonDetail/NFTTonDetail.view";
import NFTMarketplaceCollectionDetailScreen from "src/features/home/NFTCollectionDetail";
import ProjectDetailsWrapper from "src/features/home/projectDetails";
import ClaimDetailList from "src/features/home/projectDetails/ClaimDetailList/ClaimDetailList.view";
import ConfirmClaimToken from "src/features/home/projectDetails/confirm/confirmClaimToken.view";
import NFTYouOwnList from "src/features/home/projectDetails/NFTYouOwn/NFTYouOwn.view";
import PriceFeedList from "src/features/home/projectDetails/PriceFeedList/PriceFeedList.view";
import TransactionClaimDetail from "src/features/home/projectDetails/transactionDetails/TransactionDetails.view";
import TransactionProjectDetails from "src/features/home/projectDetails/transactionDetails/TransactionProjectDetails.view";
import ScanScreen from "src/features/home/scan/scan.view";
import Top10EVMs from "src/features/home/Top10/EVMs/evm.view";
import Top10Tokens from "src/features/home/Top10/Tokens/tokens.view";
import NFTCollectionStats from "src/features/home/UnAddedNFTs/NFTCollectionStats/NFTCollectionStats.view";
import NFTUnAddedDetail from "src/features/home/UnAddedNFTs/NFTDetail/index.view";
import MintNftScreen from "src/features/mint/MintNftScreen";
import NotificationDetail from "src/features/notifications/notificationDetails.view";
import NotificationList from "src/features/notifications/notifications.view";
import ReceiveScreen from "src/features/receive/receive.view";
import ScanEvmScreen from "src/features/scanEvm/scan.view";
import SelectTokenScreen from "src/features/selectToken/selectToken.view";
import AboutUs from "src/features/setting/aboutus/aboutus.view";
import AboutUsDetail from "src/features/setting/aboutusdetail/aboutus.detail.view";
import ChangeLanguageScreen from "src/features/setting/changelanguage/changeLanguage.view";
import ChangePincodeScreen from "src/features/setting/changepincode/change.pincode.view";
import Contact from "src/features/setting/contact/contact.view";
import ContactSuccess from "src/features/setting/contactsuccess/contact.success.view";
import CurrencyScreen from "src/features/setting/currency/currency.view";
import FAQ from "src/features/setting/faq/faq.view";
import FAQDetail from "src/features/setting/faqdetail/faq.detail.view";
import PhraseScreen from "src/features/setting/recoveryPhrase";
import SwapView from "src/features/swap";
import GuidingSwapView from "src/features/swap/guiding/guiding.view";
import TransactionHistorySwapDetailView from "src/features/swap/historyDetail/historyDetail.view";
import BrowseScreen from "src/features/tonConnect/brower";
import DAppBrowserScreen from "src/features/tonConnect/dAppBrower";
import { TonConnectKey } from "src/features/tonConnect/enum/TonConnectKey";
import {
  setModalConnect,
  setType,
  setURL,
} from "src/features/tonConnect/slice/tonConnect.slice";
import TransactionDetails from "src/features/transactionDetials/transactionDetails.view";
import TransferScreen from "src/features/transfer/transfer.view";
import TradingScreen from "src/features/trading/TradingScreen";
import TradingDetailScreen from "src/features/trading/TradingDetailScreen";
import OfferwallScreen from "src/features/offerwall/OfferwallScreen";
import FeedScreen from "src/features/socialFeed/FeedScreen";
import LiveBroadcastScreen from "src/features/socialFeed/LiveBroadcastScreen";
import LiveViewerScreen from "src/features/socialFeed/LiveViewerScreen";
import SocialProfileScreen from "src/features/socialFeed/SocialProfileScreen";
import CreatePostScreen from "src/features/socialFeed/CreatePostScreen";
import PostDetailScreen from "src/features/socialFeed/PostDetailScreen";
import AuctionDetailScreen from "src/features/marketplace/AuctionDetailScreen";
import BidHistoryScreen from "src/features/marketplace/BidHistoryScreen";
import ConnectWalletScreen from "src/features/marketplace/ConnectWalletScreen";
import CreateAuctionScreen from "src/features/marketplace/CreateAuctionScreen";
import CreateNFTScreen from "src/features/marketplace/CreateNFTScreen";
import MarketplaceHomeScreen from "src/features/marketplace/HomeScreen";
import MyNFTsScreen from "src/features/marketplace/MyNFTsScreen";
import NFTDetailScreen from "src/features/marketplace/NFTDetailScreen";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { HomeStackParamListType } from "../type/HomeStackParamListType";
import { rootNavigate } from "../type/RootParamListType";
import BottomTab from "./bottomTab";

const Stack = createNativeStackNavigator<HomeStackParamListType>();

const HomeStack = () => {
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp((remoteMessage) => {
        if (remoteMessage) {
          const redirect = remoteMessage?.data?.redirect as string;
          const key = (remoteMessage?.data?.key as string) || undefined;
          rootNavigate(redirect, { prop: key });
        }
      });
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          const redirect = remoteMessage?.data?.redirect as string;
          const key = (remoteMessage?.data?.key as string) || undefined;
          rootNavigate(redirect, { prop: key });
        }
      });
    Linking.getInitialURL().then((url) => {
      if (url) {
        const parsed = Linking.parse(url);
        if (parsed.queryParams?.id && parsed.queryParams?.r) {
          const r = parsed.queryParams.r as string;
          const id = parsed.queryParams.id as string;
          const request = JSON.parse(decodeURIComponent(r));
          const version = Number(parsed.queryParams.v);
          dispatch(setType(TonConnectKey.eventConnect));
          dispatch(setURL({ id, request, version }));
          dispatch(setModalConnect(true));
        }
      }
    });
    return () => {
      unsubscribeOnNotificationOpenedApp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <HideHeaderStack initialRouteName={HomeStackScreenKey.BottomTab}>
        <Stack.Screen
          name={HomeStackScreenKey.BottomTab}
          component={BottomTab}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ChatScreen}
          component={ChatScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.MintNftScreen}
          component={MintNftScreen}

        />
        <Stack.Screen
          name={HomeStackScreenKey.MoreActionScreen}
          component={MoreActionScreen}
        />

        <Stack.Screen
          name={HomeStackScreenKey.Transfer}
          component={TransferScreen}
        />
        <Stack.Screen name={HomeStackScreenKey.Ton} component={TonScreen} />
        <Stack.Screen
          name={HomeStackScreenKey.Jetton}
          component={JettonScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.TransactionDetails}
          component={TransactionDetails}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTDetail}
          component={NFTDetail}
        />
        <Stack.Screen name={HomeStackScreenKey.NFTList} component={NFTList} />
        <Stack.Screen
          name={HomeStackScreenKey.NFTImport}
          component={NFTImport}
        />
        <Stack.Screen name={HomeStackScreenKey.NFTSend} component={NFTSend} />
        <Stack.Screen
          name={HomeStackScreenKey.NFTConfirmationSend}
          component={NFTConfirmationSend}
        />
        <Stack.Screen name={HomeStackScreenKey.AboutUs} component={AboutUs} />
        <Stack.Screen name={HomeStackScreenKey.Contact} component={Contact} />
        <Stack.Screen name={HomeStackScreenKey.FAQ} component={FAQ} />
        <Stack.Screen
          name={HomeStackScreenKey.AboutUsDetail}
          component={AboutUsDetail}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ContactSuccess}
          component={ContactSuccess}
        />
        <Stack.Screen
          name={HomeStackScreenKey.FAQDetail}
          component={FAQDetail}
        />
        <Stack.Screen
          name={HomeStackScreenKey.Receive}
          component={ReceiveScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.RecoveryPhrase}
          component={PhraseScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ManageCrypto}
          component={ManageCryptoScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.Currency}
          component={CurrencyScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ChangeLanguage}
          component={ChangeLanguageScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ChangePincode}
          component={ChangePincodeScreen}
          options={{
            animation: "fade",
          }}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NotificationDetail}
          component={NotificationDetail}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ProjectDetail}
          component={ProjectDetailsWrapper}
        />
        <Stack.Screen
          name={HomeStackScreenKey.Bitcoin}
          component={BitcoinScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.AddProtocol}
          component={AddProtocol}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NotificationList}
          component={NotificationList}
        />
        <Stack.Screen
          name={HomeStackScreenKey.SelectTokenEVM}
          component={SelectTokenEVM}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ConfirmClaimToken}
          component={ConfirmClaimToken}
        />
        <Stack.Screen
          name={HomeStackScreenKey.PriceFeedList}
          component={PriceFeedList}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTYouOwnList}
          component={NFTYouOwnList}
        />
        <Stack.Screen
          name={HomeStackScreenKey.TransactionClaimDetail}
          component={TransactionClaimDetail}
        />
        <Stack.Screen
          name={HomeStackScreenKey.TransactionProjectDetails}
          component={TransactionProjectDetails}
        />
        <Stack.Screen
          name={HomeStackScreenKey.TokenDetailEVM}
          component={TokenDetailEVM}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ClaimDetailList}
          component={ClaimDetailList}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTCollectionStats}
          component={NFTCollectionStats}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTUnAddedDetail}
          component={NFTUnAddedDetail}
        />

        <Stack.Screen
          name={HomeStackScreenKey.SelectToken}
          component={SelectTokenScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTTonDetail}
          component={NFTTonDetail}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTTonList}
          component={NFTTonList}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTTonImport}
          component={NFTTonImport}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTTonSend}
          component={NFTTonSend}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTTonSendDetail}
          component={NFTTonSendDetail}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTTonConfirmationSend}
          component={NFTTonConfirmationSend}
        />
        <Stack.Screen
          name={HomeStackScreenKey.AddCustomToken}
          component={AddCustomTokenWrapper}
        />
        <Stack.Screen
          name={HomeStackScreenKey.DepositOptions}
          component={DepositOptionsScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.P2PMarket}
          component={P2PMarketScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.P2PBuyDetail}
          component={P2PBuyDetailScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.P2POrderDetails}
          component={P2POrderDetailsScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.Top10Tokens}
          component={Top10Tokens}
        />
        <Stack.Screen
          name={HomeStackScreenKey.Top10EVMs}
          component={Top10EVMs}
        />
        <Stack.Screen name={HomeStackScreenKey.Swap} component={SwapView} />
        <Stack.Screen
          name={HomeStackScreenKey.TransactionHistorySwapDetail}
          component={TransactionHistorySwapDetailView}
        />
        <Stack.Screen
          name={HomeStackScreenKey.GuidingSwap}
          component={GuidingSwapView}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ScanScreen}
          component={ScanScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.DAppBrowserScreen}
          component={DAppBrowserScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ConnectionScreen}
          component={ConnectionScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.BrowseScreen}
          component={BrowseScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ScanEvm}
          component={ScanEvmScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTMarketplace}
          component={NFTMarketplaceScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTCollection}
          component={NFTCollectionContainerScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.AIDetailScreen}
          component={AIDetailScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTMarketplaceCollectionDetail}
          component={NFTMarketplaceCollectionDetailScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.Trading}
          component={TradingScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.TradingDetail}
          component={TradingDetailScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.Offerwall}
          component={OfferwallScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.FeedScreen}
          component={FeedScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.LiveBroadcastScreen}
          component={LiveBroadcastScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.LiveViewerScreen}
          component={LiveViewerScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.SocialProfileScreen}
          component={SocialProfileScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.CreatePostScreen}
          component={CreatePostScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.PostDetailScreen}
          component={PostDetailScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.MarketplaceHomeScreen}
          component={MarketplaceHomeScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.ConnectWalletScreen}
          component={ConnectWalletScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.CreateNFTScreen}
          component={CreateNFTScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.MyNFTsScreen}
          component={MyNFTsScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.NFTDetailScreen}
          component={NFTDetailScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.CreateAuctionScreen}
          component={CreateAuctionScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.AuctionDetailScreen}
          component={AuctionDetailScreen}
        />
        <Stack.Screen
          name={HomeStackScreenKey.BidHistoryScreen}
          component={BidHistoryScreen}
        />
      </HideHeaderStack>
      <AccountListener />
    </>
  );
};
export default HomeStack;
