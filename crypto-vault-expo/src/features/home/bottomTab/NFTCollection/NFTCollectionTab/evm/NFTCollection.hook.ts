import { StackActions } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { LoadingImage } from 'src/components/common/AppImage/type';
import ThemeKey from 'src/core/enum/ThemeKey';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppSelector } from 'src/core/redux/hooks';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';
import { getThemeMode } from 'src/core/redux/slice/app.slice';
import { getCollectionById } from 'src/core/redux/slice/NFT/NFTImport.slice';
import {
    NFTCollection,
    NFTData,
    NFTTonData,
} from 'src/core/redux/slice/NFT/NFTImport.type';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const useNFTCollection = ({ navigation }: RootNavigationType) => {
    const lightMode = useAppSelector(getThemeMode) !== ThemeKey.light;
    const theme = useAppTheme();
    const [isLoadings, setIsLoadings] = useState<LoadingImage>({});
    const currentProtocol = useProtocolSelected();
    const collection = useAppSelector(getCollectionById);

    const handlePressNFT = (item: NFTData) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.NFTDetail, item),
        );
    };
    const handlePressTonNFT = (item: NFTTonData) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.NFTDetail, item),
        );
    };
    const handlePressViewAll = (data: NFTCollection) => {
        navigation.dispatch(
            StackActions.push(HomeStackScreenKey.NFTList, data),
        );
    };
    const handleOnPressImport = () =>
        navigation.dispatch(StackActions.push(HomeStackScreenKey.NFTImport));

    const [refreshing, setRefreshing] = useState<boolean>(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        setRefreshing(false);
    }, []);

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
    return {
        handlePressNFT,
        handlePressViewAll,
        handleOnPressImport,
        collection,
        onRefresh,
        refreshing,
        setLoadings,
        isLoadings,
        lightMode,
        theme,
        currentProtocol,
        handlePressTonNFT,
    };
};
export default useNFTCollection;
