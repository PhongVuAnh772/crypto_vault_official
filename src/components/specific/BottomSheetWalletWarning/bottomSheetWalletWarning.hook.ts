import { EdgeInsets } from 'react-native-safe-area-context';
import {
    CloseSvgIcon,
    EditSvgIcon,
    LockSvgIcon,
    Save2SvgIcon,
} from 'src/core/constants/AppIconsSvg';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import GlobalUtils from 'src/core/utils/globalUtils';
import { bottomSheetPhraseType } from './bottomSheetWalletWarning.type';

const useBottomSheetWallet = () => {
    const listBottomSheetPhrase: bottomSheetPhraseType[] = [
        {
            icon: LockSvgIcon,
            title: LanguageKey.des_secret_phrase_title,
        },
        {
            icon: CloseSvgIcon,
            title: LanguageKey.redX_not_save_secret_phrase_title,
        },
        {
            icon: Save2SvgIcon,
            title: LanguageKey.des_save_secret_phrase_title,
        },
        {
            icon: EditSvgIcon,
            title: LanguageKey.store_secret_phrase_in_a_safe_place,
        },
    ];
    const theme = useAppTheme();
    const insets: EdgeInsets = useAppSafeAreaInsets();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    return {
        theme,
        listBottomSheetPhrase,
        insets,
        newUI,
    };
};
export default useBottomSheetWallet;
