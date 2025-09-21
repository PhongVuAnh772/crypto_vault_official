import { useEffect, useRef, useState } from "react";
import { TextInput } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import { RootNavigationType } from "../SplashScreen/index.view";
import * as Clipboard from "expo-clipboard";
import useAppSafeAreaInsets from "hooks/useAppSafeAreaInsets";
import Utils from "src/utils/commonUtils";
import { useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { AuthStackScreenKey } from "src/navigation/enum/NavigationKey";

const useShowPassPhrase = ({ navigation }: RootNavigationType) => {
  const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleContinueStep = () => {
    navigation.navigate(AuthStackScreenKey.ValidatePassPhrase, {
      mnemonic: mnemonic,
      pin: pin,
    });
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(mnemonic);
    Toast.show({
      type: "success",
      text1: "Đã sao chép !",
    });
  };

  useEffect(() => {
    if (mnemonic) {
      const words = mnemonic.split(" ");
      setSecretPhraseInputs([...words, ...Array(12 - words.length).fill("")]);
    }
  }, [mnemonic]);

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
  };
};
export default useShowPassPhrase;
