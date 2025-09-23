import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useState } from "react";
import { Keyboard } from "react-native";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  deleteCurrentUser,
  getUserInfo,
} from "src/core/redux/slice/rezPoint/rezPoint.slice";
import GlobalUtils from "src/core/utils/globalUtils";
import { NavigationStackKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { DeleteAccountModalType } from "./personalInformation.type";

const CONFIRM_TEXT = "confirm";

const usePersonalInformation = ({ navigation }: RootNavigationType) => {
  const dispatch = useAppDispatch();
  const getInfoUser = useAppSelector(getUserInfo);

  const bottomSheetRefMenu = useRef<BottomSheetModal>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");
  const [modalDeleteAccount, setModalDeleteAccount] =
    useState<DeleteAccountModalType>({
      deleteAccountModal: false,
      confirmDeleteAccount: false,
    });

  const onShowModalDeleteAccount = () => {
    setModalDeleteAccount((prev) => ({
      ...prev,
      deleteAccountModal: true,
    }));
    onHideBottomSheetMenu();
    setConfirmText("");
  };
  const onShowConfirmDeleteAccount = () => {
    setModalDeleteAccount((prev) => ({
      ...prev,
      confirmDeleteAccount: true,
    }));
    Keyboard.dismiss();
    onHideModalDeleteAccount();
  };
  const onHideModalDeleteAccount = () => {
    setModalDeleteAccount((prev) => ({
      ...prev,
      deleteAccountModal: false,
    }));
  };
  const onCloseModalConfirmDeleteAccount = () => {
    setModalDeleteAccount((prev) => ({
      ...prev,
      confirmDeleteAccount: false,
    }));
  };
  const onShowBottomSheetMenu = () => {
    bottomSheetRefMenu.current?.present();
  };

  const onHideBottomSheetMenu = () => {
    bottomSheetRefMenu.current?.close();
  };

  const showLoading = () => {
    setIsLoading(true);
  };
  const hideLoading = () => {
    setIsLoading(false);
  };

  const handleDeleteAccount = async () => {
    showLoading();
    onCloseModalConfirmDeleteAccount();
    await dispatch(deleteCurrentUser());
    navigation.reset({
      index: 0,
      routes: [{ name: NavigationStackKey.HomeStack }],
    });
    hideLoading();
  };
  const isEnableButton = confirmText.trim().toLowerCase() === CONFIRM_TEXT;

  return {
    getInfoUser,
    bottomSheetRefMenu,
    onShowBottomSheetMenu,
    onHideBottomSheetMenu,
    onShowModalDeleteAccount,
    onShowConfirmDeleteAccount,
    onHideModalDeleteAccount,
    onCloseModalConfirmDeleteAccount,
    modalDeleteAccount,
    handleDeleteAccount,
    isLoading,
    setConfirmText,
    confirmText,
    isEnableButton,
  };
};
export default usePersonalInformation;
