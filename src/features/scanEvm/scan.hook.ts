import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';
import {
    Code,
    useCameraDevice,
    useCodeScanner,
} from 'react-native-vision-camera';
import AppToastType from 'src/core/enum/AppToastType';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import Utils from 'src/core/utils/commonUtils';
import { walletKit } from 'src/core/utils/WalletKitUtil';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
export const useScan = ({ navigation }: RootNavigationType) => {
    const insets = useAppSafeAreaInsets();
    const theme = useAppTheme();
    const device = useCameraDevice('back');
    const [showCamera] = useState(true);

    const [wcuri, setWcuri] = useState<string>();
    const [manualUri, setManualUri] = useState<string>("wc:b40a0795e65f203fd1137be9b689a0f2dc223cdd3c23db0d5391fe1b1e85d666@2?expiryTimestamp=1775974490&relay-protocol=irn&symKey=f89da6c552128192fea85ebbc3e33c6cc54a3a9bd06c19e450cfaa0f32594d33");
    const [isSimulator, setIsSimulator] = useState<boolean>(false);
    const isActive = useIsFocused();

    const onCodeScanned = (codes: Code[]) => {
        const uri = codes[0].value;
        setWcuri(uri);
    };

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned,
    });
    useEffect(() => {
        const checkSimulator = async () => {
            const result = await Utils.checkingEmulator();
            setIsSimulator(result);
        };
        checkSimulator();
    }, []);

    useEffect(() => {
        if (wcuri) {
            pair(wcuri);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wcuri]);

    const pair = async (uri: string) => {
        try {
            // Check if we are already paired with this URI
            const existingPairings = walletKit.core.pairing.getPairings();
            const alreadyPaired = existingPairings.find(p => p.topic === uri);

            if (alreadyPaired && alreadyPaired.active) {
                console.log("Already paired with this URI, skipping...");
                navigation.goBack();
                return;
            }

            await walletKit.pair({
                uri: uri,
            });
            console.log("Pairing successful");
            navigation.goBack();
        } catch (error: any) {
            console.log("Pairing Error Log:", error);
            // If it's the "Recently deleted" error, it often means the SDK is in a weird state
            // but the pairing might actually have triggered a proposal.
            if (error?.message?.includes('deleted')) {
                Utils.showToast({
                    msg: "Connection record expired. Refresh dApp QR.",
                    type: AppToastType.error,
                });
            } else {
                Utils.showToast({
                    msg: error?.message || "Pairing failed",
                    type: AppToastType.error,
                });
            }
        }
    };

    const onPasteURI = async () => {
        const text = await Clipboard.getStringAsync();
        const cleanedText = text?.trim();

        if (!cleanedText) {
            Utils.showToast({
                msg: "Clipboard is empty",
                type: AppToastType.error,
            });
            return;
        }

        // Use regex to find the first wc: URI in case of concatenation or extra text
        const wcRegex = /wc:[a-zA-Z0-9-]+@[0-9]+(?:\?[^ ]*)?/;
        const match = cleanedText.match(wcRegex);

        if (match) {
            pair(match[0]);
        } else {
            Utils.showToast({
                msg: "No valid WalletConnect URI found",
                type: AppToastType.error,
            });
        }
    };

    const onConnectManual = () => {
        const cleanedText = manualUri?.trim();
        if (!cleanedText) {
            Utils.showToast({
                msg: "Please enter a WalletConnect URI",
                type: AppToastType.error,
            });
            return;
        }

        const wcRegex = /wc:[a-zA-Z0-9-]+@[0-9]+(?:\?[^ ]*)?/;
        const match = cleanedText.match(wcRegex);

        if (match) {
            pair(match[0]);
        } else {
            Utils.showToast({
                msg: "No valid WalletConnect URI found",
                type: AppToastType.error,
            });
        }
    };

    return {
        theme,
        device,
        showCamera,
        isActive,
        codeScanner,
        onPasteURI,
        manualUri,
        setManualUri,
        onConnectManual,
        isSimulator,
        insets,
        goBack: () => navigation.goBack(),
    };
};
