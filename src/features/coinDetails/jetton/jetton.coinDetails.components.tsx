import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import ViewModeButton from 'src/components/common/ViewModeButton/ViewModeButton';
import appStyles from 'src/core/styles';

export const ItemSeparatorComponent = () => {
    return <View style={appStyles.mv5} />;
};

type ListFooterComponentType = {
    loadMore: boolean;
    viewMoreHistory: () => void;
};

export const ListFooterComponent: React.FC<ListFooterComponentType> = ({
    loadMore,
    viewMoreHistory,
}) => {
    const getView = () => {
        if (loadMore) {
            return <ActivityIndicator size="small" style={appStyles.pV10} />;
        }
        return <ViewModeButton viewMoreHistory={viewMoreHistory} />;
    };
    return getView();
};
