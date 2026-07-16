import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Keyboard } from "react-native";
import { openSettings } from "react-native-permissions";
import { EdgeInsets } from "react-native-safe-area-context";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { useAppDispatch } from "src/core/redux/hooks";
import {
  setActionFailedNeedToContact,
  setShowCommonErrorModal,
} from "src/core/redux/slice/app.slice";
import GlobalUtils from "src/core/utils/globalUtils";
import createStyles from "./styles";

const useScreenWrapper = ({
  onDismissKeyboard,
  onCloseScanQR,
  backButtonColor,
  showScanQRCamera,
  headerTextColor,
}: {
  onDismissKeyboard: (() => void) | undefined;
  onCloseScanQR?: () => void;
  backButtonColor?: string;
  showScanQRCamera?: boolean;
  headerTextColor?: string;
}) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const insets: EdgeInsets = useAppSafeAreaInsets();
  const theme = useAppTheme();

  const [
    showModalRequestCameraPermission,
    setShowModalRequestCameraPermission,
  ] = useState(false);

  const closeShowModalRequestCameraPermission = () => {
    setShowModalRequestCameraPermission(false);
    onCloseScanQR?.();
  };

  const onShowModalRequestCameraPermission = () => {
    setShowModalRequestCameraPermission(true);
  };

  const openSettingsAction = async () => {
    try {
      await openSettings();
    } catch (error) {
      console.error("openSettingsAction error", error);
      dispatch(setShowCommonErrorModal(true));
      dispatch(setActionFailedNeedToContact(" " + error));
    }
    closeShowModalRequestCameraPermission();
  };

  const dismissKeyboardWhenTappedOutsideOfInput = () => {
    if (onDismissKeyboard) {
      onDismissKeyboard();
    }
    Keyboard.dismiss();
  };

  const stylesWithTheme = createStyles({
    theme: theme,
  });

  const backActionDefault = () => navigation.goBack();

  const colorArrowBack = showScanQRCamera
    ? theme?.colors?.surface_surface_high
    : (backButtonColor ?? theme?.colors?.text_on_surface_text_high);
  const colorTitleHeader = showScanQRCamera
    ? theme?.colors?.surface_surface_high
    : (headerTextColor ?? theme.colors.text_on_surface_text_highest);
  return {
    insets,
    showModalRequestCameraPermission,
    onShowModalRequestCameraPermission,
    openSettingsAction,
    dismissKeyboardWhenTappedOutsideOfInput,
    stylesWithTheme,
    colorArrowBack,
    colorTitleHeader,
    backActionDefault,
    closeShowModalRequestCameraPermission,
    theme,
  };
};

export default useScreenWrapper;
