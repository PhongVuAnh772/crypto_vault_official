/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import NFTItem from 'src/components/homeComponents/NFTItem';
import nftUtils from 'src/core/utils/nftUtils';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    HeaderCollectionRendering,
    ListNFTEmpty,
    SeparatorCollection,
} from '../components/NFTCollection.components';
import useNFTCollection from './NFTCollection.hook';
import NFTCollectionStyle from './NFTCollection.style';

const NFTCollectionScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        handlePressNFT,
        handlePressViewAll,
        collection,
        refreshing,
        onRefresh,
        handleOnPressImport,
        setLoadings,
        isLoadings,
        theme,
    } = useNFTCollection({
        navigation,
    });
    return (
        <ScreenWrapper
            backgroundColor="#07051A"
            subStyle={[NFTCollectionStyle.flex1]}>
            <View style={NFTCollectionStyle.screenContent}>
                <FlatList
                    data={collection}
                    keyExtractor={item => item?.network + item?.contractAddress}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.text_on_surface_text_high}
                            colors={[theme.colors.text_on_surface_text_high]}
                        />
                    }
                    ListEmptyComponent={
                        <ListNFTEmpty onPress={handleOnPressImport} />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        NFTCollectionStyle.listContentContainer,
                    ]}
                    ItemSeparatorComponent={SeparatorCollection}
                    renderItem={({ item }) => {
                        const getFirstItem = item?.data?.slice(-1)[0];
                        const imageFirst =
                            getFirstItem?.detail?.image ||
                            getFirstItem?.detail?.image_data ||
                            '';
                        const nftList = item?.data?.slice(0, 2);
                        const lengthCollection = item?.data?.length;
                        const isHideViewAll = lengthCollection >= 2;
                        const imageUri = nftUtils.convertIpfsUrl(
                            imageFirst ?? '',
                        );

                        let bothLoading = true;
                        nftList.forEach(nft => {
                            const nftLoading =
                                isLoadings[nft.detail.image ?? ''];
                            if (!nftLoading?.loading) {
                                bothLoading = false;
                            }
                        });

                        return (
                            <View style={NFTCollectionStyle.collectionCard}>
                                <HeaderCollectionRendering
                                    imageUri={imageUri}
                                    setLoadingImage={setLoadings}
                                    isLoading={isLoadings[imageUri]?.loading}
                                    loading={bothLoading}
                                    title={item?.name}
                                    isHideViewAll={isHideViewAll}
                                    handlePressViewAll={() =>
                                        handlePressViewAll(item)
                                    }
                                    length={lengthCollection}
                                />
                                <FlatList
                                    data={nftList}
                                    keyExtractor={itemNFF =>
                                        itemNFF?.detail?.nftId +
                                        itemNFF?.root?.contractAddress
                                    }
                                    bounces={false}
                                    numColumns={2}
                                    contentContainerStyle={NFTCollectionStyle.cardInnerList}
                                    renderItem={data => {
                                        return (
                                            <NFTItem
                                                onPress={() =>
                                                    handlePressNFT(data?.item)
                                                }
                                                item={data?.item?.detail}
                                                index={data?.index}
                                                isLoading={
                                                    isLoadings[
                                                        data.item.detail
                                                            .image ?? ''
                                                    ]?.loading
                                                }
                                                setIsLoading={setLoadings}
                                            />
                                        );
                                    }}
                                />
                            </View>
                        );
                    }}
                />
            </View>
        </ScreenWrapper>
    );
};

export default NFTCollectionScreen;
