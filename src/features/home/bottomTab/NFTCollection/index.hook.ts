import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageKey from 'src/core/locales/LanguageKey';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    getCurrentTabIndex,
    setTabCollectionIndex,
} from 'src/core/redux/slice/NFT/NFTImport.slice';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';

const useNFTCollectionTab = ({ navigation }: RootNavigationType) => {
    const currentTabIndex = useAppSelector(getCurrentTabIndex) ?? 0;
    const { t } = useTranslation();

    const dispatch = useAppDispatch();

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

    return { t, handleTabChange };
};
export default useNFTCollectionTab;
