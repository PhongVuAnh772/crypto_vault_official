import { StackActions } from "@react-navigation/native";
import { Address } from "@ton/core";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import AppToastType from "src/core/enum/AppToastType";
import { NFTCollectionTab } from "src/core/enum/NFTCollectionTab";
import ThemeKey from "src/core/enum/ThemeKey";
import VMType from "src/core/enum/VMType";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useCurrentWallet,
  useProtocolSelected,
} from "src/core/redux/slice/account.selector";
import {
  getAccountId,
  getProtocolDataLists,
} from "src/core/redux/slice/account.slice";
import { getThemeMode } from "src/core/redux/slice/app.slice";
import {
  importNFTTonThunk,
  setTabCollectionIndex,
} from "src/core/redux/slice/NFT/NFTImport.slice";
import { NFTDetailEVMCollectionType } from "src/core/redux/slice/NFT/NFTImport.type";
import TonServices from "src/core/services/TonServices";
import Utils from "src/core/utils/commonUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import TonUtils from "src/core/utils/tonUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { NFTUnAddedDetailTonProps } from "./NFTUnAddedDetail.type";
const useNFTUnAddedDetail = ({
  navigation,
  detail,
}: NFTUnAddedDetailTonProps) => {
  const insets = useAppSafeAreaInsets();
  const theme = useAppTheme();
  const tonServices = new TonServices();
  const currentProtocol = useProtocolSelected();
  const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
  const listProtocol = useAppSelector(getProtocolDataLists);
  const dispatch = useAppDispatch();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const selectAccountId = useAppSelector(getAccountId);
  const wallet = useCurrentWallet();
  const [loadingHandle, setLoadingHandle] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();

  const getLink = (chainID: number) => {
    let url = "";
    listProtocol?.forEach((protocol) => {
      if (protocol.slip0044 === chainID) {
        url = protocol.blockExplorerUrl;
      }
    });
    return url;
  };

  const url = getLink(currentProtocol?.slip0044 ?? 0);
  const onShowModal = () => {
    setShowModal(true);
  };
  const copyAction = () => {
    Clipboard.setStringAsync(detail.address.toString() ?? "");
    Utils.showToast({
      msg: t(LanguageKey.common_copied),
      type: AppToastType.success,
    });
  };
  const navigatingToNFTCollection = () => {
    navigation.dispatch(StackActions.pop(2));
    dispatch(setTabCollectionIndex(0));
  };

  const checkValidTonAddress = (address: string) => {
    if (TonUtils.validAddress(address)) {
      return true;
    }
    return false;
  };

  const handlePressURL = async () => {
    const addressPath = `/${detail.address ?? ""}`;

    const address = `${url}${addressPath}`;
    const supported = await Linking.canOpenURL(address);
    if (supported) {
      await Linking.openURL(address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const compareExactOwnerAddress = (
    address1: string,
    address2: string
  ): boolean => {
    if (address1.length !== address2.length) {
      return false;
    }

    for (let i = 0; i < address1.length; i++) {
      if (address1[i] !== address2[i]) {
        return false;
      }
    }
    return true;
  };

  const handleAddNFTWithTon = async () => {
    setLoadingHandle(true);
    try {
      const protocol = currentProtocol;

      if (!protocol || !wallet || !selectAccountId) {
        console.log("protocol, wallet or selectAccountId is null");
        throw new Error(t(LanguageKey.common_server_busy));
      }
      if (
        !detail ||
        !detail.address ||
        !checkValidTonAddress(detail.address.toString())
      ) {
        throw new Error(t(LanguageKey.common_invalid_contract_address));
      }
      const walletAddress = Address.parse(wallet.address).toRawString();

      const resDetailNFT = await tonServices.getDetailNFTByAddressUsingAPI({
        address: detail.address,
      });

      if (!resDetailNFT.data?.owner?.address) {
        throw new Error(t(LanguageKey.error_finish_invalid_nft_info));
      }

      if (
        !compareExactOwnerAddress(
          resDetailNFT.data?.owner?.address,
          walletAddress
        )
      ) {
        throw new Error(t(LanguageKey.import_nft_not_owned));
      }

      const data = {
        contractAddress: detail.address,
        id: `${wallet.address}_${protocol.slip0044}`,
        protocolData: protocol,
        accountId: selectAccountId ?? "",
        dataTonNFT: resDetailNFT.data,
        collectionId:
          detail.collection?.address ?? NFTCollectionTab.noCollectionId,
      };
      await dispatch(importNFTTonThunk(data));
      navigatingToNFTCollection();
      Utils.showToast({
        msg: t(LanguageKey.nft_imported_successfully),
        type: AppToastType.success,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t(LanguageKey.nft_import_error);
      Utils.showToast({
        msg: message,
        type: AppToastType.error,
      });
    } finally {
      setLoadingHandle(false);
    }
  };

  const handleAddNFT = async () => {
    handleAddNFTWithTon();
  };
  const onHideModal = () => {
    setShowModal(false);
  };
  const navigateToNFTUnAddedDetail = (nft: NFTDetailEVMCollectionType) => {
    navigation.navigate(HomeStackScreenKey.NFTUnAddedDetail, {
      detail: nft,
      root: true,
    });
  };

  return {
    lightMode,
    onShowModal,
    onHideModal,
    showModal,
    navigateToNFTUnAddedDetail,
    insets,
    handleAddNFT,
    loadingHandle,
    isInitialLoading,
    currentProtocol,
    handlePressURL,
    setIsInitialLoading,
    copyAction,
    isTon: currentProtocol?.VM === VMType.Ton,
    isEVM: currentProtocol?.VM === VMType.EVM,
    lastPreview: detail.previews?.[detail.previews.length - 1],
    theme,
  };
};

export default useNFTUnAddedDetail;
