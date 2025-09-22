import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScreenWrapper } from 'src/components';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import TonConnectedScreen from './ton/connectedScreen.view';


const ConnectionScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const { t } = useTranslation();

    return (
        // <AppTabBar
        //     screensData={[
        //         {
        //             screen: TonConnectedScreen,
        //             title: 'Ton Connect',
        //         },
        //         {
        //             screen: EvmConnectedScreen,
        //             title: 'Wallet Connect',
        //         },
        //     ]}
        //     screenWrapperProps={{
        //         headerTitleWithI18n: t(LanguageKey.wallet_connect_title),
        //         enableHeader: true,
        //         headerTextVariant: TextVariantKeys.titleMedium,
        //         paddingTop: true,
        //         maxFontSizeMultiplier: 1.2,
        //     }}
        // />
        <ScreenWrapper 
        headerTitleWithI18n={t(LanguageKey.wallet_connect_title)}
        enableHeader={true}
        headerTextVariant={TextVariantKeys.titleMedium}
        paddingTop={true}
        backgroundColor={appColors.main.tokyoRed}
        headerTextColor={appColors.neutral.white}
        backButtonColor={appColors.neutral.white}
        >
        <TonConnectedScreen/>

        </ScreenWrapper>
    );
};

export default ConnectionScreen;
