import { StackActions } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import { LoadingImage } from "src/components/common/AppImage/type";
import AppToastType from "src/core/enum/AppToastType";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { useProtocolSelected } from "src/core/redux/slice/account.selector";
import { getProtocolDataLists } from "src/core/redux/slice/account.slice";
import Utils from "src/core/utils/commonUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  getCollectionById,
  setDeleteNFT,
} from "../../../../../core/redux/slice/NFT/NFTImport.slice";
import { NFTData } from "../../../../../core/redux/slice/NFT/NFTImport.type";

const useNFTDetail = (data: NFTData, { navigation }: RootNavigationType) => {
  const insets = useAppSafeAreaInsets();
  const { t } = useTranslation();
  const currentProtocol = useProtocolSelected();
  const listProtocol = useAppSelector(getProtocolDataLists);

  const dispatch = useAppDispatch();

  const [isLoadings, setIsLoadings] = useState<LoadingImage>({});
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const getLink = (chainID: number) => {
    let url = "";
    listProtocol?.forEach((protocol) => {
      if (protocol.chainId === chainID) {
        url = protocol.blockExplorerUrl;
      }
    });
    return url;
  };

  const url = getLink(data?.root?.protocol?.chainId ?? 0);

  const collectionStore = useAppSelector(getCollectionById);

  const getCurrentCollection = () => {
    return collectionStore?.find(
      (item) =>
        item.contractAddress === data.root.contractAddress &&
        item.network === data.root.symbol
    );
  };

  const setLoadings = (uri: string, value: boolean) => {
    setIsLoadings((prev) => {
      return {
        ...prev,
        [uri]: {
          uri: uri,
          loading: value,
        },
      };
    });
  };
  const handlePressURL = useCallback(async () => {
    const address = `${url}/address/${data.root.contractAddress}`;
    const supported = await Linking.canOpenURL(address);
    if (supported) {
      await Linking.openURL(address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.root.contractAddress, url]);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [bottomSheetClose, setBottomSheetClose] = useState<boolean>(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] =
    useState<boolean>(false);

  const onShowModal = () => {
    setShowModal(true);
    onBottomSheetOpen();
  };

  const onBottomSheetClose = () => setBottomSheetClose(true);
  const onBottomSheetOpen = () => setBottomSheetClose(false);

  const onHideModal = () => setShowModal(false);

  const onShowConfirmModal = () => setShowConfirmDeleteModal(true);
  const onHideConfirmModal = () => setShowConfirmDeleteModal(false);

  const onDeleteNFT = () => {
    onHideModal();
    onShowConfirmModal();
  };

  const handleDeleteNFT = (NFT: NFTData) => {
    dispatch(setDeleteNFT(NFT));
    Utils.showToast({
      msg: t(LanguageKey.nft_remove_successfully),
      type: AppToastType.success,
    });
    setIsDeleting(true);
    onHideConfirmModal();
  };

  const onListenDelete = () => {
    const hasData = getCurrentCollection();
    if (!isDeleting) {
      return;
    }
    if (hasData) {
      navigation.goBack();
    } else {
      navigation.dispatch(StackActions.popToTop());
    }
  };

  useEffect(() => {
    onListenDelete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionStore]);
  const onClickSendButton = () => {
    navigation.dispatch(StackActions.push(HomeStackScreenKey.NFTSend, data));
  };
  const copyAction = () => {
    Clipboard.setStringAsync(data.root.contractAddress);
    Utils.showToast({
      msg: t(LanguageKey.common_copied),
      type: AppToastType.success,
    });
  };
  return {
    setLoadings,
    isLoadings,
    getLink,
    handlePressURL,
    showModal,
    onShowModal,
    onHideModal,
    onDeleteNFT,
    t,
    onHideConfirmModal,
    showConfirmDeleteModal,
    handleDeleteNFT,
    setBottomSheetClose,
    onBottomSheetClose,
    bottomSheetClose,
    setIsDeleting,
    onClickSendButton,
    copyAction,
    currentProtocol,
    insets,
  };
};
export default useNFTDetail;
