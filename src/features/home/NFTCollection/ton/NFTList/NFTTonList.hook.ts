import { StackActions } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { LoadingImage } from 'src/components/common/AppImage/type';
import { useAppSelector } from 'src/core/redux/hooks';
import GlobalUtils from 'src/core/utils/globalUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { getTonCollectionById } from '../../../../../core/redux/slice/NFT/NFTImport.slice';
import { NFTCollection, NFTTonData } from '../NFTImport/NFTTonImport.type';

const useNFTList = (
    { navigation }: RootNavigationType,
    collectionData: NFTCollection,
) => {
    const collection = useAppSelector(getTonCollectionById);
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const getCurrentCollection = () => {
        return collection?.find(
            item =>
                item.contractAddress === collectionData.contractAddress &&
                item.network === collectionData.network,
        );
    };

    const handlePressNFT = (item: NFTTonData) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.NFTTonDetail, item),
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
        newUI,
    };
};

export default useNFTList;
