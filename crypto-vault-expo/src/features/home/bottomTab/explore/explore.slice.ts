import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { t } from 'i18next';
import { persistReducer } from 'redux-persist';
import AppToastType from 'src/core/enum/AppToastType';
import { ClaimTokenTab } from 'src/core/enum/ClaimTokenTab';
import ReduxKey from 'src/core/enum/ReduxKey';
import LanguageKey from 'src/core/locales/LanguageKey';
import { sendPost } from 'src/core/network/requests';
import sendGet from 'src/core/network/requests/sendGet';
import { RootState } from 'src/core/redux/store';
import { ErrorFromBEType } from 'src/core/services/ErrorHandler/error.type';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import Utils from 'src/core/utils/commonUtils';
import {
    ClaimDetailProps,
    DataGottedNFT,
} from '../../projectDetails/confirm/confirmClaimToken.type';
import { DataGetOwnedType } from '../../projectDetails/PriceFeedList/PriceFeedList.type';
import { TopEVMsItem } from '../../Top10/EVMs/evm.type';
import { TopTokenItem } from '../../Top10/Tokens/tokens.type';
import {
    ClaimableType,
    ClaimTokenHistoryParams,
    ClaimTokenParams,
    ClaimTokenPostingParams,
    ClaimTokenThunkProps,
    DataClaimDetailType,
    GetInformationLinkTonProps,
    GetPriceFeedParams,
    LinkingTonAddressParams,
    LinkingTonAddressResponse,
    PriceFeedTypeContainer,
    ProjectList,
    TokenClaimsListDataProps,
    Top10EVMsProps,
    Top10TokensProps,
    TopNMVs,
    TopNMVsState,
    TransactionDetailParams,
} from './explore.type';

const initialState: TopNMVsState = {
    loading: false,
    firstLoading: false,
    refreshing: false,
    error: undefined,
    dataTopNMVs: [],
    dataProjectLists: [],
    dataClaimable: null,
    dataClaimHistory: [],
    dataOwnedNFTs: [],
    dataPriceFeed: [],
    dataClaimDetail: null,
    page: 1,
    perPage: 10,
    loadingGetOwned: false,
    pageUsingPriceFeed: 1,
    claimProjectOnGoing: null,
    firstLoadingList: true,
    loadingList: false,
    dataPriceFeedInDetail: [],
    loadingDetail: true,
    linkingTonAddress: null,
    tabContainer: {
        index: 0,
        routes: [
            {
                key: ClaimTokenTab.ProjectDetail,
                title: LanguageKey.top_tab_project_details,
            },
            {
                key: ClaimTokenTab.HistoryDetail,
                title: LanguageKey.common_claim_history,
            },
        ],
    },
    dataCheckNFTsGotted: null,
    top10EVMs: [],
    top10Tokens: [],
};

export const handleGetPriceFeedFirst = createAsyncThunk(
    'explore/getPriceFeedFirst',
    async (
        {
            page,
            perPage,
            claimableTokenProject,
            contractAddress,
            nftId,
        }: GetPriceFeedParams,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendGet<PriceFeedTypeContainer>({
                endPoint: `/mobile/required-nft`,
                params: {
                    page: page,
                    perPage: perPage,
                    claimableTokenProject: claimableTokenProject,
                    contractAddress: contractAddress,
                    nftId: nftId,
                },
            });
            if (
                response.status === 200 &&
                response.data &&
                response.data.items
            ) {
                return response.data.items;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetPriceFeedFirstDetail = createAsyncThunk(
    'explore/getPriceFeedFirstDetail',
    async (
        {
            page,
            perPage,
            claimableTokenProject,
            contractAddress,
            nftId,
        }: GetPriceFeedParams,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendGet<PriceFeedTypeContainer>({
                endPoint: `/mobile/required-nft`,
                params: {
                    page: page,
                    perPage: perPage,
                    claimableTokenProject: claimableTokenProject,
                    contractAddress: contractAddress,
                    nftId: nftId,
                },
            });
            if (
                response.status === 200 &&
                response.data &&
                response.data.items
            ) {
                return response?.data?.items;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetTop10EVMs = createAsyncThunk(
    'explore/handleGetTop10EVMs',
    async ({ page, perPage }: GetPriceFeedParams, { rejectWithValue }) => {
        try {
            const response = await sendGet<Top10EVMsProps>({
                endPoint: `/mobile/tokens/trending-native`,
                params: {
                    page: page,
                    perPage: perPage,
                },
            });
            if (response.status === 200 && response.data) {
                return response?.data?.items;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetTop10Tokens = createAsyncThunk(
    'explore/handleGetTop10Tokens',
    async ({ page, perPage }: GetPriceFeedParams, { rejectWithValue }) => {
        try {
            const response = await sendGet<Top10TokensProps>({
                endPoint: `/mobile/tokens/trending`,
                params: {
                    page: page,
                    perPage: perPage,
                },
            });
            if (response.status === 200 && response.data) {
                return response?.data.items;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetPriceFeed = createAsyncThunk(
    'explore/getPriceFeed',
    async (
        {
            page,
            perPage,
            claimableTokenProject,
            contractAddress,
        }: GetPriceFeedParams,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendGet<PriceFeedTypeContainer>({
                endPoint: '/mobile/required-nft',
                params: {
                    page,
                    perPage,
                    claimableTokenProject,
                    contractAddress,
                },
            });
            if (
                response.status === 200 &&
                response.data &&
                response.data.items &&
                response.data.items.length > 0
            ) {
                return response?.data?.items;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetOwnedNFTs = createAsyncThunk(
    'explore/getOwnedNFTs',
    async (
        { claimableTokenProjectId, polygonWalletAddress, t }: ClaimTokenParams,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendGet<DataGetOwnedType>({
                endPoint: '/mobile/claimable-token/get-owned-project-nfts',
                params: {
                    claimableTokenProjectId: claimableTokenProjectId,
                    nftWalletAddress: polygonWalletAddress,
                },
            });
            if (
                response.status === 200 &&
                response.data &&
                response.data.nfts
            ) {
                return response.data.nfts;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetInformationLinkTon = createAsyncThunk(
    'explore/getInformationLinkTon',
    async (
        {
            claimableTokenProjectId,
            nftWalletAddress,
        }: GetInformationLinkTonProps,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendGet<
                LinkingTonAddressResponse | ErrorFromBEType
            >({
                endPoint: '/mobile/wallet-address-mapping/get-wallet',
                params: {
                    projectId: claimableTokenProjectId,
                    nftWalletAddress: nftWalletAddress,
                },
            });

            if (response.data && 'message' in response.data) {
                throw new Error(t(LanguageKey.common_server_busy));
            }

            return response.data as LinkingTonAddressResponse;
        } catch (error: any) {
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
            return rejectWithValue(error.message || 'Something went wrong');
        }
    },
);

export const handleLinkingTonAddress = createAsyncThunk(
    'explore/linkingTonAddress',
    async (
        {
            claimableTokenProjectId,
            nftWalletAddress,
            tokenReceiverWalletAddress,
            messageDecoded,
            signatureHash,
        }: LinkingTonAddressParams,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendPost<
                LinkingTonAddressResponse | ErrorFromBEType
            >({
                endPoint: '/mobile/wallet-address-mapping/create',
                body: {
                    data: {
                        claimableTokenProjectId: claimableTokenProjectId,
                        nftWalletAddress: nftWalletAddress,
                        tokenReceiverWalletAddress: tokenReceiverWalletAddress,
                    },
                    message: messageDecoded,
                    signature: signatureHash,
                },
            });
            if (response.data && response.status !== 201) {
                throw new Error(
                    t(LanguageKey.claim_token_link_ton_address_failed),
                );
            }

            return response.data as LinkingTonAddressResponse;
        } catch (error: any) {
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetTopNMVsListData = createAsyncThunk(
    'explore/getTopNMVsListData',
    async (
        { walletAddress, claimableTokenProject }: ClaimTokenHistoryParams,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendGet<TopNMVs[]>({
                endPoint: '/mobile/tokens/trending-evm',
            });
            if (response.status === 200 && response.data) {
                return response.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetHistoryClaimData = createAsyncThunk(
    'explore/getHistoryClaimData',
    async (
        { walletAddress, claimableTokenProject }: ClaimTokenHistoryParams,
        { rejectWithValue },
    ) => {
        const response = await sendGet<TransactionHistoryDataType[]>({
            endPoint: '/mobile/claimable-token/history',
            params: {
                walletAddress: walletAddress,
                claimableTokenProject: claimableTokenProject,
            },
        });
        if (response.status === 200 && response.data) {
            if (response.data.length > 0) {
                return response.data.reverse();
            }
            return response.data;
        } else {
            return rejectWithValue(response.data);
        }
    },
);

export const handlePostClaimListData = createAsyncThunk(
    'explore/handlePostClaimListData',
    async (
        {
            protocolId,
            polygonWalletAddress,
            tonWalletAddress,
            projectClaimableTokenId,
            nftId,
        }: ClaimTokenPostingParams,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendPost<any>({
                endPoint: '/mobile/claimable-token/claim',
                body: {
                    protocolId: protocolId,
                    polygonWalletAddress: polygonWalletAddress,
                    tonWalletAddress: tonWalletAddress,
                    projectClaimableTokenId: projectClaimableTokenId,
                    nftId: nftId,
                },
            });
            if (response.status === 200) {
                return response.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetTokenClaimsListData = createAsyncThunk(
    'explore/getTokenClaimsListData',
    async (
        { page, perPage }: TokenClaimsListDataProps,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendGet<ProjectList>({
                endPoint: '/mobile/claimable-token/get/list-project',
                params: {
                    page: page,
                    perPage: perPage,
                },
            });

            if (
                response.status === 200 &&
                response.data &&
                response.data.items &&
                response.data.items.length > 0
            ) {
                return response.data.items;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetCountingListOnGoing = createAsyncThunk(
    'explore/getCountingListOnGoing',
    async (_, { rejectWithValue }) => {
        try {
            const response = await sendGet<ProjectList>({
                endPoint: '/mobile/claimable-token/get/list-project',
                params: {
                    page: 0,
                    perPage: 20,
                },
            });
            if (response.status === 200 && response.data) {
                return response.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleClaimTokenThunk = createAsyncThunk(
    'explore/claimToken',
    async (
        {
            polygonWalletAddress,
            projectClaimableTokenId,
            nftId,
        }: ClaimTokenThunkProps,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendPost<ClaimDetailProps | ErrorFromBEType>(
                {
                    body: {
                        nftWalletAddress: polygonWalletAddress,
                        projectClaimableTokenId: projectClaimableTokenId,
                        nftId: nftId,
                    },
                    endPoint: '/mobile/claimable-token/claim',
                },
            );
            if (response.status !== 201) {
                Utils.showToast({
                    msg: t(LanguageKey.claim_token_error_status),
                    type: AppToastType.error,
                });
                return rejectWithValue(t(LanguageKey.claim_token_error_status));
            }
            return response.data as ClaimDetailProps;
        } catch (error) {
            console.log(error, 'handleClaimTokenThunk error');
            Utils.showToast({
                msg: t(LanguageKey.claim_token_error_status),
                type: AppToastType.error,
            });
            return rejectWithValue(t(LanguageKey.claim_token_error_status));
        }
    },
);

export const handleGetTokenClaimsListDataFirst = createAsyncThunk(
    'explore/handleGetTokenClaimsListDataFirst',
    async (_, { rejectWithValue }) => {
        try {
            const response = await sendGet<ProjectList>({
                endPoint: '/mobile/claimable-token/get/list-project',
                params: {
                    page: 0,
                    perPage: 10,
                },
            });
            if (
                response.status === 200 &&
                response.data &&
                response.data.items
            ) {
                return response.data.items;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleClaimTokenSpecified = createAsyncThunk(
    'explore/getClaimTokenSpecified',
    async (
        { claimableTokenProjectId }: ClaimTokenParams,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendGet<ClaimableType | null>({
                endPoint: `/mobile/claimable-token/get-detail/${claimableTokenProjectId}`,
            });
            if (response.status === 200 && response.data) {
                return response.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleClaimTokenTransactionDetail = createAsyncThunk(
    'explore/getClaimTransactionDetail',
    async ({ claimGroupId }: TransactionDetailParams, { rejectWithValue }) => {
        try {
            const response = await sendGet<DataClaimDetailType>({
                endPoint: `/mobile/claimable-token/history/detail/${claimGroupId}`,
            });
            if (response.status === 200 && response.data) {
                console.log(response.data);
                return response.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetOwnedNFTsContainer = createAsyncThunk(
    'explore/handleGetOwnedNFTsContainer',
    async (
        { claimableTokenProjectId, polygonWalletAddress, t }: ClaimTokenParams,
        { rejectWithValue },
    ) => {
        try {
            const response = await sendGet<DataGottedNFT | null>({
                endPoint: '/mobile/claimable-token/get-owned-project-nfts',
                params: {
                    claimableTokenProjectId: claimableTokenProjectId,
                    nftWalletAddress: polygonWalletAddress,
                },
            });
            if (response.status === 200 && response.data) {
                return response.data;
            } else {
                return rejectWithValue(response.data);
            }
        } catch (error: any) {
            Utils.showToast({
                msg: t(LanguageKey.common_server_busy),
                type: AppToastType.error,
            });
            return rejectWithValue(error.message);
        }
    },
);

const exploreSlice = createSlice({
    name: 'explore',
    initialState,
    reducers: {
        setRefreshing: (state, action: PayloadAction<boolean>) => {
            state.refreshing = action.payload;
        },
        setFirstLoading: (state, action: PayloadAction<boolean>) => {
            state.firstLoading = action.payload;
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
        setPageUsingPriceFeed: (state, action: PayloadAction<number>) => {
            state.pageUsingPriceFeed = action.payload;
        },
        setDataClaimable: (
            state,
            action: PayloadAction<ClaimableType | null>,
        ) => {
            state.dataClaimable = action.payload;
        },
        setTabIndex: (state, action: PayloadAction<number>) => {
            state.tabContainer.index = action.payload;
        },
        setDataTransaction: (
            state,
            action: PayloadAction<TransactionHistoryDataType[]>,
        ) => {
            state.dataClaimHistory = action.payload;
        },
        setDataTopTokens: (
            state,
            action: PayloadAction<TopTokenItem[] | null>,
        ) => {
            state.top10Tokens = action.payload;
        },
        setDataTopEVMs: (
            state,
            action: PayloadAction<TopEVMsItem[] | null>,
        ) => {
            state.top10EVMs = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(handleLinkingTonAddress.fulfilled, (state, action) => {
                state.linkingTonAddress = action.payload;
            })
            .addCase(handleGetInformationLinkTon.fulfilled, (state, action) => {
                state.linkingTonAddress = action.payload;
            })
            .addCase(handleGetPriceFeedFirstDetail.pending, state => {
                state.loading = true;
                state.error = undefined;
                state.refreshing = true;
            })
            .addCase(
                handleGetPriceFeedFirstDetail.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.refreshing = false;
                    if (action.payload) {
                        state.dataPriceFeedInDetail = action.payload;
                    }
                },
            )
            .addCase(
                handleGetPriceFeedFirstDetail.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error =
                        action.payload instanceof Error
                            ? action.payload.message
                            : 'Unknown error';
                    state.refreshing = false;
                },
            )
            .addCase(handleGetCountingListOnGoing.pending, state => {
                state.loading = true;
                state.error = undefined;
                state.refreshing = true;
            })
            .addCase(
                handleGetCountingListOnGoing.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.refreshing = false;
                    state.claimProjectOnGoing = action.payload;
                },
            )
            .addCase(handleGetCountingListOnGoing.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload instanceof Error
                        ? action.payload.message
                        : 'Unknown error';
                state.refreshing = false;
            })
            .addCase(handleClaimTokenTransactionDetail.pending, state => {
                state.loadingDetail = true;
                state.error = undefined;
                state.refreshing = true;
            })
            .addCase(
                handleClaimTokenTransactionDetail.fulfilled,
                (state, action) => {
                    state.loadingDetail = false;
                    state.refreshing = false;
                    state.dataClaimDetail = action.payload;
                },
            )
            .addCase(
                handleClaimTokenTransactionDetail.rejected,
                (state, action) => {
                    state.loadingDetail = false;
                    state.error =
                        action.payload instanceof Error
                            ? action.payload.message
                            : 'Unknown error';
                    state.refreshing = false;
                },
            )
            .addCase(handleGetPriceFeed.pending, state => {
                state.loading = true;
                state.error = undefined;
                state.refreshing = true;
            })
            .addCase(handleGetPriceFeed.fulfilled, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                if (action.payload) {
                    state.dataPriceFeed = [
                        ...(state.dataPriceFeed || []),
                        ...action.payload,
                    ];
                }
            })
            .addCase(handleGetPriceFeed.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload instanceof Error
                        ? action.payload.message
                        : 'Unknown error';
                state.refreshing = false;
            })
            .addCase(handleGetPriceFeedFirst.pending, state => {
                state.loading = true;
                state.error = undefined;
                state.refreshing = true;
            })
            .addCase(handleGetPriceFeedFirst.fulfilled, (state, action) => {
                state.loading = false;
                state.refreshing = false;
                if (action.payload) {
                    state.dataPriceFeed = action.payload;

                    state.pageUsingPriceFeed = 2;
                }
            })
            .addCase(handleGetPriceFeedFirst.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload instanceof Error
                        ? action.payload.message
                        : 'Unknown error';
                state.refreshing = false;
            })
            .addCase(handleGetTopNMVsListData.pending, state => {
                state.loading = true;
                state.error = undefined;
                state.refreshing = true;
            })
            .addCase(handleGetTopNMVsListData.fulfilled, (state, action) => {
                state.loading = false;
                state.dataTopNMVs = action.payload;
                state.refreshing = false;
            })
            .addCase(handleGetTokenClaimsListData.pending, state => {
                state.error = undefined;
            })
            .addCase(
                handleGetTokenClaimsListData.fulfilled,
                (state, action) => {
                    if (action.payload) {
                        state.dataProjectLists = [
                            ...(state.dataProjectLists || []),
                            ...action.payload,
                        ];
                        state.page = state.page + 1;
                    }
                },
            )
            .addCase(handleGetTokenClaimsListData.rejected, (state, action) => {
                state.error =
                    action.payload instanceof Error
                        ? action.payload.message
                        : 'Unknown error in handleGetTokenClaimsListData';
            })
            .addCase(handleGetTokenClaimsListDataFirst.pending, state => {
                state.error = undefined;
                state.refreshing = true;
            })
            .addCase(
                handleGetTokenClaimsListDataFirst.fulfilled,
                (state, action) => {
                    state.dataProjectLists = action.payload;
                    state.refreshing = false;
                    state.firstLoadingList = false;
                    state.page = 2;
                },
            )
            .addCase(
                handleGetTokenClaimsListDataFirst.rejected,
                (state, action) => {
                    state.error =
                        action.payload instanceof Error
                            ? action.payload.message
                            : 'Unknown error in handleGetTokenClaimsListDataFirst';
                    state.refreshing = false;
                },
            )
            .addCase(handleClaimTokenSpecified.pending, state => {
                state.firstLoading = true;
                state.error = undefined;
                state.refreshing = true;
            })
            .addCase(handleClaimTokenSpecified.fulfilled, (state, action) => {
                state.firstLoading = false;
                state.dataClaimable = action.payload;
                state.refreshing = false;
            })
            .addCase(handleClaimTokenSpecified.rejected, (state, action) => {
                state.firstLoading = false;
                state.error =
                    action.payload instanceof Error
                        ? action.payload.message
                        : 'Unknown error in handleClaimTokenSpecified';
                state.refreshing = false;
            })
            .addCase(handleGetOwnedNFTs.pending, state => {
                state.loadingGetOwned = true;
                state.error = undefined;
            })
            .addCase(handleGetOwnedNFTs.fulfilled, (state, action) => {
                state.loadingGetOwned = false;
                state.dataOwnedNFTs = action.payload;
            })
            .addCase(handleGetOwnedNFTs.rejected, (state, action) => {
                state.loadingGetOwned = false;
                state.error = action.error.message;
            })

            .addCase(handleGetHistoryClaimData.pending, state => {
                state.loading = true;
                state.error = undefined;
                state.refreshing = true;
            })
            .addCase(handleGetHistoryClaimData.fulfilled, (state, action) => {
                state.loading = false;
                state.dataClaimHistory = action.payload;
                state.refreshing = false;
            })
            .addCase(handleGetHistoryClaimData.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload instanceof Error
                        ? action.payload.message
                        : 'Unknown error in handleGetOwnedNFTs in handleGetHistoryClaimData';
                state.refreshing = false;
            })
            .addCase(handleGetOwnedNFTsContainer.pending, state => {
                state.loadingGetOwned = true;
                state.error = undefined;
            })
            .addCase(handleGetOwnedNFTsContainer.fulfilled, (state, action) => {
                state.loadingGetOwned = false;
                state.dataCheckNFTsGotted = action.payload;
            })
            .addCase(handleGetOwnedNFTsContainer.rejected, (state, action) => {
                state.loadingGetOwned = false;
                state.error = action.error.message;
            })
            .addCase(handleGetTop10EVMs.fulfilled, (state, action) => {
                state.loadingGetOwned = false;
                state.top10EVMs = action.payload;
            })
            .addCase(handleGetTop10EVMs.rejected, (state, action) => {
                state.loadingGetOwned = false;
                state.error = action.error.message;
            })
            .addCase(handleGetTop10Tokens.fulfilled, (state, action) => {
                state.loadingGetOwned = false;
                state.top10Tokens = action.payload;
            })
            .addCase(handleGetTop10Tokens.rejected, (state, action) => {
                state.loadingGetOwned = false;
                state.error = action.error.message;
            });
    },
});

export const getTop10Tokens = (state: RootState) => state.explore.top10Tokens;
export const getTop10EVMs = (state: RootState) => state.explore.top10EVMs;
export const getTopNMVsListData = (state: RootState) => state.explore;
export const getRefreshing = (state: RootState) => state.explore.refreshing;
export const getDataClaimHistory = (state: RootState) =>
    state.explore.dataClaimHistory;
export const getDataClaimable = (state: RootState) =>
    state.explore.dataClaimable;
export const getDataPage = (state: RootState) => state.explore.page;
export const getDataPerPage = (state: RootState) => state.explore.perPage;
export const getDataPageUsingPriceFeed = (state: RootState) =>
    state.explore.pageUsingPriceFeed;
export const getDataPriceFeed = (state: RootState) =>
    state.explore.dataPriceFeed;
export const getDataPriceFeedInDetail = (state: RootState) =>
    state.explore.dataPriceFeedInDetail;
export const getStatusLoadingYouGot = (state: RootState) =>
    state.explore.loadingGetOwned;
export const getDataGetOwned = (state: RootState) =>
    state.explore.dataOwnedNFTs;
export const getDataTokenClaim = (state: RootState) =>
    state?.explore.dataProjectLists;
export const getDataTokenTransactionDetail = (state: RootState) =>
    state?.explore.dataClaimDetail;

export const getLinkingTonAddressData = (state: RootState) =>
    state?.explore.linkingTonAddress;
export const getStatusFirstLoading = (state: RootState) =>
    state?.explore.firstLoading;
export const getStatusLoading = (state: RootState) =>
    state?.explore.loadingDetail;
export const {
    setRefreshing,
    setFirstLoading,
    setPage,
    setPageUsingPriceFeed,
    setTabIndex,
    setDataTransaction,
    setDataTopEVMs,
    setDataTopTokens,
} = exploreSlice.actions;
export const getFirstLoadingList = (state: RootState) =>
    state.explore.firstLoadingList;
export const getDataProjectOnGoing = (state: RootState) =>
    state?.explore.claimProjectOnGoing;
export const getTabContainer = (state: RootState) =>
    state?.explore.tabContainer;

export const getCheckNFTsGottedContainer = (state: RootState) =>
    state.explore.dataCheckNFTsGotted;

const appPersistConfig = {
    key: ReduxKey.explore,
    storage: AsyncStorage,
    blacklist: [
        'dataClaimable',
        'dataClaimHistory',
        'dataCheckNFTsGotted',
        'page',
        'loadingGetOwned',
        'firstLoading',
        'loading',
        'error',
        'dataOwnedNFTs',
        'dataPriceFeed',
        'pageUsingPriceFeed',
        'dataClaimDetail',
        'claimProjectOnGoing',
        'dataProjectLists',
        'firstLoadingList',
        'loadingDetail',
        'tabContainer',
        'top10Tokens',
        'top10EVMs',
    ],
};

const exploreSliceReducer = persistReducer(
    appPersistConfig,
    exploreSlice.reducer,
);

export default exploreSliceReducer;
