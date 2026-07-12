import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import tonConnectConstants from 'src/core/constants/TonConnectConstants';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { getDAppBrowse, removeDAppBrowse } from '../slice/tonConnect.slice';

export const useBrowse = ({ navigation }: RootNavigationType) => {
    const listDAppBrowse = useAppSelector(getDAppBrowse);
    const dispatch = useAppDispatch();
    const theme = useAppTheme();
    const [searchValue, setSearchValue] = useState('');
    const [isShowModalRemove, setIsShowModalRemove] = useState(false);
    const [url, setUrl] = useState('');
    const handleSearchChange = (text: string) => {
        setSearchValue(text);
    };
    const { t } = useTranslation();
    const goToWeb = () => {
        if (searchValue.trim()) {
            navigation.navigate(HomeStackScreenKey.DAppBrowserScreen, {
                url:
                    tonConnectConstants.browseDuckDuckGo +
                    encodeURIComponent(searchValue),
            });
        }
    };
    const showModalRemove = (item: string) => {
        setUrl(item);
        setIsShowModalRemove(true);
    };
    const closeModalRemove = () => {
        setIsShowModalRemove(false);
    };
    const removeDappBrowse = () => {
        dispatch(removeDAppBrowse(url));
        closeModalRemove();
    };
    const goToWebDapp = (url: string) => {
        navigation.navigate(HomeStackScreenKey.DAppBrowserScreen, { url: url });
    };
    return {
        t,
        url,
        theme,
        searchValue,
        listDAppBrowse,
        isShowModalRemove,
        handleSearchChange,
        showModalRemove,
        closeModalRemove,
        removeDappBrowse,
        goToWeb,
        goToWebDapp,
    };
};
