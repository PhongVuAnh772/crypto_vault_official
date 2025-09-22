import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    View,
} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import { NFTCollectionLoadingStat } from 'src/features/home/UnAddedNFTs/NFTCollectionStats/NFTCollectionStats.component';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import Separator from '../components/separator';
import TonNFTItem from '../components/tonNFTItem/tonNFTitem.view';
import useUnAddedNFTTab from './ton.hook';

const TonUnAddedScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        initialLoading,
        refreshing,
        onRefresh,
        enablePagination,
        handlingPagination,
        tonNFTs,
        navigateToNFTUnAddedDetail,
        newUI,
    } = useUnAddedNFTTab({
        navigation,
    });

    return (
        <>
            {tonNFTs && tonNFTs.length > 0 ? (
                <FlatList
                    data={[...tonNFTs]}
                    onEndReached={() => {
                        if (enablePagination) handlingPagination(false);
                    }}
                    onEndReachedThreshold={0.3}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    ListFooterComponent={
                        enablePagination ? (
                            <View style={appStyles.mt15}>
                                <ActivityIndicator
                                    color={appColors.main.tokyoRed}
                                    size="small"
                                />
                            </View>
                        ) : null
                    }
                    contentContainerStyle={[
                        appStyles.pT15,
                        appStyles.pH25,
                        appStyles.pB10,
                    ]}
                    renderItem={({ item }) => {
                        return (
                            <TonNFTItem
                                item={item}
                                onPress={() => navigateToNFTUnAddedDetail(item)}
                                usingInTab={newUI}
                            />
                        );
                    }}
                    ItemSeparatorComponent={Separator}
                />
            ) : (
                <NFTCollectionLoadingStat
                    loading={initialLoading}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            )}
        </>
    );
};

export default TonUnAddedScreen;
