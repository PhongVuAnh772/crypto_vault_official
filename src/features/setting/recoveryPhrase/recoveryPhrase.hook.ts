import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { appImages } from 'src/core/constants/AppImages';
import AppToastType from 'src/core/enum/AppToastType';
import ThemeKey from 'src/core/enum/ThemeKey';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import AppI18Next from 'src/core/locales';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppSelector } from 'src/core/redux/hooks';
import { useAccount } from 'src/core/redux/slice/account.selector';
import { getThemeMode } from 'src/core/redux/slice/app.slice';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import useStyle from './recoveryPhrase.style';

export const usePhrase = () => {
    const currentWallet = useAccount();
    const mnemonicData = currentWallet?.mnemonic?.split(' ');
    const theme: AppThemeType = useAppTheme();
    const insets = useAppSafeAreaInsets();
    const styles = useStyle(theme, insets);
    const [widthView, setWidthView] = useState(Utils.screenWidth);

    const themeMode = useAppSelector(getThemeMode);
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const copyAction = () => {
        Clipboard.setStringAsync(currentWallet?.mnemonic ?? '');
        Utils.showToast({
            msg: AppI18Next.t(LanguageKey.common_copied),
            type: AppToastType.success,
        });
    };
    const backgroundWithTheme =
        themeMode === ThemeKey.dark
            ? appImages.background1Dark
            : appImages.background1;

    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setWidthView(width);
    };
    return {
        theme,
        styles,
        copyAction,
        mnemonicData,
        newUI,
        backgroundWithTheme,
        widthView,
        handleLayout,
    };
};
