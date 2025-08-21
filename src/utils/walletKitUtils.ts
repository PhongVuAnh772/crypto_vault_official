import AsyncStorage from "@react-native-async-storage/async-storage";
import { IWalletKit, WalletKit } from "@reown/walletkit";
import { Core } from "@walletconnect/core";
export let walletKit: IWalletKit;

const walletConnectConstants = {
  projectId: "63295b6b2805b9adfde3ae5940cbbdcb",
  appName: "Red X",
  descriptionApp: "App Rex X",
  urlApp: "https://reown.com/walletkit",
  icons:
    "https://fsukoncbtsvzcyujaffo.supabase.co/storage/v1/object/public/redx//logo.jpg",
  deepLink: "io.redx.wallet://",
  universalLink: "",
};

export default walletConnectConstants;

export const getMetadata = () => {
  return {
    name: walletConnectConstants.appName,
    description: walletConnectConstants.descriptionApp,
    url: walletConnectConstants.urlApp,
    icons: [walletConnectConstants.icons],
    redirect: {
      native: walletConnectConstants.deepLink,
      universal: walletConnectConstants.universalLink,
      linkMode: true,
    },
  };
};

export async function createWalletKit() {
  const core = new Core({
    projectId: walletConnectConstants.projectId,
    // relayUrl: relayerRegionURL,
  });
  walletKit = await WalletKit.init({
    core,
    metadata: getMetadata(),
  });

  try {
    const clientId =
      await walletKit.engine.signClient.core.crypto.getClientId();
    console.log("WalletConnect ClientID: ", clientId);
    AsyncStorage.setItem("WALLETCONNECT_CLIENT_ID", clientId);
  } catch (error) {
    console.error(
      "Failed to set WalletConnect clientId in localStorage: ",
      error
    );
  }
}
