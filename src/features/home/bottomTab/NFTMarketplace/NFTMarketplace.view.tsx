import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ScreenWrapper } from 'src/components';
import NFTMarketplaceHook, { NFTCollection } from './NFTMarketplace.hook';
import NFTMarketplaceStyle from './NFTMarketplace.style';

// Icons (assuming standard SVG import setup)
import CollectionIcon from 'src/assets/icons/collect.svg';
import EthIcon from 'src/assets/icons/ethereum.svg';
import PolygonIcon from 'src/assets/icons/polygon.svg';
import ActivityIcon from 'src/assets/icons/pulse.svg'; // Using pulse for activity
import SearchIcon from 'src/assets/icons/search.svg';
import VerifiedIcon from 'src/assets/icons/verified.svg';
import { TonSvgIcon as TonIcon } from 'src/core/constants/AppIconsSvg';

const NFTMarketplaceScreen = () => {
    const {
        categories,
        selectedCategory,
        collections,
        loading,
        searchText,
        setSearchText,
        handleCategorySelect,
        handleNavigateToMyCollection,
        handleNavigateToCollectionDetail
    } = NFTMarketplaceHook();

    const renderHeader = () => (
        <View style={NFTMarketplaceStyle.header}>
            <View style={{ width: 40 }} />
            <Text style={NFTMarketplaceStyle.headerTitle}>NFT Marketplace</Text>
            <View style={{ width: 40 }} />
        </View>
    );

    const renderSearchBar = () => (
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
    );

    const renderCategories = () => (
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
    );

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

    const renderListHeader = () => (
        <>
            {renderHeader()}

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

            {renderSearchBar()}
            {renderCategories()}

            <View style={NFTMarketplaceStyle.sectionHeader}>
                <Text style={NFTMarketplaceStyle.sectionTitle}>Recent Collection</Text>
                <TouchableOpacity>
                    <Text style={NFTMarketplaceStyle.viewAll}>View all</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <ScreenWrapper subStyle={NFTMarketplaceStyle.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={loading ? [] : collections}
                    renderItem={renderCollectionItem}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={
                        <>
                            {renderListHeader()}
                            {loading && (
                                <ActivityIndicator
                                    size="large"
                                    color="#7D40FF"
                                    style={{ marginTop: 50 }}
                                />
                            )}
                        </>
                    }
                    contentContainerStyle={NFTMarketplaceStyle.collectionList}
                    showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>
        </ScreenWrapper>
    );
};

export default NFTMarketplaceScreen;
