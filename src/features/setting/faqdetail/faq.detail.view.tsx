import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { ScreenWrapper } from 'src/components';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import GlobalUtils from 'src/core/utils/globalUtils';
import WalletUtils from 'src/core/utils/walletUtils';
import { HomeStackScreenKey } from 'src/navigation/enum/NavigationKey';
import { HomeStackParamListType } from 'src/navigation/stacks/type/HomeStackParamListType';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useStyles from './faq.detail.style';

type FAQParams = RouteProp<
    HomeStackParamListType,
    HomeStackScreenKey.FAQDetail
>;

const FAQDetail: React.FC<RootNavigationType> = () => {
    const faqData = useRoute<FAQParams>().params;
    const htmlSource = { html: faqData.answer };
    const theme = useAppTheme();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const faqDetailStyle = useStyles(theme);
    return (
        <ScreenWrapper
            headerTitle={WalletUtils.getShortAddress(faqData.question)}
            headerTextVariant={TextVariantKeys.titleLarge}
            enableHeader
            paddingTop
            subStyle={[faqDetailStyle.flex1]}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }>
            <View style={faqDetailStyle.container}>
                <RenderHtml source={htmlSource} />
            </View>
        </ScreenWrapper>
    );
};

export default FAQDetail;
