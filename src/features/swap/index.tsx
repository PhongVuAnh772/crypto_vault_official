import React from 'react';
import { useTranslation } from 'react-i18next';
import AppTabBar from 'src/components/common/AppTabBar';
import RequirePinCodeLayout from 'src/components/layout/RequirePinCode/requirePinCode.view';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useSwapMain from './index.hook';
import SwapView from './swap/swap.view';
import SwapHistoryView from './swapHistory/swapHistory.view';

const SwapMain: React.FC<RootNavigationType> = () => {
    const { t } = useTranslation();
    const { getShowPinCode, onClose, setPinCode } = useSwapMain();
    return (
        <>
            <AppTabBar
                screensData={[
                    {
                        screen: SwapView,
                        title: t(LanguageKey.home_swap_title),
                    },
                    {
                        screen: SwapHistoryView,
                        title: t(LanguageKey.common_history),
                    },
                ]}
                screenWrapperProps={{
                    headerTitleWithI18n: t(LanguageKey.home_swap_title),
                    enableHeader: true,
                    headerTextVariant: TextVariantKeys.titleMedium,
                    paddingTop: true,
                    maxFontSizeMultiplier: 1.2,
                }}
            />
            <RequirePinCodeLayout
                onClose={onClose}
                visible={getShowPinCode}
                continueActionAfterPassPinCode={setPinCode}
            />
        </>
    );
};

export default SwapMain;
