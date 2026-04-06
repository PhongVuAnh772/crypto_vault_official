import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    getCurrentTabIndex,
    setTabCollectionIndex,
} from 'src/core/redux/slice/NFT/NFTImport.slice';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import VMType from 'src/core/enum/VMType';
import { useProtocolSelected } from 'src/core/redux/slice/account.selector';

const useNFTCollectionTab = ({ navigation }: RootNavigationType) => {
    const currentTabIndex = useAppSelector(getCurrentTabIndex) ?? 0;
    const currentProtocol = useProtocolSelected();
    const { t } = useTranslation();
    const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

    const dispatch = useAppDispatch();

    useEffect(() => {
        const checkOnboarding = async () => {
            const hasShown = await AsyncStorage.getItem('NFT_ONBOARDING_SHOWN');
            if (!hasShown) {
                setShowOnboarding(true);
            }
        };
        checkOnboarding();
    }, []);

    const handleFinishOnboarding = async () => {
        await AsyncStorage.setItem('NFT_ONBOARDING_SHOWN', 'true');
        setShowOnboarding(false);
    };

    const routes = {
        0: t(LanguageKey.top_tab_my_nft_collection),
        1: t(LanguageKey.un_added_nfts_nfts_you_own),
    };

    const handleIndexChange = (newIndex: number) => {
        if (newIndex !== 0 && newIndex !== 1) return;
        navigation.navigate(routes[newIndex]);
        dispatch(setTabCollectionIndex(newIndex));
    };

    const handleTabChange = (newIndex: number) => {
        dispatch(setTabCollectionIndex(newIndex));
    };
    useEffect(() => {
        handleIndexChange(currentTabIndex);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTabIndex]);

    const handleNavigateToMint = () => {
        navigation.navigate(HomeStackScreenKey.MintNftScreen);
    };

    const handleNavigateToImport = () => {
        if (currentProtocol?.VM === VMType.Ton) {
            navigation.navigate(HomeStackScreenKey.NFTTonImport);
        } else {
            navigation.navigate(HomeStackScreenKey.NFTImport);
        }
    };

    return {
        t,
        handleTabChange,
        showOnboarding,
        handleFinishOnboarding,
        handleNavigateToMint,
        handleNavigateToImport
    };
};
export default useNFTCollectionTab;
