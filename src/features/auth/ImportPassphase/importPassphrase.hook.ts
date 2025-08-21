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
  useEffect(() => {
    if (secretPhraseInputs) {
      setDisableButton(!secretPhraseInputs.every((e) => e !== ""));
    }
  }, [secretPhraseInputs]);

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

      if (words.length !== 12) {
        Toast.show({
          type: "error",
          text1: "Mnemonic không hợp lệ",
          text2: "Cần đủ 12 từ",
        });
        return;
      }
      setIsSingleInput(false);
      setSecretPhraseInputs(words);

      Toast.show({
        type: "success",
        text1: "Đã dán mnemonic",
      });
    } catch (err) {
      console.log(err);
      Toast.show({
        type: "error",
        text1: "Không thể dán từ clipboard",
      });
    }
  };

  const handleInputChange = (text: string, index: number) => {
    const currentText = text.toLocaleLowerCase();
    const textArray = currentText
      .split(" ")
      .filter((e) => e !== "")
      .slice(0, 12 - index);

    const updatedInputs = [...secretPhraseInputs];
    if (textArray.length > 0) {
      textArray.forEach((e, i) => {
        updatedInputs[i + index] = e.trim();
      });
    } else {
      updatedInputs[index] = currentText;
    }
    setSecretPhraseInputs(updatedInputs);

    if (currentText.length > 0) {
      const filteredWords = wordlistsBIP39.filter((word) =>
        word.startsWith(currentText)
      );
      if (filteredWords.length === 1 && currentText === filteredWords[0]) {
        setSuggestions([]);
      } else {
        setSuggestions(filteredWords);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleWordSelect = (word: string) => {
    const updatedInputs = [...secretPhraseInputs];
    updatedInputs[indexInputFocus ?? 0] = word;
    setSecretPhraseInputs(updatedInputs);
    setSuggestions([]);
    inputRefs.current[(indexInputFocus ?? 0) + 1]?.focus();
  };

  // MARK: Case restore wallet
  const handleRestoreAccount = async () => {
    setDisableButton(true);
    setSuggestions([]);
    setIsLoading(true);
    const secretPhrase = secretPhraseInputs.join(" ");
    const findWalletResult = walletData?.find(
      (e) => e.mnemonic === secretPhrase
    );
    if (findWalletResult) {
      setDisableButton(false);
      setIsLoading(false);
    } else {
      try {
        const mnemonic = await nativeWalletCoreModule.importWallet({
          secretPhrase,
        });
        if (mnemonic) {
          dispatch(setTemporaryMnemonic(mnemonic));
          if (pin !== undefined && pin !== null) {
            const res = await dispatch(
              addAccount({ mnemonic: mnemonic, pinCode: pin })
            );
            if (addAccount.fulfilled.match(res)) {
              if (Keyboard.isVisible()) {
                Keyboard.dismiss();
              }
              const param: HomeParamListType = {
                reShowWalletModal: true,
              };
              navigation.navigate(NavigationStackKey.HomeStack, param);
              setTimeout(() => {}, 500);
            }
          } else {
            if (Keyboard.isVisible()) {
              Keyboard.dismiss();
            }
            setTimeout(() => {
              navigation.navigate(AuthStackScreenKey.CreatePinCode);
            }, 100);
            setDisableButton(false);
          }
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Khởi tạo ví thất bại hoặc cụm từ sai",
        });
        console.error("handleRestoreAccount Error:", error);
        setModalVisible(true);
        setDisableButton(false);
      } finally {
        setIsLoading(false);
      }
    }
  };
  const isMiddleItem = (index: number): boolean => {
    return index % 3 === 1;
  };

  const handleShow = () => {
    setShowNmemonic(!showNmemonic);
  };

  return {
    modalVisible,
    onCloseModal,
    handleInputChange,
    handleWordSelect,
    suggestions,
    handleRestoreAccount,
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
    handlePaste,
    isSingleInput,
    setIsSingleInput,
    tempPhrase,
    setTempPhrase,
    handleShow,
    showNmemonic,
    setShowNmemonic,
  };
};
export default useRestoreWallet;
