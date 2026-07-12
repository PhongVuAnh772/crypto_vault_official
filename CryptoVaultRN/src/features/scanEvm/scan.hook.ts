import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
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
    const [manualUri, setManualUri] = useState<string>('');
    const [isSimulator, setIsSimulator] = useState<boolean>(false);
    const isActive = useIsFocused();

    const extractWalletConnectUri = (raw: string) => {
        if (!raw) return null;
        const cleaned = raw.trim();
        const decoded = cleaned.includes('%') ? decodeURIComponent(cleaned) : cleaned;
        const wcRegex = /wc:[a-zA-Z0-9-]+@[0-9]+(?:\?[^ ]*)?/;
        const match = decoded.match(wcRegex);
        return match?.[0] ?? null;
    };

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
            if (result) {
                const clip = await Clipboard.getStringAsync();
                const wcUri = extractWalletConnectUri(clip ?? '');
                if (wcUri) {
                    setManualUri(wcUri);
                }
            }
        };
        checkSimulator();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (wcuri) {
            pair(wcuri);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wcuri]);

    useEffect(() => {
        const sub = Linking.addEventListener('url', ({ url }) => {
            const wcUri = extractWalletConnectUri(url);
            if (wcUri) {
                setManualUri(wcUri);
                pair(wcUri);
            }
        });
        return () => sub.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pair = async (uri: string) => {
        try {
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
        if (!text?.trim()) {
            Utils.showToast({
                msg: "Clipboard is empty",
                type: AppToastType.error,
            });
            return;
        }

        const wcUri = extractWalletConnectUri(text);

        if (wcUri) {
            setManualUri(wcUri);
            pair(wcUri);
        } else {
            Utils.showToast({
                msg: "No valid WalletConnect URI found",
                type: AppToastType.error,
            });
        }
    };

    const onConnectManual = () => {
        if (!manualUri?.trim()) {
            Utils.showToast({
                msg: "Please enter a WalletConnect URI",
                type: AppToastType.error,
            });
            return;
        }

        const wcUri = extractWalletConnectUri(manualUri);

        if (wcUri) {
            pair(wcUri);
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
