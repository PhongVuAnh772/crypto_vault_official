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
        if (wcuri) {
            pair(wcuri);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wcuri]);

    const pair = async (uri: string) => {
        try {
            await walletKit.pair({
                uri: uri,
            });
            navigation.goBack();
        } catch (error) {
            Utils.showToast({
                msg: error + '',
                type: AppToastType.error,
            });
        }
    };

    const onPasteURI = async () => {
        const text = await Clipboard.getStringAsync();
        if (text) {
            pair(text);
        }
    };

    return {
        theme,
        device,
        showCamera,
        isActive,
        codeScanner,
        onPasteURI,
        isSimulator: Utils.checkingEmulator(),
        insets,
        goBack: () => navigation.goBack(),
    };
};
