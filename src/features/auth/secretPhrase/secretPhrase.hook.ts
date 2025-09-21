import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EdgeInsets } from 'react-native-safe-area-context';
import AppToastType from 'src/core/enum/AppToastType';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppSelector } from 'src/core/redux/hooks';
import { getTemporaryMnemonic } from 'src/core/redux/slice/account.slice';
import { getThemeMode } from 'src/core/redux/slice/app.slice';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { CreateWalletStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

export const BOTTOM_SHEET_MAX_HEIGHT = Utils.BOTTOM_SHEET_MAX_HEIGHT;
export const BOTTOM_SHEET_MIN_HEIGHT = Utils.BOTTOM_SHEET_MIN_HEIGHT;
export const MAX_UPWARD_TRANSLATE_Y =
    BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT;
export const MAX_DOWNWARD_TRANSLATE_Y = 0;
export const DRAG_THRESHOLD = 70;

const useSecretPhrase = ({ navigation }: RootNavigationType) => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const mnemonic = useAppSelector(getTemporaryMnemonic) ?? '';
    const insets: EdgeInsets = useAppSafeAreaInsets();
    const mnemonicData = mnemonic.split(' ');
    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);
    const themeMode = useAppSelector(getThemeMode);
    const theme = useAppTheme();
    const { t } = useTranslation();
    const [widthView, setWidthView] = useState(Utils.screenWidth);
    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setWidthView(width);
    };
    const continueAction = () =>
        navigation.navigate(CreateWalletStackScreenKey.ConfirmSecretPhrase);

    const copyAction = () => {
        Clipboard.setStringAsync(mnemonic);
        Utils.showToast({
            msg: t(LanguageKey.common_copied),
            type: AppToastType.success,
        });
    };

    return {
        mnemonicData,
        continueAction,
        copyAction,
        onToggleSwitch,
        handleLayout,
        isSwitchOn,
        themeMode,
        theme,
        insets,
        widthView,
        newUI,
    };
};

export default useSecretPhrase;
