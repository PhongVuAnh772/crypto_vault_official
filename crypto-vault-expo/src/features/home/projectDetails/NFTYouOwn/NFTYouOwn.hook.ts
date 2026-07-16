import { Address } from "@ton/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Canvas, { Image as CanvasImage } from "react-native-canvas";
import AppToastType from "src/core/enum/AppToastType";
import { Feature } from "src/core/enum/ContactFailedAction";
import { ProtocolType } from "src/core/enum/ProtocolType";
import Slip0044 from "src/core/enum/Slip0044";
import ThemeKey from "src/core/enum/ThemeKey";
import VMType from "src/core/enum/VMType";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  getCollectionById,
  getTonCollectionWithoutCurrentProtocol,
  importNFTThunk,
  importNFTTonThunk,
  setUpdateNFT,
} from "src/core/redux/slice/NFT/NFTImport.slice";
import {
  ImportNFTParams,
  NFTData,
} from "src/core/redux/slice/NFT/NFTImport.type";
import {
  useCurrentWallet,
  usePolAddressData,
  useProtocolSelected,
  useTonAddressData,
} from "src/core/redux/slice/account.selector";
import { getAccountId } from "src/core/redux/slice/account.slice";
import { getThemeMode } from "src/core/redux/slice/app.slice";
import createContextError from "src/core/services/ContextError";
import TonServices from "src/core/services/TonServices";
import Web3Service from "src/core/services/Web3";
import Utils from "src/core/utils/commonUtils";
import AppErrorUtils from "src/core/utils/errorUtils";
import { compareAddressesEVM } from "src/core/utils/evmUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import TonUtils from "src/core/utils/tonUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  getDataClaimable,
  getDataGetOwned,
  getStatusLoadingYouGot,
  handleGetOwnedNFTs,
} from "../../bottomTab/explore/explore.slice";
import { NFTSelectedType } from "./NFTYouOwn.type";

export const useNFTYouOwn = ({ navigation }: RootNavigationType) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
  const dataClaimable = useAppSelector(getDataClaimable);
  const dataGetOwned = useAppSelector(getDataGetOwned);
  const statusLoadingYouGot = useAppSelector(getStatusLoadingYouGot);
  const polygonWalletAddress = usePolAddressData();
  const [loading, setLoading] = useState(true);
  const [NFTSelectedModal, setNFTSelectedModal] = useState(false);
  const [itemYouOwnSelected, setItemYouOwnSelected] =
    useState<NFTSelectedType | null>(null);
  const selectAccountId = useAppSelector(getAccountId);

  const currentTonAccount = useTonAddressData();
  const collectionTonHaving = useAppSelector((state) =>
    getTonCollectionWithoutCurrentProtocol(state, {
      accountId: selectAccountId ?? "",
      address: currentTonAccount?.address ?? "",
    })
  );
  const [loadingHandle, setLoadingHandle] = useState(false);
  const currentProtocol = useProtocolSelected();
  const wallet = useCurrentWallet();
  const tonServices = new TonServices();
  const collection = useAppSelector(getCollectionById);
  const [isExistingInCollection, setIsExistingInCollection] = useState(false);
  const canvasRef = useRef<any>(null);
  const [image, setImage] = useState<string>();
  const [totalClaim, setTotalClaim] = useState(0);

  const contextSupportClaimTokenError = (
    functionError: string,
    reason: string,
    id?: number
  ) => {
    const error = createContextError({
      feature: Feature.ClaimToken,
      fileError: `NFTYouOwn.hook.ts (tabs)`,
      functionError: functionError,
      reason: reason,
      protocol: currentProtocol?.symbol ?? ProtocolType.All,
      id: id,
    });
    // Auto log => push error to server
    AppErrorUtils.sendContactWhenError(dispatch, error);
    return error;
  };

  const transformedData = useMemo(() => {
    if (collectionTonHaving && collectionTonHaving.length > 0) {
      const mergedData = collectionTonHaving
        .filter((item) => item && Array.isArray(item.data))
        .flatMap((item) => item.data);
      if (mergedData.length === 0) {
        return {};
      }
      const dataObject = mergedData.reduce(
        (acc: { [key: string]: typeof item }, item) => {
          if (item && item.root && item.root.contractAddress) {
            const contractAddress = item.root.contractAddress;
            acc[contractAddress] = item;
            return acc;
          }
          return {};
        },
        {}
      );
      return dataObject;
    }
    return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionTonHaving]);

  const handleOpenNFTSelectedModal = (item: NFTSelectedType) => {
    setItemYouOwnSelected(item);
    setNFTSelectedModal(true);
  };

  const actionHideStatus = () => {
    setLoadingHandle(false);
    setItemYouOwnSelected(null);
    setIsExistingInCollection(false);
    handleCloseNFTSelectedModal();
  };

  const handleCloseNFTSelectedModal = () => {
    setNFTSelectedModal(false);
  };
  const backAction = () => {
    navigation.goBack();
    navigation.navigate(t(LanguageKey.transaction_history_project_details));
  };

  const actionAddingToMyCollection = () => {};

  const commonBackAction = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const getData = async () => {
      try {
        await dispatch(
          handleGetOwnedNFTs({
            claimableTokenProjectId: dataClaimable?.project?._id as string,
            polygonWalletAddress:
              currentProtocol?.slip0044 === Slip0044.Ton
                ? currentTonAccount?.address
                : polygonWalletAddress,
            t,
          })
        );
        setLoading(false);
      } catch (error: any) {
        console.log("error useNFTYouOwn", error);
        navigation.goBack();
        contextSupportClaimTokenError(`getData`, error, 170);
        Utils.showToast({
          msg: t(LanguageKey.common_server_busy),
          type: AppToastType.error,
        });
      } finally {
        setLoading(false);
      }
    };
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const checkValidTonAddress = (address: string) => {
    if (TonUtils.validAddress(address)) {
      return true;
    }
    return false;
  };

  const handleAddNFTWithEVM = async () => {
    setLoadingHandle(true);

    try {
      const protocol = currentProtocol;
      if (!itemYouOwnSelected) {
        Utils.showToast({
          msg: t(LanguageKey.nft_import_error),
          type: AppToastType.error,
        });
        return;
      }
      if (!protocol || !wallet) {
        console.log("protocol or wallet is null");
        return;
      }
      const web3 = new Web3Service({
        urpUrl: protocol.rpcUrl || "",
      });

      const resImport = await web3.importNFT({
        contractAddress: itemYouOwnSelected.contractAddress,
        nftId: Number(itemYouOwnSelected.nftId),
        walletAddress: wallet.address,
      });
      if (!resImport) {
        console.log("resImport is null");
        return;
      }

      if (protocol && wallet) {
        const data: ImportNFTParams = {
          contractAddress: itemYouOwnSelected.contractAddress,
          nftId: Number(itemYouOwnSelected.nftId),
          id: `${wallet.address}_${protocol.slip0044}`,
          protocolData: protocol,
          accountId: selectAccountId ?? "",
          nftData: resImport,
        };
        const result = await dispatch(importNFTThunk(data));
        if (importNFTThunk.fulfilled.match(result) && result.payload) {
          const imageData = result.payload.detail?.image_data;

          if (imageData) {
            const nftData: NFTData = {
              ...result.payload,
              detail: {
                ...result.payload.detail,
                image_data: imageData,
              },
            };
            dispatch(setUpdateNFT(nftData));
          }
          setLoadingHandle(false);
          actionHideStatus();
          Utils.showToast({
            msg: t(LanguageKey.nft_imported_successfully),
            type: AppToastType.success,
          });
        } else {
          const errorMessage =
            typeof result.payload === "string"
              ? result.payload
              : t(LanguageKey.nft_import_error);
          Utils.showToast({
            msg: errorMessage,
            type: AppToastType.error,
          });
        }
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t(LanguageKey.nft_import_error);
      Utils.showToast({
        msg: message,
        type: AppToastType.error,
      });
      setLoadingHandle(false);
    }
    setLoadingHandle(false);
  };

  const handleAddNFTWithTon = async (detail: string) => {
    setLoadingHandle(true);

    try {
      const protocol = currentProtocol;

      if (!protocol || !wallet || !selectAccountId) {
        console.log("protocol or wallet is null");
        return;
      }

      if (!detail || !checkValidTonAddress(detail)) {
        throw new Error(t(LanguageKey.common_invalid_contract_address));
      }
      const walletAddress = Address.parse(wallet.address);
      const detailAddress = Address.parse(detail);

      const resDetailNFT = await tonServices.getDetailNFTByAddressUsingAPI({
        address: detailAddress.toRawString(),
      });

      if (!resDetailNFT.data?.owner?.address) {
        throw new Error(t(LanguageKey.error_finish_invalid_nft_info));
      }

      if (
        !compareExactOwnerAddress(
          resDetailNFT.data?.owner?.address,
          walletAddress.toRawString()
        )
      ) {
        throw new Error(t(LanguageKey.import_nft_not_owned));
      }

      const data = {
        contractAddress: detailAddress.toRawString(),
        id: `${wallet.address}_${protocol.slip0044}`,
        protocolData: protocol,
        accountId: selectAccountId ?? "",
        dataTonNFT: resDetailNFT.data,
        collectionId: resDetailNFT.data.collection?.address,
      };
      await dispatch(importNFTTonThunk(data));
      setLoadingHandle(false);
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
      setLoadingHandle(false);
    }
    setLoadingHandle(false);
  };

  const handleAddNFT = async () => {
    switch (currentProtocol?.VM) {
      case VMType.EVM:
        handleAddNFTWithEVM();
        break;
      case VMType.Ton:
        handleAddNFTWithTon(itemYouOwnSelected?.contractAddress ?? "");
        break;

      default:
        break;
    }
  };
  const checkingExistingInCollection = () => {
    if (currentProtocol?.VM === VMType.Ton && currentProtocol) {
      if (
        itemYouOwnSelected?._id &&
        itemYouOwnSelected?._id in transformedData
      ) {
        setIsExistingInCollection(true);
        return;
      }
    }
    if (collection && collection.length > 0) {
      const flatCollection = collection.flatMap((item) => item.data);
      if (flatCollection && flatCollection.length === 0) {
        return;
      }
      const existingData = flatCollection.filter((item) => {
        return (
          item?.detail?.nftId?.toString() ===
            itemYouOwnSelected?.nftId?.toString() &&
          compareAddressesEVM(
            item?.root?.contractAddress,
            itemYouOwnSelected?.contractAddress
          )
        );
      });
      if (existingData?.length > 0) {
        setIsExistingInCollection(true);
      }
    }
  };
  const convertImageByCanvas = async (image: string) => {
    return new Promise<string>((resolve) => {
      const canvas = canvasRef.current;

      if (canvas) {
        const ctx = canvas.getContext("2d");
        const img = new CanvasImage(canvas);

        img.src = image;
        img.addEventListener("load", async () => {
          const imgWidth = img.width;
          const imgHeight = img.height;

          const maxCanvasWidth = canvas.width || 300;
          const aspectRatio = imgWidth / imgHeight;
          const canvasHeight = maxCanvasWidth / aspectRatio;

          canvas.width = maxCanvasWidth;
          canvas.height = canvasHeight;

          ctx.drawImage(img, 0, 0, maxCanvasWidth, canvasHeight);

          const data = await canvas.toDataURL("image/png");

          const cleanedBase64 = data?.replace(/^"|"$/g, "");

          resolve(cleanedBase64);
        });

        img.addEventListener("error", () => {
          resolve("");
        });
      } else {
        resolve("");
      }
    });
  };
  const getImageUri = async (image: string) => {
    const imageConverted = await convertImageByCanvas(image);

    return imageConverted;
  };

  const handleGetImage = async () => {
    const result = await getImageUri(itemYouOwnSelected?.image ?? "");
    setImage(result);
  };
  const effectingImageCanvas = () => {
    if (itemYouOwnSelected?.image?.startsWith("data:image/")) {
      handleGetImage();
    } else {
      return;
    }
  };
  return {
    theme,
    backAction,
    lightMode,
    dataClaimable,
    dataGetOwned,
    statusLoadingYouGot,
    commonBackAction,
    loading,
    totalClaim,
    setTotalClaim,
    t,
    NFTSelectedModal,
    setNFTSelectedModal,
    handleOpenNFTSelectedModal,
    handleCloseNFTSelectedModal,
    itemYouOwnSelected,
    actionAddingToMyCollection,
    getImageUri,
    setItemYouOwnSelected,
    handleAddNFTWithTon,
    loadingHandle,
    handleAddNFT,
    setLoadingHandle,
    checkingExistingInCollection,
    actionHideStatus,
    image,
    isExistingInCollection,
    effectingImageCanvas,
    handleGetImage,
    canvasRef,
  };
};
