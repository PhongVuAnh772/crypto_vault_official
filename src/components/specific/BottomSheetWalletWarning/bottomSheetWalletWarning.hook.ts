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
      icon: LockSvgIcon,
      title:
        "Your phrase unlocks your wallet. Anyone with it can take your funds. Keep it safe, keep it private.",
    },

    {
      icon: EditSvgIcon,
      title:
        "It’s like the key to your home. If others get it, they get in. Store it securely and never share.",
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
