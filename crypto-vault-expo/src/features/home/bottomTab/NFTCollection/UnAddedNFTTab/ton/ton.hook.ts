import { Address } from "@ton/core";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import {
  useCurrentWallet,
  useProtocolSelected,
} from "src/core/redux/slice/account.selector";
import { getSelectedProtocolId } from "src/core/redux/slice/account.slice";
import { getTonCollectionById } from "src/core/redux/slice/NFT/NFTImport.slice";
import {
  getEnableTonPagination,
  getNFTArchivedSpam,
  setEnableTonPagination,
} from "src/core/redux/slice/NftData.slice";
import TonServices from "src/core/services/TonServices";
import { Nftitem } from "src/core/services/TonServices/type";
import GlobalUtils from "src/core/utils/globalUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";

const OFFSET = 20;

const useUnAddedNFTTab = ({ navigation }: RootNavigationType) => {
  const tonServices = new TonServices();

  const selectedProtocolId = useAppSelector(getSelectedProtocolId);
  const wallet = useCurrentWallet();
  const protocolSelected = useProtocolSelected();
  const dispatch = useAppDispatch();

  const enablePagination = useAppSelector(getEnableTonPagination);
  const collection = useAppSelector(getTonCollectionById);
  const nftArchivedSpam = useAppSelector(getNFTArchivedSpam);

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [tonNFTs, setTonNFTs] = useState<Nftitem[]>([]);

  const navigateToNFTUnAddedDetail = async (nft: Nftitem) => {
    const metadata = nft.metadata ? nft.metadata : {};
    navigation.navigate(HomeStackScreenKey.NFTUnAddedDetail, {
      detail: nft,
      metadata: metadata,
      added: nft.active,
    });
  };

  const handlingTonPagination = async (reset = false) => {
    try {
      if (!protocolSelected || !wallet?.address) {
        throw new Error("Missing required protocol or wallet address");
      }

      const tonAddress = Address.parse(wallet.address).toRawString();
      const offset = reset ? 0 : tonNFTs.length;

      const dataNFTItems = await tonServices.getNFTItemsInCollectionByOwner(
        tonAddress,
        {
          limit: OFFSET,
          offset,
        }
      );
      if (!dataNFTItems || dataNFTItems.length === 0) {
        if (reset) setTonNFTs([]);
        dispatch(setEnableTonPagination(false));
        return;
      }

      const updatedResult = dataNFTItems.map((item) => {
        const isActive = item.address.toString() in transformedData;
        return {
          ...item,
          active: isActive,
        };
      });

      setTonNFTs(reset ? updatedResult : [...tonNFTs, ...updatedResult]);
      dispatch(setEnableTonPagination(dataNFTItems.length === OFFSET));
    } catch (error) {
      console.error("Error in handlingTonPagination:", error);
      if (reset) setTonNFTs([]);
      dispatch(setEnableTonPagination(false));
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  const handlingPagination = async (reset = false) => {
    await handlingTonPagination(reset);
  };

  const transformedData = useMemo(() => {
    try {
      if (collection && collection.length > 0) {
        const mergedData = collection
          .filter((item) => item && Array.isArray(item.data))
          .flatMap((item) => item.data);
        if (mergedData.length === 0) {
          return {};
        }
        const dataObject = mergedData.reduce(
          (acc: { [key: string]: typeof item }, item) => {
            if (item && item.root && item.root.contractAddress) {
              const parseKeyItem = Address.parse(
                item.root.contractAddress
              ).toRawString();
              acc[parseKeyItem] = item;
              return acc;
            }
            return {};
          },
          {}
        );
        return dataObject;
      }
      return {};
    } catch (error) {
      console.log("🚀 ~ transformedData ~ error:", error);
      return {};
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection]);

  const getDataCollectionYouOwned = async () => {
    await handlingTonPagination(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    getDataCollectionYouOwned();
  };
  const fetchDataCollection = async () => {
    await getDataCollectionYouOwned();
  };
  useEffect(() => {
    fetchDataCollection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProtocolId, wallet, nftArchivedSpam, collection]);

  return {
    initialLoading,
    refreshing,
    onRefresh,
    enablePagination,
    handlingPagination,
    tonNFTs,
    navigateToNFTUnAddedDetail,
  };
};

export default useUnAddedNFTTab;
