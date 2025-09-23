import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AppToastType from "src/core/enum/AppToastType";
import { IPFSDomain } from "src/core/enum/IPFSDomain";
import ThemeKey from "src/core/enum/ThemeKey";
import VMType from "src/core/enum/VMType";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useCurrentWallet,
  useProtocolSelected,
} from "src/core/redux/slice/account.selector";
import { getAccountId } from "src/core/redux/slice/account.slice";
import { getThemeMode } from "src/core/redux/slice/app.slice";
import {
  getCollectionById,
  getCursorDetailNFTsByCollection,
  getDetailNFTsByCollectionThunk,
  setCursorDetailNFTsByCollection,
  updateArchivedCollection,
} from "src/core/redux/slice/NFT/NFTImport.slice";
import {
  NFTData,
  NFTDetailEVMCollectionType,
} from "src/core/redux/slice/NFT/NFTImport.type";
import {
  deleteNFTArchivedSpam,
  updateNFTArchivedSpam,
} from "src/core/redux/slice/NftData.slice";
import Utils from "src/core/utils/commonUtils";
import {
  compareAddressesEVM,
  convertChainByProtocol,
} from "src/core/utils/evmUtils";
import GlobalUtils from "src/core/utils/globalUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import { NFTCollectionStatsProps } from "./NFTCollectionStats.type";

const useNFTCollectionStats = ({
  navigation,
  collectionAddress,
  archived,
  collectionData,
}: NFTCollectionStatsProps) => {
  const currentWallet = useCurrentWallet();
  const selectedAccountId = useAppSelector(getAccountId);
  const currentProtocol = useProtocolSelected();

  const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
  const cursorDetailNFTsByCollection = useAppSelector(
    getCursorDetailNFTsByCollection
  );
  const selectedProtocol = useProtocolSelected();
  const wallet = useCurrentWallet();
  const dispatch = useAppDispatch();
  const protocolSelected = useProtocolSelected();
  const [detailNFTsByCollection, setDetailNFTsByCollection] = useState<
    NFTDetailEVMCollectionType[]
  >([]);

  const [enablePagination, setEnablePagination] = useState<boolean>(false);
  const collection = useAppSelector(getCollectionById);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [modalArchiving, setModalArchiving] = useState<boolean>(false);
  const { t } = useTranslation();

  const onShowModalArchiving = () => {
    setModalArchiving(true);
  };
  const onHideModalArchiving = () => {
    setModalArchiving(false);
  };

  const handleRemoveArchivedCollection = () => {
    if (!selectedAccountId || !wallet || !currentProtocol) {
      return;
    }
    dispatch(
      deleteNFTArchivedSpam({
        selectedAccountId: selectedAccountId,
        walletCombineSlip0044Id: `${wallet.address}_${currentProtocol.slip0044}`,
        address: collectionAddress,
      })
    );
    navigation.goBack();
    setModalArchiving(false);
    dispatch(updateArchivedCollection(collectionAddress));
    Utils.showToast({
      msg: t(LanguageKey.nft_unarchive_collection_complete),
      type: AppToastType.success,
      visibilityTime: 2000,
    });
  };

  function convertIpfsToHttp(ipfsLink: string) {
    if (ipfsLink.startsWith(IPFSDomain.commonIPFS)) {
      return ipfsLink.replace(IPFSDomain.commonIPFS, IPFSDomain.swapingIPFS);
    }
    return ipfsLink;
  }
  const onShowModal = () => {
    setShowModal(true);
  };
  const onHideModal = () => {
    setShowModal(false);
  };
  const navigateToNFTUnAddedDetail = async (
    nft: NFTDetailEVMCollectionType
  ) => {
    const metadata = nft.metadata ? nft.metadata : {};

    navigation.navigate(HomeStackScreenKey.NFTUnAddedDetail, {
      detail: nft,
      metadata: metadata,
      added: nft.active,
      archived: archived,
    });
  };
  const filteredCollectionData = useMemo(() => {
    if (collection && collection.length > 0) {
      return collection.filter((item) =>
        compareAddressesEVM(item.contractAddress, collectionAddress)
      );
    }
  }, [collection, collectionAddress]);

  const handlingFetchEVMPagination = async () => {
    try {
      if (collectionAddress && protocolSelected?.symbol && wallet?.address) {
        const chain = convertChainByProtocol(protocolSelected.slip0044);

        if (!chain) {
          throw new Error("chain is null");
        }

        if (cursorDetailNFTsByCollection === null) {
          setEnablePagination(false);
          return;
        }
        const res = await dispatch(
          getDetailNFTsByCollectionThunk({
            chain: chain,
            address: wallet?.address,
            token_addresses: [collectionAddress],
            cursor: cursorDetailNFTsByCollection,
            limit: 10,
          })
        );

        if (
          getDetailNFTsByCollectionThunk.fulfilled.match(res) &&
          res.payload.data &&
          res.payload
        ) {
          const data = res.payload.data.result;
          const result = Array.isArray(data) ? data : [data];

          const updatedResult = result.map((item) => {
            const isActive = transformedData.hasOwnProperty(
              Number(item.token_id)
            );
            return {
              ...item,
              active: isActive,
            };
          });
          dispatch(
            setCursorDetailNFTsByCollection(
              res.payload.data.cursor !== null ? res.payload.data.cursor : null
            )
          );

          setDetailNFTsByCollection(
            (prevDetailNFTs) =>
              [
                ...prevDetailNFTs,
                ...updatedResult,
              ] as NFTDetailEVMCollectionType[]
          );
          setIsInitialLoading(false);
          setRefreshing(false);
        } else {
          navigation.goBack();
          Utils.showToast({
            msg: t(LanguageKey.common_server_busy),
            type: AppToastType.error,
          });
          throw new Error("error fetchAndConvertData");
        }
      }
    } catch (error) {
      navigation.goBack();
      console.log("handlingFetchPagination error", error);
      Utils.showToast({
        msg: t(LanguageKey.common_server_busy),
        type: AppToastType.error,
      });
      setRefreshing(false);
    }
  };

  const transformedData = useMemo(() => {
    if (
      filteredCollectionData &&
      filteredCollectionData.length > 0 &&
      selectedProtocol?.VM === VMType.EVM
    ) {
      return filteredCollectionData[0].data.reduce(
        (acc: Record<string, NFTData>, item) => {
          const nftId = item.detail.nftId;
          if (nftId !== undefined) {
            acc[nftId] = item;
          }
          return acc;
        },
        {} as Record<string, NFTData>
      );
    }

    return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCollectionData]);

  const handleFetchingEVM = async () => {
    try {
      if (collectionAddress && protocolSelected?.symbol && wallet?.address) {
        const chain = convertChainByProtocol(protocolSelected.slip0044);
        if (!chain) {
          throw new Error("chain is null");
        }

        const res = await dispatch(
          getDetailNFTsByCollectionThunk({
            chain: chain,
            address: wallet?.address,
            token_addresses: [collectionAddress],
            limit: 10,
          })
        );
        if (
          getDetailNFTsByCollectionThunk.fulfilled.match(res) &&
          res.payload.data &&
          res.payload
        ) {
          const data = res.payload.data.result;
          const result = Array.isArray(data) ? data : [data];

          const updatedResult = result.map((item) => {
            const isActive = transformedData.hasOwnProperty(
              Number(item.token_id)
            );
            return {
              ...item,
              active: isActive,
            };
          });
          dispatch(
            setCursorDetailNFTsByCollection(res.payload.data.cursor ?? null)
          );
          setDetailNFTsByCollection(updatedResult);
          setIsInitialLoading(false);
          setRefreshing(false);
        } else {
          navigation.goBack();
          Utils.showToast({
            msg: t(LanguageKey.common_server_busy),
            type: AppToastType.error,
          });
          throw new Error("error fetchAndConvertData");
        }
      }
    } catch (error) {
      navigation.goBack();
      console.log("error fetchAndConvertData", error);
      Utils.showToast({
        msg: t(LanguageKey.common_server_busy),
        type: AppToastType.error,
      });
      setRefreshing(false);
    }
  };

  const fetchAndConvertData = async () => {
    handleFetchingEVM();
  };

  const handleRightAction = () => {
    if (archived) {
      handleRemoveArchivedCollection();
    } else {
      actionArchivingWithLocal();
    }
  };

  const actionArchivingWithLocal = () => {
    if (
      !collectionData?.token_address ||
      !collectionData ||
      !currentWallet ||
      !currentProtocol ||
      !selectedAccountId
    ) {
      return;
    }
    dispatch(
      updateNFTArchivedSpam({
        collection: collectionData,
        collectionAddress: collectionData?.token_address,
        walletCombineSlip0044Id: `${currentWallet.address}_${currentProtocol.slip0044}`,
        selectedAccountId: selectedAccountId,
      })
    );
    navigation.goBack();
    setModalArchiving(false);
    Utils.showToast({
      msg: t(LanguageKey.nft_archive_collection_complete),
      type: AppToastType.success,
      visibilityTime: 2000,
    });
  };

  useEffect(() => {
    fetchAndConvertData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAndConvertData();
  };
  return {
    detailNFTsByCollection,
    lightMode,
    convertIpfsToHttp,
    isInitialLoading,
    onShowModal,
    onHideModal,
    showModal,
    navigateToNFTUnAddedDetail,
    refreshing,
    onRefresh,
    handlingFetchEVMPagination,
    enablePagination,
    setEnablePagination,
    selectedProtocol,
    t,
    onShowModalArchiving,
    modalArchiving,
    onHideModalArchiving,
    handleRemoveArchivedCollection,
    handleRightAction,
  };
};

export default useNFTCollectionStats;
