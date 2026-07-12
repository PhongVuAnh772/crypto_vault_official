import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, TextInput } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { RootNavigationType } from "../SplashScreen/index.view";

import {
  AuthStackScreenKey,
  NavigationStackKey,
} from "src/navigation/enum/NavigationKey";
import Toast from "react-native-toast-message";
import * as Clipboard from "expo-clipboard";
import NativeWalletCoreModule from "src/core/modules/WalletCoreModules/NativeWalletCoreModule";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import Utils from "src/core/utils/commonUtils";

const useRestoreWallet = ({ navigation }: RootNavigationType) => {
  const dispatch = useAppDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSingleInput, setIsSingleInput] = useState(true);
  const [tempPhrase, setTempPhrase] = useState("");
  const [showNmemonic, setShowNmemonic] = useState(false);
  const nativeWalletCoreModule = new NativeWalletCoreModule();
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn);

  const { t } = useTranslation();
  const [widthView, setWidthView] = useState(Utils.screenWidth);

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

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setWidthView(width);
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

      // Ẩn single input, chuyển sang grid
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

  return {
    modalVisible,
    onCloseModal,
    suggestions,
    onDismissKeyboard,
    showSuggestions,
    secretPhraseInputs,
    isMiddleItem,
    onFocusInput,
    disableButton,
    insets,
    inputRefs,
    indexInputFocus,
    isLoading,
    widthView,
    setWidthView,
    handleLayout,
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
export default useRestoreWallet;
