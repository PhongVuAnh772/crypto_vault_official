import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { fetchTonCollections } from './ton.service';
import { NFTCollection } from '../NFTMarketplace.type';

const useTonMarketplace = () => {
    const navigation = useNavigation<any>();

    const [selectedCategory, setSelectedCategory] = useState('Recent');
    const [collections, setCollections] = useState<NFTCollection[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const categories = ['Recent', 'Trending', 'Top Art', 'Popular', 'Collectibles'];

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const tonCollections = await fetchTonCollections(selectedCategory, searchText);
                setCollections(tonCollections);
            } catch (error) {
                console.error('Error fetching TON NFT collections:', error);
                setCollections([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchText, selectedCategory]);

    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);
    };

    const handleNavigateToMyCollection = () => {
        navigation.navigate(HomeStackScreenKey.NFTCollection);
    };

    const handleNavigateToCollectionDetail = (item: NFTCollection) => {
        navigation.navigate(HomeStackScreenKey.NFTMarketplaceCollectionDetail, {
            collection: item,
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
    };
};

export default useTonMarketplace;
