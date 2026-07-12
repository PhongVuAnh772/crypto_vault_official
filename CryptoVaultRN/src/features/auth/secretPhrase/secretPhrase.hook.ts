import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TextInput } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import AppToastType from "src/core/enum/AppToastType";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import NativeWalletCoreModule from "src/core/modules/WalletCoreModules/NativeWalletCoreModule";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  getAllAccount,
  getPin,
  getTemporaryMnemonic,
  setTemporaryMnemonic,
} from "src/core/redux/slice/account.slice";
import { getThemeMode } from "src/core/redux/slice/app.slice";
import Utils from "src/core/utils/commonUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import { CreateWalletStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

export const BOTTOM_SHEET_MAX_HEIGHT = Utils.BOTTOM_SHEET_MAX_HEIGHT;
export const BOTTOM_SHEET_MIN_HEIGHT = Utils.BOTTOM_SHEET_MIN_HEIGHT;
export const MAX_UPWARD_TRANSLATE_Y =
  BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT;
export const MAX_DOWNWARD_TRANSLATE_Y = 0;
export const DRAG_THRESHOLD = 70;

const useSecretPhrase = ({ navigation }: RootNavigationType) => {
  const mnemonic = useAppSelector(getTemporaryMnemonic) ?? "";
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const mnemonicData = mnemonic.split(" ");
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);
  const themeMode = useAppSelector(getThemeMode);
  const theme = useAppTheme();
  const { t } = useTranslation();
  const [widthView, setWidthView] = useState(Utils.screenWidth);
  const dispatch = useAppDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSingleInput, setIsSingleInput] = useState(false);
  const [tempPhrase, setTempPhrase] = useState("");
  const [showNmemonic, setShowNmemonic] = useState(false);
  const [secretPhraseInputs, setSecretPhraseInputs] = useState(
    Array(12).fill("")
  );
  const [indexInputFocus, setIndexInputFocus] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const onCloseModal = () => {
    setModalVisible(false);
  };
  const onDismissKeyboard = () => setShowSuggestions(false);

  const [disableButton, setDisableButton] = useState(true);

  const onFocusInput = (index: number) => {
    setIndexInputFocus(index);
    setSuggestions([]);
    if (!showSuggestions) {
      setShowSuggestions(true);
    }
  };

  const isMiddleItem = (index: number): boolean => {
    return index % 3 === 1;
  };

  const handleShow = () => {
    setShowNmemonic(!showNmemonic);
  };
  const handleInputChange = (value: string, index: number) => {
    setSecretPhraseInputs((prev) => {
      const updated = [...prev];
      updated[index] = value.trim();
      return updated;
    });
  };
  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();

      if (!text) {
        Toast.show({
          type: "error",
          text1: "Clipboard trống",
        });
        return;
      }

      const words = text.trim().replace(/\s+/g, " ").split(" ");

      if (words.length !== secretPhraseInputs.length) {
        Toast.show({
          type: "error",
          text1: "Mnemonic không hợp lệ",
          text2: `Cần đủ ${secretPhraseInputs.length} từ`,
        });
        return;
      }

      words.forEach((w, idx) => {
        if (idx < secretPhraseInputs.length) {
          handleInputChange(w, idx);
        }
      });

      setIsSingleInput(false);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);

      Toast.show({
        type: "success",
        text1: "Đã dán mnemonic 🎉",
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Không thể dán từ clipboard",
      });
    }
  };

  const handleRestoreAccount = () => {};
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setWidthView(width);
  };
  const continueAction = () => {
    navigation.navigate(CreateWalletStackScreenKey.ConfirmSecretPhrase);
  };

  const copyAction = () => {
    Clipboard.setStringAsync(mnemonic);
    Utils.showToast({
      msg: t(LanguageKey.common_copied),
      type: AppToastType.success,
    });
  };

  useEffect(() => {
    setSecretPhraseInputs(mnemonic.split(" "));
  }, [mnemonic]);

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
    modalVisible,
    onCloseModal,
    suggestions,
    onDismissKeyboard,
    showSuggestions,
    secretPhraseInputs,
    isMiddleItem,
    onFocusInput,
    disableButton,
    inputRefs,
    indexInputFocus,
    isLoading,
    setWidthView,
    isSingleInput,
    setIsSingleInput,
    tempPhrase,
    setTempPhrase,
    handleShow,
    showNmemonic,
    setShowNmemonic,
    handlePaste,
    handleInputChange,
    handleRestoreAccount,
  };
};

export default useSecretPhrase;
