import { RouteProp, useRoute } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { EdgeInsets } from 'react-native-safe-area-context';
import AppToastType from 'src/core/enum/AppToastType';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppSelector } from 'src/core/redux/hooks';
import { getThemeMode } from 'src/core/redux/slice/app.slice';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';
import { ReceiveParamListType } from 'src/navigation/stacks/type/ReceiveParamListType';

type ReceiveProp = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.Receive
>;

const useReceive = () => {
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const insets: EdgeInsets = useAppSafeAreaInsets();
    const receiveData: ReceiveParamListType = useRoute<ReceiveProp>()?.params;
    const { t } = useTranslation();
    const theme = useAppTheme();
    const themMode = useAppSelector(getThemeMode);

    const hederTitle = `${t(LanguageKey.common_text_receive)} ${
        receiveData?.currency
    }`;

    let address =
        receiveData?.address && receiveData?.address !== ''
            ? receiveData.address
            : 'Red x';

    const copyAction = () => {
        Clipboard.setStringAsync(address);
        Utils.showToast({
            msg: t(LanguageKey.common_copied),
            type: AppToastType.success,
        });
    };

    return { theme, address, hederTitle, copyAction, themMode, newUI, insets };
};

export default useReceive;
