import walletConnectConstants from "../constants/WalletConnectConstants";

export const getMetadata = () => {
    return {
        name: walletConnectConstants.appName,
        description: walletConnectConstants.descriptionApp,
        url: walletConnectConstants.urlApp,
        icons: [walletConnectConstants.icons],
        redirect: {
            native:walletConnectConstants.deepLink,
            universal:walletConnectConstants.universalLink,
            linkMode: true,
        },
    };
};