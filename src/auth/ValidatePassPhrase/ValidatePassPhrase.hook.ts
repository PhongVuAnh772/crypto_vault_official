import { useEffect, useRef, useState } from "react";
import { Alert, TextInput } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import { RootNavigationType } from "../SplashScreen/index.view";
import * as Clipboard from "expo-clipboard";
import useAppSafeAreaInsets from "hooks/useAppSafeAreaInsets";
import Utils from "src/utils/commonUtils";
import { StackActions, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { addAccount } from "src/core/redux/slices/app.slice";
import { NavigationStackKey } from "src/navigation/enum/NavigationKey";
import { useAppDispatch } from "src/core/redux/hooks";

const useShowPassPhrase = ({ navigation }: RootNavigationType) => {
  const dispatch = useAppDispatch();
  const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [missingWords, setMissingWords] = useState<string[]>([]);
  const [visibleLoading, setVisibleLoading] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [secretPhraseInputs, setSecretPhraseInputs] = useState(
    Array(12).fill("")
  );
  const [widthView, setWidthView] = useState(Utils.screenWidth);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const onCloseModal = () => {
    setModalVisible(false);
  };

  const [disableButton, setDisableButton] = useState(true);
  const { mnemonic, pin } = route.params as { mnemonic: string; pin: string };
  const [missingIndexes, setMissingIndexes] = useState<number[]>([]);

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setWidthView(width);
  };
  useEffect(() => {
    if (secretPhraseInputs) {
      setDisableButton(!secretPhraseInputs.every((e) => e !== ""));
    }
  }, [secretPhraseInputs]);

  const isMiddleItem = (index: number): boolean => {
    return index % 3 === 1;
  };

  const handleContinueStep = async () => {
    setVisibleLoading(true);
    const res = await dispatch(
      addAccount({ mnemonic: mnemonic, pinCode: pin })
    );
    setTimeout(() => {
      setStatusLoading("success");
    }, 2000);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(mnemonic);
    Toast.show({
      type: "success",
      text1: "Đã sao chép !",
    });
  };

  const onAnimationFinish = () => {
    navigation.dispatch(StackActions.replace(NavigationStackKey.HomeStack));
  };

  const handleFillWord = (word: string) => {
    const idx = userInputs.findIndex((val, i) => {
      return missingIndexes.includes(i) && (!val || val.trim() === "");
    });

    if (idx !== -1) {
      const updated = [...userInputs];
      updated[idx] = word;
      setUserInputs(updated);
    }
  };

  const handleValidate = () => {
    const isCorrect = missingIndexes.every(
      (idx) =>
        userInputs[idx]?.trim().toLowerCase() ===
        secretPhraseInputs[idx]?.trim().toLowerCase()
    );

    if (isCorrect) {
      handleContinueStep();
    } else {
      Alert.alert("Sai cụm từ", "Vui lòng chọn lại 3 từ bị ẩn chính xác.");
    }
  };

  useEffect(() => {
    if (mnemonic) {
      const words = mnemonic.split(" ");
      setSecretPhraseInputs([...words, ...Array(12 - words.length).fill("")]);
    }
  }, [mnemonic]);

  useEffect(() => {
    const indexes = new Set<number>();
    while (indexes.size < 3) {
      indexes.add(Math.floor(Math.random() * secretPhraseInputs.length));
    }
    setMissingIndexes([...indexes]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (secretPhraseInputs.length > 0) {
      const indexes = new Set<number>();
      while (indexes.size < 3) {
        indexes.add(Math.floor(Math.random() * secretPhraseInputs.length));
      }
      const idxArr = [...indexes];
      setMissingIndexes(idxArr);
      setUserInputs(Array(secretPhraseInputs.length).fill(""));

      setMissingWords(idxArr.map((i) => secretPhraseInputs[i]));
    }
  }, [secretPhraseInputs]);

  return {
    modalVisible,
    onCloseModal,
    secretPhraseInputs,
    isMiddleItem,
    disableButton,
    insets,
    inputRefs,
    widthView,
    setWidthView,
    handleLayout,
    handleCopy,
    handleContinueStep,
    userInputs,
    setUserInputs,
    missingWords,
    setMissingWords,
    visibleLoading,
    setVisibleLoading,
    handleValidate,
    handleFillWord,
    pin,
    missingIndexes,
    setMissingIndexes,
    statusLoading,
    setStatusLoading,
    onAnimationFinish,
  };
};
export default useShowPassPhrase;
