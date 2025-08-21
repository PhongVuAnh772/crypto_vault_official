import VMType from "src/core/enum/VMType";

export type AccountSliceType = {
  protocolListsFromBE?: ProtocolDataFromBEType[];
  protocolListsWithSupportedTokensFromBE?: ProtocolDataWithSupportedTokensFormBEType[];
  selectedProtocolId?: string;
  loading: boolean;
  resetAction: boolean;
  error?: string;
  temporaryMnemonic: string | null;
  pin: string | null;
  selectAccountId?: string;
  accountLists?: AccountType[];
};

export type AccountType = {
  mnemonic: string;
  name: string;
  id: string;
  protocolData: ProtocolDataType[];
  avtColor: string;
  version: number;
};
export type ProtocolDataType = {
  selectedAddressId: string;
  addressList: AddressListItemType[];
  _id: string;
};

export type AddressListItemType = {
  address: string;
  path?: string;
  index: number;
  id: string;
  name: string;
  publicKey: string;
  privateKey: string;
  avtColor: string;
};

export type NativeTokenType = {
  name: string;
  symbol: string;
  decimal: number;
  address: string;
};

export type IconPropsType = {
  width: number;
  height: number;
};
export interface ProtocolDataFromBEType {
  logo?: string;
  name: string;
  VM?: VMType | null | string;
  __v?: number | null;
  slip0044: number;
  _id: string;
  blockExplorerUrl: string;
  transactionScanURL?: string;
  protocolType?: string;
  chainId?: number | null;
  coinTransferFee: number;
  createdAt: string;
  nftTransferFee: number;
  rpcUrl?: string;
  status: "active" | "inactive";
  symbol: string;
  tokenTransferFee: number;
  updatedAt: string;
  beneficiary?: BeneficiaryType;
  commissionContractAddress?: string;
  nativeToken: NativeTokenType;
  price?: number | null;
  isDefault?: boolean;
  walletConnectSupportedChain?: string;
}

export type BeneficiaryType = {
  status: "waiting" | "reject" | "approved";
  walletAddress: string;
};

export type ProtocolListDataAPI = {
  items: ProtocolDataFromBEType[];
};

export type SupportedTokenItemType = {
  _id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  decimal: number;
  protocol: ProtocolDataWithSupportedTokensFormBEType;
  createdAt?: Date;
  updatedAt?: Date;
  logo: string;
  isNativeToken?: boolean;
};
export type SupportedNativeTokenType = {
  decimal: number;
  isNativeToken: boolean;
  logo: string | null;
  name: string;
  symbol: string;
  contractAddress: string;
};

export interface ProtocolDataWithSupportedTokensFormBEType
  extends ProtocolDataFromBEType {
  supportedToken: (SupportedTokenItemType | SupportedNativeTokenType)[];
}
