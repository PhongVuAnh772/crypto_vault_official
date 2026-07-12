import React from 'react';
import {
    Image,
    Text,
    TouchableOpacity,
    View,
    FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import NFTCollectionDetailStyle from './NFTCollectionDetail.style';

import { 
    ArrowLeftSvgIcon as BackIcon, 
    MenuDotSvgIcon as MoreIcon, 
    VerifiedSvgIcon as VerifiedIcon, 
    PlusSvgIcon as PlusIcon 
} from 'src/core/constants/AppIconsSvg';

const NFTCollectionDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { collection } = route.params || {};

    const items = [
        { id: '1', name: 'NFT #1', price: 1.5, image: collection?.image, isOwner: false },
        { id: '2', name: 'My NFT', price: 2.8, image: collection?.image, isOwner: true },
        { id: '3', name: 'Rare NFT', price: 10.5, image: collection?.image, isOwner: false },
        { id: '4', name: 'NFT #4', price: 2.3, image: collection?.image, isOwner: false },
    ];

    const renderNFTItem = ({ item }: any) => (
        <TouchableOpacity 
            style={NFTCollectionDetailStyle.nftCard}
            onPress={() => navigation.navigate(HomeStackScreenKey.AIDetailScreen, {
                imageUri: item.image,
                title: item.name,
                price: item.price,
                isOwner: item.isOwner,
                id: item.id
            })}
        >
            <Image source={{ uri: item.image }} style={NFTCollectionDetailStyle.nftImage} />
            <TouchableOpacity style={NFTCollectionDetailStyle.addBtn}>
                <PlusIcon width={16} height={16} fill="#fff" />
            </TouchableOpacity>
            <View style={NFTCollectionDetailStyle.nftFooter}>
                <BlurView intensity={60} style={NFTCollectionDetailStyle.nftBlur} tint="dark">
                    <View>
                        <Text style={NFTCollectionDetailStyle.nftLabel}>Price</Text>
                        <Text style={NFTCollectionDetailStyle.nftValue}>{item.price} TON</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={NFTCollectionDetailStyle.nftLabel}>Token</Text>
                        <Text style={NFTCollectionDetailStyle.nftValue}>#{item.id}</Text>
                    </View>
                </BlurView>
            </View>
        </TouchableOpacity>
    );

    const renderHeaderContent = () => (
        <>
            <View style={NFTCollectionDetailStyle.headerImages}>
                <View style={NFTCollectionDetailStyle.headerGrid}>
                    <Image source={{ uri: collection?.image }} style={NFTCollectionDetailStyle.gridImage} />
                    <Image source={{ uri: collection?.image }} style={NFTCollectionDetailStyle.gridImage} />
                </View>
                <View style={NFTCollectionDetailStyle.overlay} />
                
                <TouchableOpacity 
                    style={NFTCollectionDetailStyle.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <BackIcon width={24} height={24} fill="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity style={NFTCollectionDetailStyle.moreBtn}>
                    <MoreIcon width={24} height={24} fill="#fff" />
                </TouchableOpacity>
            </View>

            <View style={NFTCollectionDetailStyle.contentCard}>
                <View style={NFTCollectionDetailStyle.logoContainer}>
                    <Image source={{ uri: collection?.image }} style={NFTCollectionDetailStyle.logo} />
                </View>

                <View style={NFTCollectionDetailStyle.titleSection}>
                    <View style={NFTCollectionDetailStyle.nameRow}>
                        <Text style={NFTCollectionDetailStyle.name}>{collection?.name}</Text>
                        <VerifiedIcon width={20} height={20} fill="#7D40FF" />
                    </View>
                    <Text style={NFTCollectionDetailStyle.desc} numberOfLines={2}>
                        {collection?.description || 'Unique addresses in Telegram’s ecosystem of more than 700 million active users.'}
                    </Text>
                </View>

                <View style={NFTCollectionDetailStyle.statsRow}>
                    <View style={NFTCollectionDetailStyle.statCard}>
                        <Text style={NFTCollectionDetailStyle.statLabel}>Floor Price</Text>
                        <Text style={NFTCollectionDetailStyle.statValue}>{collection?.floorPrice} {collection?.network}</Text>
                    </View>
                    <View style={NFTCollectionDetailStyle.statCard}>
                        <Text style={NFTCollectionDetailStyle.statLabel}>Items</Text>
                        <Text style={NFTCollectionDetailStyle.statValue}>10.5K</Text>
                    </View>
                    <View style={NFTCollectionDetailStyle.statCard}>
                        <Text style={NFTCollectionDetailStyle.statLabel}>Owners</Text>
                        <Text style={NFTCollectionDetailStyle.statValue}>4.2K</Text>
                    </View>
                </View>
            </View>
        </>
    );

    return (
        <View style={NFTCollectionDetailStyle.container}>
            <FlatList
                data={items}
                renderItem={renderNFTItem}
                keyExtractor={item => item.id}
                ListHeaderComponent={renderHeaderContent}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20, backgroundColor: '#121212' }}
                contentContainerStyle={NFTCollectionDetailStyle.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default NFTCollectionDetailScreen;
