import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';
import VMType from 'src/core/enum/VMType';
import { BottomTabScreenKey, HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';

export interface NFTCollection {
    id: string;
    name: string;
    image: string;
    floorPrice: string;
    itemCount: number;
    network: string;
    networkIcon?: string;
    isVerified?: boolean;
}

const NFTMarketplaceHook = () => {
    const navigation = useNavigation<any>();
    const currentProtocol = useProtocolSelected();
    const [selectedCategory, setSelectedCategory] = useState('Recent');
    const [collections, setCollections] = useState<NFTCollection[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const categories = ['Recent', 'Trending', 'Top Art', 'Popular', 'Collectibles'];

    const getReservoirChain = (networkId: string) => {
        // Map current protocol to reservoir chain
        // Examples: ethereum, polygon, base, arbitrum, etc.
        if (networkId.toLowerCase().includes('polygon')) return 'polygon';
        if (networkId.toLowerCase().includes('eth')) return 'ethereum';
        return 'polygon'; // Default fallback
    };

    const fetchCollections = useCallback(async (category: string, query?: string) => {
        setLoading(true);
        try {
            // GetGems Top Collections API
            // kind: day, week, month, all
            let kind = 'all';
            if (category === 'Recent') kind = 'day';
            else if (category === 'Trending') kind = 'week';
            else if (category === 'Popular') kind = 'month';
            else if (category === 'Top Art') kind = 'all';
            else if (category === 'Collectibles') kind = 'all';

            const url = `https://api.getgems.io/public-api/v1/collections/top?kind=${kind}&limit=20`;
            
            const response = await fetch(url, {
                headers: {
                    'accept': 'application/json',
                    'Authorization': '1775195839421-mainnet-10926032-r-FKgyDVTiROpQT2dzM5SSXqxXNmMkxqUsFCFtU6xBMCSgVSkr'
                }
            });
            const data = await response.json();

            if (data.success && data.response?.items) {
                let items = data.response.items;
                
                // Local search filtering if searchText is provided
                if (query && query.trim().length > 0) {
                    const lowerQuery = query.toLowerCase();
                    items = items.filter((item: any) => 
                        item.collection.name?.toLowerCase().includes(lowerQuery) || 
                        item.collection.description?.toLowerCase().includes(lowerQuery)
                    );
                }

                const formatted: NFTCollection[] = items.map((item: any) => ({
                    id: item.collection.address,
                    name: item.collection.name || 'Unknown Collection',
                    image: item.collection.image || 'https://via.placeholder.com/300',
                    floorPrice: item.floorPrice?.toString() || '0.00',
                    itemCount: 0,
                    network: 'TON',
                    isVerified: true,
                }));
                setCollections(formatted);
            }
        } catch (error) {
            console.error('Error fetching NFT collections:', error);
            // Mock data for fallback
            setCollections([
                {
                    id: '1',
                    name: 'CloneX',
                    image: 'https://i.seadn.io/gae/BdxvL7vMr_m9C_8Yvs9WfN67rX9FhF5p_U-0-6Vl6-L6-O6-L6-O-O-6Vl6-L6-O6-L6-O?auto=format&w=1000',
                    floorPrice: '6.968',
                    itemCount: 20,
                    network: 'ETH',
                    isVerified: true
                }
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCollections(selectedCategory, searchText);
        }, 500); // 500ms debounce for search

        return () => clearTimeout(timeoutId);
    }, [selectedCategory, searchText, fetchCollections]);

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
    };

    const handleNavigateToMyCollection = () => {
        navigation.navigate(HomeStackScreenKey.NFTCollection); 
    };

    const handleNavigateToCollectionDetail = (item: NFTCollection) => {
        navigation.navigate(HomeStackScreenKey.NFTMarketplaceCollectionDetail, {
            collection: item
        });
    };

    return {
        categories,
        selectedCategory,
        collections,
        loading,
        searchText,
        setSearchText,
        handleCategorySelect,
        handleNavigateToMyCollection,
        handleNavigateToCollectionDetail,
        currentProtocol
    };
};

export default NFTMarketplaceHook;
