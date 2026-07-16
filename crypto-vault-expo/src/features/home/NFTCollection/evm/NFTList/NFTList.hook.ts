import { StackActions } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { LoadingImage } from 'src/components/common/AppImage/type';
import { useAppSelector } from 'src/core/redux/hooks';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { getCollectionById } from '../../../../../core/redux/slice/NFT/NFTImport.slice';
import {
    NFTCollection,
    NFTData,
} from '../../../../../core/redux/slice/NFT/NFTImport.type';

const useNFTList = (
    {navigation}: RootNavigationType,
    collectionData: NFTCollection,
) => {
    const collection = useAppSelector(getCollectionById);

    const getCurrentCollection = () => {
        return collection?.find(
            item =>
                item.contractAddress === collectionData.contractAddress &&
                item.network === collectionData.network,
        );
    };

    const handlePressNFT = (item: NFTData) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.NFTDetail, item),
        );
    };

    const [isLoadings, setIsLoadings] = useState<LoadingImage>({});

    const setLoadings = (uri: string, value: boolean) => {
        const imageLoading = isLoadings[uri];
        if (!imageLoading || imageLoading.loading) {
            setIsLoadings(prev => {
                return {
                    ...prev,
                    [uri]: {
                        uri: uri,
                        loading: value,
                    },
                };
            });
        }
    };

    const [refreshing, setRefreshing] = useState<boolean>(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setRefreshing(false);
    }, []);

    return {
        setLoadings,
        isLoadings,
        handlePressNFT,
        onRefresh,
        refreshing,
        collection: getCurrentCollection(),
    };
};

export default useNFTList;
