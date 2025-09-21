import { useFonts } from 'expo-font';
import { StatusBarStyle } from 'expo-status-bar';
import { useTheme } from 'react-native-paper';
import { AppDarkTheme, AppLightTheme } from '../constants/AppTheme';
import fontsConfigure from '../constants/FontConfig';
import ThemeKey from '../enum/ThemeKey';
import { useAppSelector } from '../redux/hooks';
import { getThemeMode } from '../redux/slice/app.slice';
import { AppThemeType } from '../type/ThemeType';
import Utils from '../utils/commonUtils';
import GlobalUtils from '../utils/globalUtils';

const useAppThemeHook = () => {
    const colorSchemeMode = useAppSelector(getThemeMode);
    const isDarkMode = colorSchemeMode === ThemeKey.dark;

    useFonts({
        'MPLUS1-Regular': require('../../assets/fonts/MPLUS1-Regular.ttf'),
        'MPLUS1-Medium': require('../../assets/fonts/MPLUS1-Medium.ttf'),
        'MPLUS1-Bold': require('../../assets/fonts/MPLUS1-Bold.ttf'),
        'MPLUS1-Black': require('../../assets/fonts/MPLUS1-Black.ttf'),
    });
    // useEffect(() => {
    //     const themSubscription = Appearance.addChangeListener(
    //         ({colorScheme}) => {
    //             dispatch(setTheme(colorScheme as ThemeKey));
    //         },
    //     );

    //     return () => themSubscription.remove();
    // }, [dispatch]);

    const barStyleIOS: StatusBarStyle = GlobalUtils.getEnableRedXNewTheme()
        ? ThemeKey.light
        : isDarkMode
          ? ThemeKey.light
          : ThemeKey.dark;
    const barStyleAndroid: StatusBarStyle = isDarkMode
        ? ThemeKey.dark
        : ThemeKey.light;

    const barStyle = Utils.isIos ? barStyleIOS : barStyleAndroid;

    const paperTheme = isDarkMode ? AppDarkTheme : AppLightTheme;

    const fonts = fontsConfigure;

    return { paperTheme, fonts, colorSchemeMode, barStyle };
};

export const useAppTheme: () => AppThemeType = useTheme;

export default useAppThemeHook;
