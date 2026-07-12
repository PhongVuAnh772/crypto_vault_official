import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, TextInput } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";

import {
  AuthStackScreenKey,
  NavigationStackKey,
} from "src/navigation/enum/NavigationKey";
import Toast from "react-native-toast-message";
import * as Clipboard from "expo-clipboard";
import NativeWalletCoreModule from "src/core/modules/WalletCoreModules/NativeWalletCoreModule";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import Utils from "src/core/utils/commonUtils";
import { RootNavigationType } from "src/auth/SplashScreen/index.view";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import {
  addAccount,
  getAllAccount,
  getPin,
  setTemporaryMnemonic,
} from "src/core/redux/slice/account.slice";
import { HomeParamListType } from "src/navigation/stacks/type/HomeParamListType";
import LanguageKey from "src/core/locales/LanguageKey";
import AppToastType from "src/core/enum/AppToastType";

const useRestoreWallet = ({ navigation }: RootNavigationType) => {
  const pin = useAppSelector(getPin);
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
  const walletData = useAppSelector(getAllAccount);

  const theme = useAppTheme();

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

  const handleWordSelect = (word: string) => {
    const updatedInputs = [...secretPhraseInputs];
    updatedInputs[indexInputFocus ?? 0] = word;
    setSecretPhraseInputs(updatedInputs);
    setSuggestions([]);
    inputRefs.current[(indexInputFocus ?? 0) + 1]?.focus();
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

  const handleRestoreAccount = async () => {
    setDisableButton(true);
    setSuggestions([]);
    setIsLoading(true);
    const secretPhrase = secretPhraseInputs.join(" ");
    const findWalletResult = walletData?.find(
      (e) => e.mnemonic === secretPhrase
    );
    if (findWalletResult) {
      Utils.showToast({
        msg: t(LanguageKey.restore_error_added),
        type: AppToastType.error,
      });
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
              setTimeout(() => {
                Utils.showToast({
                  msg: t(LanguageKey.restore_success_title),
                  type: AppToastType.success,
                });
              }, 500);
            }
          } else {
            if (Keyboard.isVisible()) {
              Keyboard.dismiss();
            }
            setTimeout(() => {
              navigation.navigate(NavigationStackKey.PinCodeStack);
            }, 100);
            setDisableButton(false);
          }
        }
      } catch (error) {
        console.error("handleRestoreAccount Error:", error);
        setModalVisible(true);
        setDisableButton(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

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
    handleWordSelect,
    theme,
  };
};
export default useRestoreWallet;
