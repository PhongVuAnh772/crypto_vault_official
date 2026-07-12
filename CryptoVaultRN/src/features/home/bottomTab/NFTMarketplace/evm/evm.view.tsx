import React from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ScreenWrapper } from 'src/components';
import CollectionIcon from 'src/assets/icons/collect.svg';
import EthIcon from 'src/assets/icons/ethereum.svg';
import PolygonIcon from 'src/assets/icons/polygon.svg';
import ActivityIcon from 'src/assets/icons/pulse.svg';
import SearchIcon from 'src/assets/icons/search.svg';
import VerifiedIcon from 'src/assets/icons/verified.svg';
import { TonSvgIcon as TonIcon } from 'src/core/constants/AppIconsSvg';
import NFTMarketplaceStyle from '../NFTMarketplace.style';
import { NFTCollection } from '../NFTMarketplace.type';
import useEvmMarketplace from './evm.hook';

const EvmMarketplaceScreen = () => {
    const {
        categories,
        selectedCategory,
        collections,
        loading,
        searchText,
        setSearchText,
        handleCategorySelect,
        handleNavigateToMyCollection,
        handleNavigateToCollectionDetail,
    } = useEvmMarketplace();

    const renderCollectionItem = ({ item }: { item: NFTCollection }) => (
        <TouchableOpacity
            style={NFTMarketplaceStyle.card}
            onPress={() => handleNavigateToCollectionDetail(item)}
            activeOpacity={0.9}
        >
            <Image source={{ uri: item.image }} style={NFTMarketplaceStyle.cardImage} />
            <View style={NFTMarketplaceStyle.cardOverlay} />

            <View style={NFTMarketplaceStyle.cardContent}>
                <View style={NFTMarketplaceStyle.collectionInfo}>
                    <Text style={NFTMarketplaceStyle.collectionName}>{item.name}</Text>
                    {item.isVerified && <VerifiedIcon width={16} height={16} fill="#7D40FF" />}
                </View>
                <Text style={NFTMarketplaceStyle.floorPrice}>Floor price {item.floorPrice} {item.network}</Text>
            </View>

            <View style={NFTMarketplaceStyle.badgeContainer}>
                <View style={NFTMarketplaceStyle.itemCountBadge}>
                    <Text style={NFTMarketplaceStyle.itemCountText}>{item.itemCount}</Text>
                </View>
                <View style={NFTMarketplaceStyle.networkBadge}>
                    {item.network === 'ETH' && <EthIcon width={24} height={24} />}
                    {item.network === 'MATIC' && <PolygonIcon width={24} height={24} />}
                    {item.network === 'TON' && <TonIcon width={24} height={24} />}
                </View>
            </View>

            <View style={NFTMarketplaceStyle.cardActions}>
                <TouchableOpacity style={[NFTMarketplaceStyle.actionButton, NFTMarketplaceStyle.activityButton]}>
                    <ActivityIcon width={20} height={20} fill="#fff" />
                    <Text style={[NFTMarketplaceStyle.actionButtonText, NFTMarketplaceStyle.activityButtonText]}>Activity</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[NFTMarketplaceStyle.actionButton, NFTMarketplaceStyle.collectionButton]}
                    onPress={() => handleNavigateToCollectionDetail(item)}
                >
                    <CollectionIcon width={20} height={20} fill="#7D40FF" />
                    <Text style={[NFTMarketplaceStyle.actionButtonText, NFTMarketplaceStyle.collectionButtonText]}>Collection</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper subStyle={NFTMarketplaceStyle.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={NFTMarketplaceStyle.header}>
                        <View style={{ width: 40 }} />
                        <Text style={NFTMarketplaceStyle.headerTitle}>NFT Marketplace</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <TouchableOpacity
                        style={NFTMarketplaceStyle.myCollectionEntry}
                        onPress={handleNavigateToMyCollection}
                    >
                        <View style={NFTMarketplaceStyle.myCollectionIcon}>
                            <CollectionIcon width={24} height={24} fill="#fff" />
                        </View>
                        <View>
                            <Text style={NFTMarketplaceStyle.myCollectionTitle}>My Collections</Text>
                            <Text style={NFTMarketplaceStyle.myCollectionSub}>Manage your NFTs and un-added items</Text>
                        </View>
                        <View style={{ flex: 1 }} />
                        <Text style={{ color: '#7D40FF', fontWeight: 'bold' }}>View</Text>
                    </TouchableOpacity>

                    <View style={NFTMarketplaceStyle.searchContainer}>
                        <View style={NFTMarketplaceStyle.searchBar}>
                            <SearchIcon width={20} height={20} fill="#666" />
                            <TextInput
                                style={NFTMarketplaceStyle.searchInput}
                                placeholder="Search nft or artist name..."
                                placeholderTextColor="#666"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>
                    </View>

                    <View style={NFTMarketplaceStyle.categoriesContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        NFTMarketplaceStyle.categoryItem,
                                        selectedCategory === category && NFTMarketplaceStyle.categoryItemActive,
                                    ]}
                                    onPress={() => handleCategorySelect(category)}
                                >
                                    <Text
                                        style={[
                                            NFTMarketplaceStyle.categoryText,
                                            selectedCategory === category && NFTMarketplaceStyle.categoryTextActive,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={NFTMarketplaceStyle.sectionHeader}>
                        <Text style={NFTMarketplaceStyle.sectionTitle}>Recent Collection</Text>
                        <TouchableOpacity>
                            <Text style={NFTMarketplaceStyle.viewAll}>View all</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#7D40FF" style={{ marginTop: 50, marginBottom: 30 }} />
                    ) : (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            decelerationRate="fast"
                            contentContainerStyle={NFTMarketplaceStyle.collectionList}
                        >
                            {collections.map((item) => (
                                <View key={item.id}>{renderCollectionItem({ item })}</View>
                            ))}
                        </ScrollView>
                    )}
                </ScrollView>
            </SafeAreaView>
        </ScreenWrapper>
    );
};

export default EvmMarketplaceScreen;
