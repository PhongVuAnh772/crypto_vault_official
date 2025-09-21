import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, TextInput } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { RootNavigationType } from "../SplashScreen/index.view";
import {
  addAccount,
  getAllAccount,
  getPin,
  setTemporaryMnemonic,
} from "src/core/redux/slices/app.slice";
import NativeWalletCoreModule from "src/modules/WalletCoreModules/NativeWalletCoreModule";
import useAppSafeAreaInsets from "hooks/useAppSafeAreaInsets";
import Utils from "src/utils/commonUtils";
import wordlistsBIP39 from "assets/suggestions/wordlistsBIP39.json";
import { HomeParamListType } from "src/navigation/stack/home/HomeParamListType";
import {
  AuthStackScreenKey,
  NavigationStackKey,
} from "src/navigation/enum/NavigationKey";
import Toast from "react-native-toast-message";
import * as Clipboard from "expo-clipboard";

const useRestoreWallet = ({ navigation }: RootNavigationType) => {
  const dispatch = useAppDispatch();
  const pin = useAppSelector(getPin);
  const walletData = useAppSelector(getAllAccount);
  const [modalVisible, setModalVisible] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSingleInput, setIsSingleInput] = useState(true);
  const [tempPhrase, setTempPhrase] = useState("");
  const [showNmemonic, setShowNmemonic] = useState(false);
  const nativeWalletCoreModule = new NativeWalletCoreModule();
  const [secretPhraseInputs, setSecretPhraseInputs] = useState(
    Array(12).fill("")
  );
  const [widthView, setWidthView] = useState(Utils.screenWidth);
  const [indexInputFocus, setIndexInputFocus] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const insets: EdgeInsets = useAppSafeAreaInsets();
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
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setWidthView(width);
  };

  const isMiddleItem = (index: number): boolean => {
    return index % 3 === 1;
  };

  const handleShow = () => {
    setShowNmemonic(!showNmemonic);
  };
  const handleInputChange = () => {};

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
