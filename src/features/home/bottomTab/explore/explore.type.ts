import { TFunction } from 'i18next';
import { AppThemeType } from 'src/core/type/ThemeType';
import { TransactionHistoryDataType } from 'src/core/type/TransactionHistoryDataType';
import { DataGottedNFT } from '../../projectDetails/confirm/confirmClaimToken.type';
import { TopEVMsItem } from '../../Top10/EVMs/evm.type';
import { TopTokenItem } from '../../Top10/Tokens/tokens.type';

export interface TopNMVs {
    _id: string;
    name: string;
    symbol: string;
    contractAddress: string;
    decimal: number;
    protocol: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    rank: number;
    logo: string;
}

export interface ClaimTokenParams {
    claimableTokenProjectId: string;
    polygonWalletAddress: string | undefined;
    t: TFunction<'translation', undefined>;
}

export interface LoadingListViewType {
    isLoading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
}

export interface GetPriceFeedParams {
    page?: number;
    perPage?: number;
    claimableTokenProject?: string;
    nftId?: string;
    contractAddress?: string;
    orderBy?: string;
    order?: string;
}

export interface ClaimTokenPostingParams {
    protocolId: string;
    polygonWalletAddress: string | undefined;
    tonWalletAddress: string;
    projectClaimableTokenId: string;
    nftId: string;
}

export interface ClaimTokenHistoryParams {
    walletAddress: string | undefined;
    claimableTokenProject: string;
}

interface Project {
    endDate: string;
    projectBanner: string;
    projectName: string;
    startDate: string;
    _id: string;
    jettonMasterAddress: string;
    tokenPriceChart?: string;
}

export interface ClaimableNFTProps {}

interface NFTProtcolType {
    logo?: string;
    name?: string;
    slip0044: number;
}

interface ProjectNFTType {
    name?: string;
    amount: number;
    contractAddress: string;
}
type ProjectTokenType = {
    symbol?: string;
    name: string;
    contractAddress: string;
    priceChartScanURL?: string;
};
export interface ClaimableType {
    claimableNFTs?: ClaimableNFTProps[];
    nftCollectionName?: string;
    project?: Project;
    projectNftProtocol?: NFTProtcolType;
    projectNFT: ProjectNFTType;
    projectToken: ProjectTokenType;
    projectNFTs: ProjectNFTType[];
    projectTokenProtocol: {
        _id: string;
        name: string;
        symbol: string;
        blockExplorerUrl: string;
        logo: string;
        transactionScanURL?: string;
    };
}

export interface ProjectListItem {
    _id: string;
    projectName: string;
    projectBanner: string;
    projectDescription: string;
    projectTokenProtocol: string;
    projectTokenContractAddress: string;
    requiredNFTProtocol: RequiredNFTProtocol;
    requiredNFTContractAddress: string;
    startDate: string;
    endDate: string;
    paymentWalletAddress: string;
    jettonMasterAddress: string;
    message: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    projectNFTPreview: string[];
    projectProtocolSymbol: string;
    projectProtocolLogo: string;
}

interface RequiredNFTProtocol {
    _id: string;
    name: string;
    rpcUrl: string;
    status: string;
    chainId: number;
    symbol: string;
    blockExplorerUrl: string;
    VM: string;
    tokenTransferFee: number;
    coinTransferFee: number;
    nftTransferFee: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
    logo: string;
    commissionContractAddress: string;
}

export interface ProjectList {
    items: ProjectListItem[];
    countOngoingProject: number;
    project: Project;
    projectNFT: ProjectNFT;
    projectNftProtocol: ProjectNftProtocol;
    projectProtocolCode: number;
    projectToken: null;
    projectTokenProtocol: ProjectTokenProtocol;
}

interface ProjectTokenProtocol {
    _id: string;
    blockExplorerUrl: string;
    logo: string;
    name: string;
    symbol: string;
}

interface ProjectNftProtocol {
    _id: string;
    blockExplorerUrl: string;
    logo: string;
    name: string;
    slip0044: number;
    symbol: string;
}

interface ProjectNFT {
    _id: string;
    contractAddress: string;
    name: string;
    symbol: string;
}

interface Project {
    __v: number;
    _id: string;
    createdAt: string;
    endDate: string;
    jettonMasterAddress: string;
    message: string;
    paymentWallet: string;
    projectBanner: string;
    projectDescription: string;
    projectName: string;
    projectTokenContractAddress: string;
    projectTokenProtocol: string;
    requiredNFTContractAddress: string;
    requiredNFTProtocol: string;
    startDate: string;
    updatedAt: string;
}

export interface OwnedNFTType {
    _id: string;
    amount: number;
    contractAddress: string;
    image: string;
    nftId: string;
    nfts: [];
    rereceiverWalletAddress: string;
    totalAmount: number;
}

interface Project {
    name: string;
    protocolName: string;
}

export interface ClaimHistory {
    _id: string;
    claimGroupId: string;
    nftWalletAddress: string;
    tokenReceiverWalletAddress: string;
    nftId: string;
    amount: number;
    nftContractAddress: string;
    claimableTokenProject: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export type LinkingTonAddressParams = {
    claimableTokenProjectId: string;
    nftWalletAddress: string;
    tokenReceiverWalletAddress: string;
    messageDecoded: string;
    signatureHash: string;
};

export interface NFTHistoryType {
    amount: number;
    nftId: number;
}
export interface HistoryClaimable {
    __v: number;
    _id: string;
    amount: number;
    claimableTokenProject: string;
    createdAt: string;
    nftContractAddress: string;
    nftWalletAddress: string;
    nfts: NFTHistoryType[];
    tokenReceiverWalletAddress: string;
    transactionHash: string;
    updatedAt: string;
}

export type TokenInformationType = {
    _id: string;
    name: string;
    symbol: string;
};

interface NFTClaimHistoryType {
    amount: number;
    nftId: string;
}

export type DataClaimHistoryType = {
    __v: number;
    _id: string;
    amount: number;
    claimableTokenProject: string;
    createdAt: string;
    nftContractAddress: string;
    nftWalletAddress: string;
    nfts: NFTClaimHistoryType[];
    tokenReceiverWalletAddress: string;
    transactionHash: string;
    updatedAt: string;
};

interface ProjectTokenProtocolType {
    _id: string;
    name: string;
    symbol: string;
    blockExplorerUrl: string;
    logo: string;
    transactionScanURL: string;
}

interface NFTProtocolDetailType {
    _id: string;
    name: string;
    symbol: string;
    blockExplorerUrl: string;
    logo: string;
    transactionScanURL: string;
}
export interface DataClaimDetailType {
    claimHistory: ClaimHistory[];
    project: Project;
    history: HistoryClaimable;
    token: TokenInformationType[];
    tokenProtocol: ProjectTokenProtocolType;
    nftProtocol: NFTProtocolDetailType;
}

export interface DataPriceFeed {
    _id: string;
    nftId: string;
    amount: number;
}
export interface TopNMVsState {
    dataTopNMVs?: TopNMVs[];
    loading: boolean;
    error?: string;
    refreshing?: boolean;
    dataProjectLists: ProjectListItem[];
    dataClaimable: ClaimableType | null;
    dataOwnedNFTs: OwnedNFTType[];
    dataClaimHistory: TransactionHistoryDataType[];
    firstLoading: boolean;
    page: number;
    perPage: number;
    loadingGetOwned: boolean;
    dataPriceFeed: DataPriceFeed[];
    pageUsingPriceFeed: number;
    dataClaimDetail: DataClaimDetailType | null;
    claimProjectOnGoing: ProjectList | null;
    firstLoadingList: boolean;
    loadingList: boolean;
    dataPriceFeedInDetail: DataPriceFeed[];
    loadingDetail: boolean;
    linkingTonAddress: LinkingTonAddressResponse | null;
    tabContainer: {
        index: number;
        routes: { key: string; title: string }[];
    };
    dataCheckNFTsGotted: DataGottedNFT | null;
    top10EVMs: TopEVMsItem[] | null;
    top10Tokens: TopTokenItem[] | null;
}

export type Top10TokensType = {};
export type NavigatingDetailDataType = {
    _id: string;
    endDate: string;
    projectBanner: string;
    projectName: string;
    projectProtocolLogo: string;
    projectProtocolSymbol: string;
    startDate: string;
};

export interface LinkingTonAddressResponse {
    _id: string;
    nftWalletAddress: string;
    tokenReceiverWalletAddress: string;
}
export interface PriceFeedType {
    _id: string;
    amount: number;
    contractAddress: string;
    image: string;
    nftId: string;
}

export interface PriceFeedTypeContainer {
    items: PriceFeedType[];
}

export interface PriceFeedContainerType {}

export interface TokenClaimsListDataProps {
    page: number;
    perPage: number;
}

export interface NftTransactionType {
    _id: string;
    amount: number;
    nftId: string;
    tokenURI: string;
}

export interface TransactionProjectType {
    transactionHash: string;
    nfts: NftTransactionType[];
}

export interface ClaimDetail {
    image: string;
    counting: number;
    price: number;
    name: string;
}

export interface ProjectItem {
    projectBanner: string;
    projectName: string;
    slider: string[];
    overview: string;
    overviewDate: string;
    claim_details: ClaimDetail[];
    _id: string;
    on_going: boolean;
    startDate: string;
    endDate: string;
    projectProtocolLogo: string;
    projectProtocolSymbol: string;
}

export interface ListItem {
    item: ProjectListItem;
}

export interface EndReachedFooterProps {
    loadMore: boolean;
    theme: AppThemeType;
    newUI: boolean;
}

export interface TransactionDetailParams {
    claimableTokenProjectId: string | undefined;
    polygonWalletAddress: string;
    claimGroupId: string;
}

export type LoadingExploreWrapperProps = {
    firstLoading: boolean;
    theme: AppThemeType;
};

export type GetInformationLinkTonProps = {
    claimableTokenProjectId: string;
    nftWalletAddress: string;
};

export type ClaimTokenThunkProps = {
    polygonWalletAddress?: string;
    projectClaimableTokenId: string;
    nftId: string[];
};

export type Top10EVMsProps = {
    items: TopEVMsItem[];
};

export type Top10TokensProps = {
    items: TopTokenItem[];
};
