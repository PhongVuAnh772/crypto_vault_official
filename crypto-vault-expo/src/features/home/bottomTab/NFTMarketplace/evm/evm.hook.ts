import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useCurrentWallet, useProtocolSelected } from 'src/core/redux/slice/account.selector';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { fetchEvmCollections } from './evm.service';
import { NFTCollection } from '../NFTMarketplace.type';

const useEvmMarketplace = () => {
    const navigation = useNavigation<any>();
    const currentProtocol = useProtocolSelected();
    const currentWallet = useCurrentWallet();

    const [selectedCategory, setSelectedCategory] = useState('Recent');
    const [collections, setCollections] = useState<NFTCollection[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const categories = ['Recent', 'Trending', 'Top Art', 'Popular', 'Collectibles'];

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const evmCollections = await fetchEvmCollections({
                    walletAddress: currentWallet?.address,
                    protocolSymbol: currentProtocol?.symbol,
                    query: searchText,
                });
                setCollections(evmCollections);
            } catch (error) {
                console.error('Error fetching EVM NFT collections:', error);
                setCollections([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchText, selectedCategory, currentWallet?.address, currentProtocol?.symbol]);

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

export default useEvmMarketplace;
