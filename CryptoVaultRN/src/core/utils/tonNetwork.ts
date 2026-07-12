const TON_MAINNET_API_BASE_URL = "https://tonapi.io";
const TON_TESTNET_API_BASE_URL = "https://testnet.tonapi.io";
const TON_MAINNET_VIEWER_URL = "https://tonviewer.com/";
const TON_TESTNET_VIEWER_URL = "https://testnet.tonviewer.com/";
const TON_MAINNET_VIEWER_TX_URL = "https://tonviewer.com/transaction/";
const TON_TESTNET_VIEWER_TX_URL = "https://testnet.tonviewer.com/transaction/";

let tonIsTestnet = true;

export const setTonIsTestnet = (value: boolean) => {
  tonIsTestnet = !!value;
};

export const getTonIsTestnet = () => tonIsTestnet;

export const getTonApiBaseUrl = () =>
  tonIsTestnet ? TON_TESTNET_API_BASE_URL : TON_MAINNET_API_BASE_URL;

export const getTonViewerUrl = () =>
  tonIsTestnet ? TON_TESTNET_VIEWER_URL : TON_MAINNET_VIEWER_URL;

export const getTonViewerTransactionUrl = () =>
  tonIsTestnet ? TON_TESTNET_VIEWER_TX_URL : TON_MAINNET_VIEWER_TX_URL;
