import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import ReduxKey from 'src/core/enum/ReduxKey';
import { getCurrentWalletAndProtocol } from 'src/core/redux/slice/customToken/addCustomToken.slice';
import { NftTonNewItem } from 'src/core/services/TonServices/type';
import { RootState } from '../store';
import { UnAddedNFTListType } from './NFT/NFTImport.type';

interface NftDataState {
    nftMetadataCache: Record<string, NftTonNewItem>;
    nftArchivedSpam: {
        [idAccount: string]: {
            [idAddress: string]: UnAddedNFTListType[];
        };
    };
    enableTonPagination: boolean;
}

const initialState: NftDataState = {
    nftMetadataCache: {},
    nftArchivedSpam: {},
    enableTonPagination: false,
};

const nftSlice = createSlice({
    name: 'NftDataState',
    initialState,
    reducers: {
        setEnableTonPagination: (state, action: PayloadAction<boolean>) => {
            state.enableTonPagination = action.payload;
        },

        setNftMetadata: (
            state,
            action: PayloadAction<{ nftId: string; metadata: NftTonNewItem }>,
        ) => {
            const { nftId, metadata } = action.payload;
            state.nftMetadataCache[nftId] = metadata;
        },
        updateNFTArchivedSpam: (
            state,
            action: PayloadAction<{
                collection: Partial<UnAddedNFTListType> | null;
                collectionAddress: string;
                walletCombineSlip0044Id: string;
                selectedAccountId: string;
            }>,
        ) => {
            const {
                collection,
                collectionAddress,
                selectedAccountId,
                walletCombineSlip0044Id,
            } = action.payload;

            if (!collection || !collectionAddress) return;
            if (state.nftArchivedSpam === undefined) {
                state.nftArchivedSpam = {};
                state.nftArchivedSpam[selectedAccountId] = {};
            }
            if (!state.nftArchivedSpam[selectedAccountId]) {
                state.nftArchivedSpam[selectedAccountId] = {};
            }
            if (
                !state.nftArchivedSpam[selectedAccountId][
                    walletCombineSlip0044Id
                ]
            ) {
                state.nftArchivedSpam[selectedAccountId][
                    walletCombineSlip0044Id
                ] = [];
            }

            const sanitizedCollection = {
                collection_banner_image:
                    collection.collection_banner_image ?? null,
                collection_logo: collection.collection_logo ?? null,
                contract_type: collection.contract_type ?? '',
                floor_price: collection.floor_price ?? null,
                floor_price_currency: collection.floor_price_currency ?? null,
                floor_price_usd: collection.floor_price_usd ?? null,
                name: collection.name ?? '',
                possible_spam: collection.possible_spam ?? false,
                symbol: collection.symbol ?? '',
                token_address: collection.token_address ?? '',
                verified_collection: collection.verified_collection ?? false,
                ...collection,
            };
            state.nftArchivedSpam[selectedAccountId][
                walletCombineSlip0044Id
            ].unshift(sanitizedCollection);
        },

        deleteNFTArchivedSpam: (
            state,
            action: PayloadAction<{
                selectedAccountId: string;
                walletCombineSlip0044Id: string;
                address: string;
            }>,
        ) => {
            const { selectedAccountId, walletCombineSlip0044Id, address } =
                action.payload;

            if (
                state.nftArchivedSpam[selectedAccountId] &&
                state.nftArchivedSpam[selectedAccountId][
                    walletCombineSlip0044Id
                ]
            ) {
                state.nftArchivedSpam[selectedAccountId][
                    walletCombineSlip0044Id
                ] = state.nftArchivedSpam[selectedAccountId][
                    walletCombineSlip0044Id
                ].filter(nft => nft.token_address !== address);

                if (
                    state.nftArchivedSpam[selectedAccountId][
                        walletCombineSlip0044Id
                    ].length === 0
                ) {
                    delete state.nftArchivedSpam[selectedAccountId][
                        walletCombineSlip0044Id
                    ];
                }

                if (
                    Object.keys(state.nftArchivedSpam[selectedAccountId])
                        .length === 0
                ) {
                    delete state.nftArchivedSpam[selectedAccountId];
                }
            }
        },
    },
});

export const getNFTArchivedSpam = createSelector(
    [
        getCurrentWalletAndProtocol,
        (state: RootState) => state.NFTDataSlice.nftArchivedSpam,
    ],
    (data, nftArchivedSpam) => {
        if (!data) return [];
        const { currentProtocol, currentWallet, accountId } = data;
        if (!accountId || !nftArchivedSpam?.[accountId]) {
            return [];
        }
        return nftArchivedSpam?.[accountId]?.[
            `${currentWallet.address}_${currentProtocol.slip0044}`
        ];
    },
);

export const getNFTMetadata = (state: RootState) => {
    return state.NFTDataSlice.nftMetadataCache;
};

export const getEnableTonPagination = (state: RootState) => {
    return state.NFTDataSlice.enableTonPagination;
};

export const {
    setNftMetadata,
    updateNFTArchivedSpam,
    deleteNFTArchivedSpam,
    setEnableTonPagination,
} = nftSlice.actions;

const NFTDataConfig = {
    key: ReduxKey.NFTDataSlice,
    storage: AsyncStorage,
    blacklist: ['enableTonPagination'],
};

const NFTDataSliceReducer = persistReducer(NFTDataConfig, nftSlice.reducer);

export default NFTDataSliceReducer;
