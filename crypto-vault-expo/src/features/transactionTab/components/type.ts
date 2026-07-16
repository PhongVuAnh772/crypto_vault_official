export type LoadingTransactionViewType = {
    isTransactionHistoryLoading: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    viewMoreHistory: () => void;
};

export type SeeMoreTransactionViewProps = {
    handleViewMore: () => void;
};
