import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import { NFTCollectionTab } from "src/core/enum/NFTCollectionTab";
import ReduxKey from "src/core/enum/ReduxKey";
import Slip0044 from "src/core/enum/Slip0044";
import { NFTTokenStandard } from "src/core/enum/TokenStandard";
import MoralisService from "src/core/services/MoralisService";
import { sendGet } from "src/network/requests";
import {
  GetCollectionsMoralisParamType,
  NFTsDetailByCollectionsMoralisParamType,
} from "src/type/MoralisType";
import { compareAddressesEVM } from "src/utils/evmUtils";
import nftUtils from "src/utils/nftUtils";
import tonUtils from "src/utils/tonUtils";
import { RootState } from "../store";
import {
  ImportNFTParams,
  ImportNFTTonParams,
  MigrateNFTType,
  NFTCollection,
  NFTData,
  NFTSlice,
  NFTTonCollection,
  NFTTonData,
  NFTType,
} from "../type/nft.type";
import { getCurrentWalletAndProtocol } from "./token.slice";

const initialState: NFTSlice = {
  tonCollection: {},
  collection: {},
  collectionsMoralis: {},
  detailNFTsByCollection: {},
  cursorCollectionsMoralis: null,
  cursorDetailNFTsByCollection: null,
  currentRoutesTabIndex: 0,
  archivedCollectionFocused: [],
};

export const NFTReducer = createSlice({
  name: "NFTReducer",
  initialState: initialState,
  reducers: {
    deleteEVMCollectionByAccount: (state, action: PayloadAction<string>) => {
      const data = action.payload;
      state.collection[data] = {};
    },
    deleteEVMCollectionByWallet: (
      state,
      action: PayloadAction<{ accountId: string; walletAddress: string }>
    ) => {
      const { accountId, walletAddress } = action.payload;

      if (state.collection[accountId]) {
        if (state.collection[accountId][walletAddress]) {
          delete state.collection[accountId][walletAddress];
        }
      }
    },

    deleteTonCollectionByAccount: (state, action: PayloadAction<string>) => {
      const data = action.payload;
      state.tonCollection[data] = {};
    },
    setUpdateNFT: (state, action: PayloadAction<NFTData>) => {
      const { root, detail } = action.payload;
      if (state.collection && action.payload) {
        const existingCollection = state.collection[root.accountId]?.[
          root.id
        ]?.find(
          (item) =>
            compareAddressesEVM(item.contractAddress, root.contractAddress) &&
            item.network === root.symbol
        );
        if (existingCollection) {
          existingCollection.data = existingCollection.data.map((item) =>
            item.detail.nftId === detail.nftId
              ? {
                  ...action.payload,
                }
              : item
          );
        }
      }
    },
    resetNFTSlice: () => initialState,
    setDeleteNFT: (state, action: PayloadAction<NFTData>) => {
      if (action.payload) {
        const { id, contractAddress, symbol, accountId } = action.payload.root;

        if (state.collection[accountId]) {
          const existingCollection = state.collection[accountId]?.[id].find(
            (item) =>
              compareAddressesEVM(item.contractAddress, contractAddress) &&
              item.network === symbol
          );

          if (existingCollection) {
            existingCollection.data = existingCollection.data.filter(
              (nft) => nft.detail.nftId !== action.payload.detail.nftId
            );

            if (existingCollection.data.length === 0) {
              state.collection[accountId][id] = state.collection[accountId]?.[
                id
              ].filter(
                (item) =>
                  !compareAddressesEVM(item.contractAddress, contractAddress) ||
                  item.network !== symbol
              );

              if (state.collection[accountId]?.[id].length === 0) {
                delete state.collection[accountId]?.[id];
              }
            }
          }
        }
      }
    },
    addToArchivedCollection: (state, action: PayloadAction<string>) => {
      if (!state.archivedCollectionFocused.includes(action.payload)) {
        state.archivedCollectionFocused.push(action.payload);
      }
    },
    updateArchivedCollection: (state, action: PayloadAction<string>) => {
      const index = state.archivedCollectionFocused.indexOf(action.payload);
      if (index !== -1) {
        state.archivedCollectionFocused.splice(index, 1);
      }
    },
    setCursorCollectionsMoralis: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.cursorCollectionsMoralis = action.payload;
    },
    setCursorDetailNFTsByCollection: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.cursorDetailNFTsByCollection = action.payload;
    },
    setTabCollectionIndex: (state, action: PayloadAction<number>) => {
      state.currentRoutesTabIndex = action.payload;
    },
    migrateNFTCollection: (state, action: PayloadAction<MigrateNFTType>) => {
      const { accountId, chainId, walletAddress, idCollection } =
        action.payload;

      const findItemsByWalletAddress = (walletAddress: string) => {
        const results: Record<string, any> = {};
        Object.keys(state.collection).forEach((key) => {
          const [keyWalletAddress] = key.split("_");
          if (keyWalletAddress === walletAddress) {
            results[key] = state.collection[key];
          }
        });
        return results;
      };

      const findItemsByChainId = (
        data: Record<string, any>,
        chainId: number,
        matchCondition: boolean = true
      ) => {
        const results = Object.entries(data).map(([key, items]) => {
          const matchingItems = items?.filter((item: any) =>
            item.data.some((nft: any) => nft.root.protocol.chainId === chainId)
          );
          return [key, matchingItems];
        });

        return results.filter(([_, items]) => items.length > 0);
      };

      const data = findItemsByWalletAddress(walletAddress);

      const dataByChainId = findItemsByChainId(data, chainId);
      if (dataByChainId.length > 0) {
        const [key, collections] = dataByChainId[0];
        const convertCollections = collections as NFTCollection[];
        const convertData = convertCollections.map((item) => ({
          ...item,
          data: item.data.map((item) => ({
            ...item,
            root: {
              ...item.root,
              accountId: accountId,
              id: idCollection,
            },
          })),
        }));
        if (!state.collection[accountId]) {
          state.collection[accountId] = {};
        }
        if (!state.collection[accountId][idCollection]) {
          state.collection[accountId][idCollection] = [];
        }
        state.collection[accountId][idCollection] = convertData;
        delete state.collection[key];
      }
    },

    setDeleteTonNFT: (state, action: PayloadAction<NFTTonData>) => {
      if (action.payload) {
        const { id, symbol, accountId, tonCollectionAddress } =
          action.payload.root;
        const { contractAddress } = action.payload.root;

        if (state.tonCollection[accountId]) {
          const existingCollection = state.tonCollection[accountId]?.[id].find(
            (item) => item.contractAddress === tonCollectionAddress
          );
          if (existingCollection) {
            existingCollection.data = existingCollection.data.filter(
              (nft) => nft.root.contractAddress !== contractAddress
            );
            if (existingCollection.data.length === 0) {
              state.tonCollection[accountId][id] = state.tonCollection[
                accountId
              ]?.[id].filter(
                (item) =>
                  item.contractAddress !== tonCollectionAddress ||
                  item.network !== symbol
              );

              if (state.tonCollection[accountId]?.[id].length === 0) {
                delete state.tonCollection[accountId]?.[id];
              }
            }
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(importNFTTonThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const { id, symbol, name, accountId, tonCollectionAddress } =
            action.payload.root;
          const { nftDetailAll } = action.payload.detail;
          const nftData = action.payload;
          if (state.tonCollection === undefined) {
            state.tonCollection = {};
            state.tonCollection[accountId] = {};
          }
          if (!state.tonCollection[accountId]) {
            state.tonCollection[accountId] = {};
          }
          if (!state.tonCollection[accountId][id]) {
            state.tonCollection[accountId][id] = [];
          }
          if (tonCollectionAddress === NFTCollectionTab.noCollectionId) {
            const existingCollectionWithNoId = state.tonCollection[accountId]?.[
              id
            ]?.find(
              (item) => item.contractAddress === NFTCollectionTab.noCollectionId
            );
            if (existingCollectionWithNoId) {
              existingCollectionWithNoId.data?.unshift(nftData);
            } else {
              const data: NFTTonCollection = {
                name,
                contractAddress: NFTCollectionTab.noCollectionId,
                network: symbol,
                data: [nftData],
              };
              state.tonCollection[accountId]?.[id]?.unshift(data);
            }
            return;
          }
          const existingCollection = state.tonCollection[accountId]?.[id]?.find(
            (item) => item.contractAddress === nftDetailAll.collection?.address
          );

          if (existingCollection) {
            existingCollection.data?.unshift(nftData);
          } else {
            if (!nftDetailAll.collection?.address) {
              return;
            }
            const data: NFTTonCollection = {
              name,
              contractAddress: nftDetailAll.collection?.address,
              network: symbol,
              data: [nftData],
            };
            state.tonCollection[accountId]?.[id]?.unshift(data);
          }
        }
      })
      .addCase(importNFTThunk.fulfilled, (state, action) => {
        if (action.payload) {
          const { id, contractAddress, symbol, name, accountId } =
            action.payload.root;
          const nftData = action.payload;
          if (!state.collection[accountId]) {
            state.collection[accountId] = {};
          }
          if (!state.collection[accountId][id]) {
            state.collection[accountId][id] = [];
          }
          const existingCollection = state.collection[accountId]?.[id]?.find(
            (item) => compareAddressesEVM(item.contractAddress, contractAddress)
          );
          if (existingCollection) {
            existingCollection.data?.unshift(nftData);
          } else {
            const data: NFTCollection = {
              name,
              contractAddress,
              network: symbol,
              tokenStandard: nftData.detail.tokenStandard,
              data: [nftData],
            };

            if (nftData.detail.tokenStandard === NFTTokenStandard.ERC1155) {
              const getBiggestId = (array: NFTCollection[]): number => {
                if (!array || array.length === 0) return 0;

                return Math.max(...array.map((item) => item?.latestId || 0));
              };
              const biggestId = getBiggestId(state.collection[accountId]?.[id]);
              data.latestId = biggestId + 1;
              data.name = `${"unnamed-collection"} #${biggestId + 1}`;
            }
            state.collection[accountId]?.[id]?.unshift(data);
          }
        }
      })
      .addCase(getCollectionsMoralisThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.collectionsMoralis = action.payload;
        }
      })
      .addCase(getCollectionsMoralisThunk.rejected, (state, action) => {
        state.collectionsMoralis = {};
      })
      .addCase(getDetailNFTsByCollectionThunk.fulfilled, (state, action) => {
        if (action.payload) {
          state.detailNFTsByCollection = action.payload;
        }
      })
      .addCase(getDetailNFTsByCollectionThunk.rejected, (state, action) => {
        state.detailNFTsByCollection = {};
      });
  },
});

export const getCollectionsMoralisThunk = createAsyncThunk(
  "/NFT/getCollectionsMoralisThunk",
  async (
    params: GetCollectionsMoralisParamType,
    { rejectWithValue, getState }
  ) => {
    try {
      const moralis = new MoralisService();
      const response = await moralis.getNFTCollectionsByWallet(
        params.address,
        params
      );
      if (response.status !== 200) {
        return rejectWithValue("");
      }
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getDetailNFTsByCollectionThunk = createAsyncThunk(
  "/NFT/getDetailNFTsByCollectionThunk",
  async (
    params: NFTsDetailByCollectionsMoralisParamType,
    { rejectWithValue, getState }
  ) => {
    try {
      const moralis = new MoralisService();
      const response = await moralis.getDetailNFTsByCollection(
        params.address,
        params
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const importNFTThunk = createAsyncThunk(
  "/NFT/importNFTThunk",
  async (params: ImportNFTParams, { rejectWithValue, getState }) => {
    const handleError = (error: any) => {
      return rejectWithValue(error);
    };
    const checkExists = (nftData: NFTData) => {
      const state = getState() as RootState;
      const { nft } = state;

      if (params.id && nft.collection[params.accountId]) {
        const findCollection = nft.collection[params.accountId]?.[
          params.id
        ]?.find((item) =>
          compareAddressesEVM(
            item?.contractAddress,
            nftData.root.contractAddress
          )
        );
        if (findCollection) {
          const { data } = findCollection;

          const nft = data?.some(
            (item) =>
              item.detail.nftId === nftData.detail.nftId &&
              compareAddressesEVM(
                item.root.contractAddress,
                nftData.root.contractAddress
              )
          );
          if (nft) {
            return true;
          }
        }
      }

      return false;
    };

    try {
      if (!params.nftData) {
      }
      const getNFT = await sendGet<NFTType | string>({
        endPoint: nftUtils.convertIpfsUrl(params.nftData.tokenURI),
      });
      let nftDataDetail;
      if (typeof getNFT.data === "string") {
        try {
          const sanitizedData = getNFT.data.replace(/,\s*}/, "}");
          nftDataDetail = JSON.parse(sanitizedData);
        } catch (error) {
          console.log("JSON parse nftDataDetail error: ", error);
          return handleError(
            "Lỗi khi phân tích dữ liệu NFT. Vui lòng thử lại sau."
          );
        }
      } else {
        nftDataDetail = getNFT.data;
      }

      if (!nftDataDetail) {
        return handleError(
          "Không tìm thấy dữ liệu NFT. Vui lòng kiểm tra lại địa chỉ hợp đồng hoặc ID NFT."
        );
      }

      const dataReturn: NFTData = {
        root: {
          contractAddress: params.contractAddress,
          symbol: params.protocolData.symbol,
          id: params.id,
          protocol: params.protocolData,
          accountId: params.accountId,
          name: params.nftData.name,
          owner: params.nftData.owner,
          tokenURI: params.nftData.tokenURI,
        },
        detail: {
          ...nftDataDetail,
          network_image: params.protocolData.logo,
          nftId: params.nftId,
          quantity: params.nftData.quantity,
          tokenStandard: params.nftData.tokenStandard,
        },
      };
      if (checkExists(dataReturn)) {
        return handleError("NFT đã tồn tại trong danh sách của bạn.");
      } else {
        return dataReturn;
      }
    } catch (error: any) {
      console.log(error);
      return handleError(error);
    }
  }
);

export const importNFTTonThunk = createAsyncThunk(
  "/NFT/importNFTTonThunk",
  async (params: ImportNFTTonParams, { rejectWithValue, getState }) => {
    try {
      const lastPreview =
        params.dataTonNFT.previews?.[params.dataTonNFT.previews.length - 1];
      const dataReturn: NFTTonData = {
        root: {
          contractAddress: params.contractAddress,
          symbol: params.protocolData.symbol,
          id: params.id,
          protocol: params.protocolData,
          accountId: params.accountId,
          owner: params.dataTonNFT.owner?.address ?? "",
          name: params.dataTonNFT.collection?.name ?? "",
          tonCollectionAddress:
            params.dataTonNFT.collection?.address ??
            NFTCollectionTab.noCollectionId,
        },
        detail: {
          network_image: params.protocolData.logo,
          image_data: lastPreview?.url ?? params.dataTonNFT.metadata.image,
          nftDetailAll: params.dataTonNFT,
        },
      };
      if (tonUtils.checkExists(dataReturn, params, getState)) {
        console.log("Error check exist import nft");
        return rejectWithValue("NFT đã tồn tại trong danh sách của bạn.");
      } else {
        return dataReturn;
      }
    } catch (error: any) {
      console.log(error, "error");
      return rejectWithValue("Lỗi khi nhập NFT. Vui lòng thử lại sau.");
    }
  }
);

export const getCollectionById = createSelector(
  [getCurrentWalletAndProtocol, (state: RootState) => state.nft.collection],
  (data, collection) => {
    if (!data) return [];
    const { currentProtocol, currentWallet, accountId } = data;
    if (!accountId) {
      return [];
    }
    return collection[accountId]?.[
      `${currentWallet.address}_${currentProtocol.slip0044}`
    ];
  }
);

export const getTonCollectionById = createSelector(
  [getCurrentWalletAndProtocol, (state: RootState) => state.nft?.tonCollection],
  (data, tonCollection) => {
    if (!data) return [];
    const { currentProtocol, currentWallet, accountId } = data;
    if (!accountId || !tonCollection?.[accountId]) {
      return [];
    }
    return tonCollection?.[accountId]?.[
      `${currentWallet.address}_${currentProtocol.slip0044}`
    ];
  }
);
export const getTonCollectionWithoutCurrentProtocol = createSelector(
  (state: RootState, params: { accountId: string; address: string }) => ({
    tonCollection: state.nft.tonCollection,
    accountId: params.accountId,
    address: params.address,
  }),
  ({ tonCollection, accountId, address }) => {
    if (!accountId || !tonCollection?.[accountId]) return [];

    const key = `${address}_${Slip0044.Ton}`;
    return tonCollection[accountId]?.[key] || [];
  }
);

export const getAllCollection = (state: RootState) => state.nft.collection;
export const getCursorCollectionsMoralis = (state: RootState) =>
  state?.nft.cursorCollectionsMoralis;
export const getCursorDetailNFTsByCollection = (state: RootState) =>
  state?.nft.cursorDetailNFTsByCollection;
export const getCollectionsMoralis = (state: RootState) =>
  state?.nft.collectionsMoralis;
export const getDetailNFTsByCollection = (state: RootState) =>
  state?.nft.detailNFTsByCollection;
export const getNFTState = (state: RootState) => state.nft;
export const getCurrentTabIndex = (state: RootState) =>
  state.nft.currentRoutesTabIndex;
export const getListCollectionSpamFocused = (state: RootState) =>
  state.nft.archivedCollectionFocused;

export const {
  deleteEVMCollectionByAccount,
  deleteEVMCollectionByWallet,
  deleteTonCollectionByAccount,
  setUpdateNFT,
  setDeleteNFT,
  resetNFTSlice,
  migrateNFTCollection,
  setCursorCollectionsMoralis,
  setCursorDetailNFTsByCollection,
  setDeleteTonNFT,
  setTabCollectionIndex,
  addToArchivedCollection,
  updateArchivedCollection,
} = NFTReducer.actions;

const appPersistConfig = {
  key: ReduxKey.NFTReducer,
  storage: AsyncStorage,
  blacklist: [
    "currentRoutesTabIndex",
    "cursorCollectionsMoralis",
    "cursorDetailNFTsByCollection",
  ],
};

const exploreSliceReducer = persistReducer(
  appPersistConfig,
  NFTReducer.reducer
);
export default exploreSliceReducer;
