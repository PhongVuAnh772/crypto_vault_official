import { RouteProp, StackActions, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { EdgeInsets } from "react-native-safe-area-context";
import AuthAction from "src/core/enum/AuthAction";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  addAccount,
  getTemporaryMnemonic,
  setPin,
} from "src/core/redux/slice/account.slice";
import { getAuthAction, getThemeMode } from "src/core/redux/slice/app.slice";
import GlobalUtils from "src/core/utils/globalUtils";
import {
  NavigationStackKey,
  PinCodeStackScreenKey,
} from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { PinCodeStackParamListType } from "src/navigation/stacks/type/PinCodeStackParamListType";

type ReEnterPinProp = RouteProp<
  PinCodeStackParamListType,
  PinCodeStackScreenKey.ReEnterPin
>;
const useRePinCode = ({ navigation }: RootNavigationType) => {
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const dispatch = useAppDispatch();
  const route = useRoute<ReEnterPinProp>();
  const pin: string = route.params.pinCode;
  const mnemonic = useAppSelector(getTemporaryMnemonic);
  const theme = useAppTheme();
  const themeMode = useAppSelector(getThemeMode);
  const [value, setValue] = useState("");
  const [incorrectPin, setIncorrectPin] = useState(false);
  const [correctPin, setCorrectPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const authAction = useAppSelector(getAuthAction);

  const confirmAction = async () => {
    if (pin === value) {
      if (authAction === AuthAction.restoreWallet) {
        continueAction();
      } else {
        setCorrectPin(true);
      }
    } else {
      setIncorrectPin(true);
      setValue("");
    }
  };
  useEffect(() => {
    if (value?.length === 6) {
      confirmAction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.length]);

  // MARK: Case new wallet
  const continueAction = async () => {
    if (mnemonic !== undefined && mnemonic !== null) {
      setIsLoading(true);
      dispatch(setPin(pin));
      const res = await dispatch(
        addAccount({ mnemonic: mnemonic, pinCode: pin })
      );

      if (addAccount.fulfilled.match(res)) {
        navigation.dispatch(StackActions.replace(NavigationStackKey.HomeStack));
      }
      setIsLoading(false);
    }
  };

  const onChangeValue = (text: string) => {
    if (incorrectPin) {
      clearError();
    }
    setValue(text);
  };

  const clearError = () => setIncorrectPin(false);

  return {
    correctPin,
    continueAction,
    value,
    onChangeValue,
    incorrectPin,
    theme,
    themeMode,
    isLoading,
    insets,
  };
};

export default useRePinCode;
