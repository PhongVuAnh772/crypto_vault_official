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
  version?: TonWalletVersion;
  publicKey: string;
  privateKey: string;
  avtColor: string;
};

enum TonWalletVersion {
  V5 = "V5",
  V4 = "V4",
}
