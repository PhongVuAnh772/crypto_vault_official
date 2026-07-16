import React from 'react';
import { Feather } from "@expo/vector-icons";
import LanguageKey from 'src/core/locales/LanguageKey';
import { BottomTabScreenKey } from 'src/navigation/enum/NavigationKey';

export const bottomTabIcon = (
    routeName: string,
    focused: boolean,
) => {
    // Colors from the image: light grey when unfocused, purple when focused
    const color = focused ? "#7C3AED" : "#C4C4C4";
    const size = 24;

    switch (routeName) {
        case LanguageKey.home_tab_crypto_title:
            return <Feather name="home" size={size} color={color} />;
        case LanguageKey.home_tab_nft_collection_title:
            return <Feather name="grid" size={size} color={color} />;
        case LanguageKey.home_tab_transaction_title:
            return <Feather name="activity" size={size} color={color} />;
        case LanguageKey.home_tab_setting_title:
            return <Feather name="settings" size={size} color={color} />;
        case LanguageKey.home_tab_tickets_title:
            return <Feather name="tag" size={size} color={color} />;
        default:
            return null;
    }
};
