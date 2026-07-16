import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import NFTItem from 'src/components/homeComponents/NFTItem';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useNFTList from './NFTList.hook';
import NFTListStyle from './NFTList.style';

type NFTListParams = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.NFTList
>;

const NFTList: React.FC<RootNavigationType> = ({navigation}) => {
    const params = useRoute<NFTListParams>().params;
    const {
        handlePressNFT,
        isLoadings,
        setLoadings,
        onRefresh,
        refreshing,
        collection,
    } = useNFTList({navigation}, params);

    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            headerTitle={params.name}
            headerTextVariant={TextVariantKeys.titleLarge}
            backgroundColor={appColors.neutral.n100}>
            <View
                style={[
                    NFTListStyle.pH25,
                    NFTListStyle.mt15,
                    NFTListStyle.flex1,
                ]}>
                {collection && (
                    <FlatList
                        data={collection.data}
                        keyExtractor={item =>
                            item.detail?.nftId + item.root?.contractAddress
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                        numColumns={2}
                        renderItem={({item, index}) => (
                            <NFTItem
                                index={index}
                                item={item.detail}
                                onPress={() => handlePressNFT(item)}
                                isLoading={
                                    isLoadings[item.detail.image ?? '']?.loading
                                }
                                setIsLoading={setLoadings}
                            />
                        )}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};
export default NFTList;
