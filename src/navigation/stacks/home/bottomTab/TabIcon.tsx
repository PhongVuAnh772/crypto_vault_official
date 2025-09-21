import React from 'react';
import {
    ClockFocusSvgIcon,
    ClockUnFocusSvgIcon,
    ExploreFocusSvgIcon,
    ExploreUnFocusSvgIcon,
    HomeFocusSvgIcon,
    HomeUnFocusSvgIcon,
    NftFocusSvgIcon,
    NftUnFocusSvgIcon,
    SettingFocusSvgIcon,
    SettingUnFocusSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import {BottomTabScreenKey} from 'src/navigation/enum/NavigationKey';
import LanguageKey from 'src/core/locales/LanguageKey';

const HomeIcon = ({focused}: {focused: boolean}) => {
    return focused ? <HomeFocusSvgIcon /> : <HomeUnFocusSvgIcon />;
};
const NftIcon = ({focused}: {focused: boolean}) => {
    return focused ? <NftFocusSvgIcon /> : <NftUnFocusSvgIcon />;
};
const TransactionIcon = ({focused}: {focused: boolean}) => {
    return focused ? <ClockFocusSvgIcon /> : <ClockUnFocusSvgIcon />;
};
const ExploreIcon = ({focused}: {focused: boolean}) => {
    return focused ? <ExploreFocusSvgIcon /> : <ExploreUnFocusSvgIcon />;
};
const SettingIcon = ({focused}: {focused: boolean}) => {
    return focused ? <SettingFocusSvgIcon /> : <SettingUnFocusSvgIcon />;
};

export const bottomTabIcon = (
    routeName: BottomTabScreenKey,
    focused: boolean,
) => {
    switch (routeName) {
        case LanguageKey.home_tab_crypto_title:
            return <HomeIcon focused={focused} />;
        case LanguageKey.home_tab_nft_collection_title:
            return <NftIcon focused={focused} />;
        case LanguageKey.home_tab_transaction_title:
            return <TransactionIcon focused={focused} />;
        case LanguageKey.home_tab_explore_title:
            return <ExploreIcon focused={focused} />;
        case LanguageKey.home_tab_setting_title:
            return <SettingIcon focused={focused} />;
    }
};
