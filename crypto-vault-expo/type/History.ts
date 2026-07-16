import { CoinType } from "src/core/enum/CoinType";
import TonEventType from "src/core/enum/TonEventType";
import {
  TransactionStatusType,
  TransactionType,
} from "src/core/enum/TransactionType";
import { ListCryptoDataType } from "src/core/redux/type/token.type";
import { NftTonNewItem } from "src/navigation/stack/type/TonServiceType";
import { ProtocolDataWithSupportedTokensFormBEType } from "./ProtocolType";

export interface TransactionHistoryDataType
  extends TransactionHistoryDataBaseType {
  multipleTransactionData?: TransactionHistoryDataBaseType[];
  isMultipleTransaction?: boolean;
}

type TransactionHistoryDataBaseType = {
  id?: string;
  txHash?: string;
  amountSend: number;
  fee?: number;
  adminPercent?: number;
  adminFee?: number;
  adminAddress?: string;
  toAddress?: string;
  createdAt?: string;
  type?: TransactionType;
  confirmations?: number;
  coinType: CoinType;
  from?: string;
  to?: string;
  memo?: string;
  tokenId?: number;
  estimatedGasFee?: number;
  onViewScan?: () => void;
  isSendNFT?: boolean;
  totalNFT?: string;
  protocolData?: ProtocolDataWithSupportedTokensFormBEType;
  totalAmount?: number;
  receiverWalletAddress?: string;
  claimDate?: string;
  token?: Omit<ListCryptoDataType, "id">;
  tokenSymbol?: string;
  isNative?: boolean;
  isShowDefaults?: boolean;
  isAdminFee?: boolean;
  tokenReceiverWalletAddress?: string;
  updatedAt?: string;
  amount?: number;
  decimal?: number;
  nativeDecimal?: number;
  tokenTransferType?: TonEventType;
  status?: TransactionStatusType;
  quantity?: string;
  logoUri?: string;
  amountNFT?: string;
  nftAddress?: string;
  backToTop?: boolean;
  nftMetadata?: NftTonNewItem | null;
  amountTonAttachedSmartExc?: number | string;
};

export type TransactionHistoryClaimType = {
  id?: string;
  txHash: string;
  amountSend: number;
  fee?: number;
  adminPercent?: number;
  adminFee?: number;
  adminAddress?: string;
  toAddress?: string;
  createdAt?: string;
  type?: TransactionType;
  confirmations?: number;
  coinType: CoinType;
  from?: string;
  to?: string;
  memo?: string;
  tokenId?: number;
  estimatedGasFee?: number;
  onViewScan?: () => void;
  isSendNFT?: boolean;
  totalNFT?: string;
  protocolData?: ProtocolDataWithSupportedTokensFormBEType;
  totalAmount?: number;
  receiverWalletAddress?: string;
  claimDate?: string;
  token?: ListCryptoDataType;
  tokenSymbol?: string;
  isNative?: boolean;
  isShowDefaults?: boolean;
  isAdminFee?: boolean;
  tokenReceiverWalletAddress?: string;
  updatedAt?: string;
  amount: number;
  tokenTransferType?: TonEventType;
};

export type HistorySectionDataType = {
  title: string;
  data: TransactionHistoryDataType[];
};
