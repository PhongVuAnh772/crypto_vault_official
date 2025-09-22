import { RouteProp, useRoute } from '@react-navigation/native';
import { t } from 'i18next';
import React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import NFTTonItem from 'src/components/homeComponents/NFTTonItem';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { NFTTonData } from '../NFTImport/NFTTonImport.type';
import useNFTList from './NFTTonList.hook';
import NFTListStyle from './NFTTonList.style';

type NFTListParams = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.NFTList
>;

const NFTTonList: React.FC<RootNavigationType> = ({ navigation }) => {
    const params = useRoute<NFTListParams>().params;
    const {
        handlePressNFT,
        isLoadings,
        setLoadings,
        onRefresh,
        refreshing,
        collection,
        newUI,
    } = useNFTList({ navigation }, params);

    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            headerTitle={params.name || t(LanguageKey.nft_unnamed_collection)}
            headerTextVariant={TextVariantKeys.titleLarge}
            backgroundColor={
                newUI ? appColors.main.tokyoRed : appColors.neutral.n100
            }
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            headerTextColor={newUI ? appColors.neutral.white : undefined}>
            <View style={NFTListStyle.container}>
                {collection && (
                    <FlatList
                        data={collection.data}
                        keyExtractor={item => item.root?.contractAddress}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                        numColumns={2}
                        renderItem={({ item, index }) => (
                            <NFTTonItem
                                index={index}
                                item={item.detail}
                                onPress={() =>
                                    handlePressNFT(item as NFTTonData)
                                }
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
export default NFTTonList;
