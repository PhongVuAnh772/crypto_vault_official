import { NFTConfirmationSendParamsType } from "src/features/home/NFTCollection/evm/NFTSend/NFTSend.type";
import { FAQData } from "src/features/setting/faq/faq.type";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { NotificationDetailParamListType } from "./NotificationDetailParamListType";
import { ReceiveParamListType } from "./ReceiveParamListType";

import {
  SupportedNativeTokenWithProtocol,
  SupportedTokenItemWithProtocol,
} from "src/core/redux/slice/customToken/addCustomToken.type";
import {
  NFTCollection,
  NFTData,
  NFTTonCollection,
} from "src/core/redux/slice/NFT/NFTImport.type";
import { ListCryptoDataType } from "src/features/home/home.type";
import { NFTSendConfirmationRouteProp } from "src/features/home/NFTCollection/ton/NFTConfirmationSend/NFTConfirmationSend.hook";
import { NFTTonData } from "src/features/home/NFTCollection/ton/NFTImport/NFTTonImport.type";
import { NFTTonSendDetailType } from "src/features/home/NFTCollection/ton/NFTSendDetail/NFTSendDetail.type";
import { HistoryViewDetailTransactionProps } from "src/features/swap/historyDetail/historyDetail.type";
import { TonConnectDAppBrowserParams } from "src/features/tonConnect/dAppBrower/jsBridge/types";
import { TransactionDetailsProps } from "./HomeParamListType";
import { JettonParamListType } from "./JettonParamListType";
import { NFTUnAddedDetailParamListType } from "./NFTUnAddedDetailPropsType";
import { TransferParamListType } from "./TransferParamListType";

export type HomeStackParamListType = {
  [HomeStackScreenKey.BottomTab]: undefined;
  [HomeStackScreenKey.Transfer]: TransferParamListType;
  [HomeStackScreenKey.Bitcoin]: undefined;
  [HomeStackScreenKey.Ton]: undefined;
  [HomeStackScreenKey.Jetton]: JettonParamListType;
  [HomeStackScreenKey.ManageCrypto]: undefined;
  [HomeStackScreenKey.TransactionDetails]: TransactionDetailsProps;
  [HomeStackScreenKey.AboutUs]: undefined;
  [HomeStackScreenKey.AboutUsDetail]: undefined;
  [HomeStackScreenKey.Contact]: undefined;
  [HomeStackScreenKey.FAQ]: undefined;
  [HomeStackScreenKey.ContactSuccess]: undefined;
  [HomeStackScreenKey.FAQDetail]: FAQData;
  [HomeStackScreenKey.Receive]: ReceiveParamListType;
  [HomeStackScreenKey.RecoveryPhrase]: ReceiveParamListType;
  [HomeStackScreenKey.Currency]: undefined;
  [HomeStackScreenKey.ChangeLanguage]: ReceiveParamListType;
  [HomeStackScreenKey.ChangePincode]: ReceiveParamListType;
  [HomeStackScreenKey.NFTDetail]: NFTData;
  [HomeStackScreenKey.NFTList]: NFTCollection;
  [HomeStackScreenKey.MoreActionScreen]: undefined;
  [HomeStackScreenKey.NFTImport]: undefined;
  [HomeStackScreenKey.NFTSend]: NFTData;
  [HomeStackScreenKey.NFTConfirmationSend]: NFTConfirmationSendParamsType;
  [HomeStackScreenKey.NotificationList]: undefined;
  [HomeStackScreenKey.NotificationDetail]: NotificationDetailParamListType;
  [HomeStackScreenKey.ProjectDetail]: undefined;
  [HomeStackScreenKey.AddProtocol]: undefined;
  [HomeStackScreenKey.ChatScreen]: undefined;
  [HomeStackScreenKey.SelectTokenEVM]:
    | SupportedTokenItemWithProtocol
    | SupportedNativeTokenWithProtocol;
  [HomeStackScreenKey.ConfirmClaimToken]: undefined;
  [HomeStackScreenKey.NFTYouOwnList]: undefined;
  [HomeStackScreenKey.PriceFeedList]: undefined;
  [HomeStackScreenKey.TransactionClaimDetail]: undefined;
  [HomeStackScreenKey.TransactionProjectDetails]: undefined;
  [HomeStackScreenKey.TokenDetailEVM]: ListCryptoDataType;
  [HomeStackScreenKey.ClaimDetailList]: undefined;
  [HomeStackScreenKey.NFTCollectionStats]: undefined;
  [HomeStackScreenKey.NFTUnAddedDetail]: NFTUnAddedDetailParamListType;
  [HomeStackScreenKey.SelectToken]: undefined;
  [HomeStackScreenKey.NFTTonDetail]: NFTTonData;
  [HomeStackScreenKey.NFTTonList]: NFTTonCollection;
  [HomeStackScreenKey.NFTTonImport]: undefined;
  [HomeStackScreenKey.NFTTonSend]: NFTTonData;
  [HomeStackScreenKey.NFTTonSendDetail]: NFTTonSendDetailType;
  [HomeStackScreenKey.NFTTonConfirmationSend]: NFTSendConfirmationRouteProp;
  [HomeStackScreenKey.AddCustomToken]: undefined;
  [HomeStackScreenKey.Top10Tokens]: undefined;
  [HomeStackScreenKey.Top10EVMs]: undefined;
  [HomeStackScreenKey.Swap]: undefined;
  [HomeStackScreenKey.TransactionHistorySwapDetail]: HistoryViewDetailTransactionProps;
  [HomeStackScreenKey.GuidingSwap]: undefined;
  [HomeStackScreenKey.ScanScreen]: undefined;
  [HomeStackScreenKey.DAppBrowserScreen]: TonConnectDAppBrowserParams;
  [HomeStackScreenKey.ConnectionScreen]: undefined;
  [HomeStackScreenKey.BrowseScreen]: undefined;
  [HomeStackScreenKey.Scan]: undefined;
  [HomeStackScreenKey.ScanEvm]: undefined;
  [HomeStackScreenKey.MintNftScreen]: undefined;
  [HomeStackScreenKey.NFTMarketplace]: undefined;
  [HomeStackScreenKey.NFTCollection]: undefined;
  [HomeStackScreenKey.AIDetailScreen]: { imageUri?: string, title?: string };
  [HomeStackScreenKey.NFTMarketplaceCollectionDetail]: { collection: any };
  [HomeStackScreenKey.DepositOptions]: undefined;
  [HomeStackScreenKey.P2PMarket]: undefined;
  [HomeStackScreenKey.P2PBuyDetail]: { 
    merchant: {
      name: string;
      avatar: string;
      completionRate: string;
      price: string;
      limitMin: number;
      limitMax: number;
      currency: string;
      payments: string[];
    };
    token: {
      symbol: string;
    };
    tradeType: "BUY" | "SELL";
  };
  [HomeStackScreenKey.P2POrderDetails]: {
    orderId: string;
    amountFiat: string;
    amountCrypto: string;
    currency: string;
    tokenSymbol: string;
    merchant: {
      name: string;
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
    };
    expiryTime: number; // timestamp
  };
  [HomeStackScreenKey.Trading]: undefined;
  [HomeStackScreenKey.TradingDetail]: { symbol: string };
  [HomeStackScreenKey.Offerwall]: undefined;
};
