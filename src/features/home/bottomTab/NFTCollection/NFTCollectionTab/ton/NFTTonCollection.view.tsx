/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { NFTCollectionTonList } from './NFTTonCollection.components';
import useNFTCollection from './NFTTonCollection.hook';
const NFTTonCollectionScreen: React.FC<RootNavigationType> = ({navigation}) => {
    const {
        handlePressViewAll,
        collection,
        refreshing,
        onRefresh,
        handleOnPressImport,
        setLoadings,
        isLoadings,
        lightMode,
        handlePressTonNFT,
    } = useNFTCollection({
        navigation,
    });

    return (
        <NFTCollectionTonList
            lightMode={lightMode}
            collection={collection}
            refreshing={refreshing}
            onRefresh={onRefresh}
            handleOnPressImport={handleOnPressImport}
            isLoadings={isLoadings}
            handlePressViewAll={handlePressViewAll}
            handlePressNFT={handlePressTonNFT}
            setLoadings={setLoadings}
        />
    );
};

export default NFTTonCollectionScreen;
