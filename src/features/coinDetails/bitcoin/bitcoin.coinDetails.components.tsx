import React from 'react';
import ViewModeButton from 'src/components/common/ViewModeButton/ViewModeButton';
import { ListFooterComponentBitcoinType } from './bitcoin.coinDetails.type';

const ListFooterComponentBitcoin: React.FC<ListFooterComponentBitcoinType> = ({
    showSeeMore,
    viewMoreHistory,
}) => {
    return showSeeMore && <ViewModeButton viewMoreHistory={viewMoreHistory} />;
};

export default ListFooterComponentBitcoin;
