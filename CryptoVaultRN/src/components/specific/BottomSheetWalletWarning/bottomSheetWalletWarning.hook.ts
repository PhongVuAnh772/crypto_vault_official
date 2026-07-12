import { EdgeInsets } from "react-native-safe-area-context";
import {
  CloseSvgIcon,
  EditSvgIcon,
  LockSvgIcon,
  Save2SvgIcon,
} from "src/core/constants/AppIconsSvg";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import GlobalUtils from "src/core/utils/globalUtils";
import { bottomSheetPhraseType } from "./bottomSheetWalletWarning.type";

const useBottomSheetWallet = () => {
  const listBottomSheetPhrase: bottomSheetPhraseType[] = [
    {
      icon: "lock",
      title: LanguageKey.protect_secret_phrase_desc_1,
    },

    {
      icon: "edit-3",
      title: LanguageKey.protect_secret_phrase_desc_2,
    },
  ];
  const theme = useAppTheme();
  const insets: EdgeInsets = useAppSafeAreaInsets();
  return {
    theme,
    listBottomSheetPhrase,
    insets,
  };
};
export default useBottomSheetWallet;
