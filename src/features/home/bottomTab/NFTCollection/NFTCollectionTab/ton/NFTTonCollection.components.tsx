import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import AppImage from 'src/components/common/AppImage';
import AppText from 'src/components/common/AppText';
import NFTTonItem from 'src/components/homeComponents/NFTTonItem';
import ScreenWrapper from 'src/components/layout/ScreenWrapper';
import { ArrowRightSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import nftUtils from 'src/core/utils/nftUtils';
import {
    ListNFTEmpty,
    LoadingWrapper,
} from '../components/NFTCollection.components';
import NFTCollectionStyle from './NFTTonCollection.style';
import { NFTCollectionTonListProps } from './NFTTonCollection.type';

const SeparatorCollection = () => {
    return <View style={NFTCollectionStyle.separator} />;
};

const NFTCollectionTonList: React.FC<NFTCollectionTonListProps> = ({
    lightMode,
    collection,
    refreshing,
    onRefresh,
    handleOnPressImport,
    isLoadings,
    handlePressViewAll,
    handlePressNFT,
    setLoadings,
}) => {
    const theme = useAppTheme();
    const { t } = useTranslation();
    return (
        <ScreenWrapper
            // backgroundImage={
            //     lightMode ? appImages.background1Dark : appImages.background1
            // }
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
                                <View
                                    style={NFTCollectionStyle.collectionHeader}>
                                    <View style={NFTCollectionStyle.headerLeft}>
                                        <View style={NFTCollectionStyle.avatarFrame}>
                                            <AppImage
                                                uri={imageUri}
                                                height={40}
                                                width={40}
                                                setIsLoading={setLoadings}
                                                isLoading={
                                                    isLoadings[imageUri]?.loading
                                                }
                                                defaultImage={appImages.NFTDefault}
                                            />
                                        </View>
                                    <LoadingWrapper
                                        loading={bothLoading}
                                        skeletonWidth={100}
                                        containerSkeleton={[
                                            NFTCollectionStyle.flex1,
                                            NFTCollectionStyle.collectionTitleWrap,
                                        ]}>
                                        <View
                                            style={NFTCollectionStyle.collectionTitleWrap}>
                                            <AppText
                                                title={
                                                    item?.name ||
                                                    t(
                                                        LanguageKey.nft_unnamed_collection,
                                                    )
                                                }
                                                variant={
                                                    TextVariantKeys.bodyMMedium
                                                }
                                                textColor={
                                                    theme.colors
                                                        .text_on_surface_text_high
                                                }
                                            >
                                                <AppText
                                                    title={` (${item?.data?.length?.toString() || ''})`}
                                                    variant={TextVariantKeys.bodyMMedium}
                                                    textColor={
                                                        theme.colors
                                                            .text_on_surface_text_high
                                                    }
                                                />
                                            </AppText>
                                        </View>
                                    </LoadingWrapper>
                                    </View>
                                    {item?.data && item?.data.length > 2 && (
                                        <LoadingWrapper
                                            loading={bothLoading}
                                            skeletonWidth={100}>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handlePressViewAll(item)
                                                }
                                                style={NFTCollectionStyle.viewAllButton}>
                                                <AppText
                                                    titleWithI18n={
                                                        LanguageKey.common_view_all
                                                    }
                                                    variant={
                                                        TextVariantKeys.bodyMSmall
                                                    }
                                                    textColor={
                                                        theme.colors
                                                            .text_on_surface_text_light
                                                    }
                                                    styles={NFTCollectionStyle.viewAllText}
                                                />
                                                <ArrowRightSvgIcon
                                                    color={
                                                         theme.colors
                                                                  .text_on_surface_text_light
                                                    }
                                                />
                                            </TouchableOpacity>
                                        </LoadingWrapper>
                                    )}
                                </View>
                                <FlatList
                                    data={nftList}
                                    keyExtractor={itemNFF =>
                                        itemNFF?.root?.contractAddress
                                    }
                                    bounces={false}
                                    numColumns={2}
                                    contentContainerStyle={NFTCollectionStyle.cardInnerList}
                                    renderItem={data => {
                                        return (
                                            <NFTTonItem
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
export { NFTCollectionTonList, SeparatorCollection };
