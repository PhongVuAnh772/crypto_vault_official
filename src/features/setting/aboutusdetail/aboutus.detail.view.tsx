import React from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { ScreenWrapper } from 'src/components';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useAboutUsDetail from './aboutus.detai.hook';
import aboutusDetailStyles from './aboutus.detail.style';

const AboutUsDetail: React.FC<RootNavigationType> = () => {
    const theme = useAppTheme();
    const { policyContent, lastUpdate, loading, newUI } = useAboutUsDetail();
    return (
        <ScreenWrapper
            headerTitleWithI18n={LanguageKey.setting_about}
            headerTextVariant={TextVariantKeys.titleLarge}
            enableHeader
            paddingTop
            subStyle={[aboutusDetailStyles.flex1]}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }>
            <ScrollView
                bounces={false}
                style={[
                    aboutusDetailStyles.h100,
                    aboutusDetailStyles.boxContainer,
                ]}>
                <View style={aboutusDetailStyles.boxContainer}>
                    <View style={aboutusDetailStyles.container}>
                        {loading ? (
                            <Loading />
                        ) : (
                            <>
                                <AppText
                                    titleWithI18n={
                                        LanguageKey.setting_last_updated
                                    }
                                    variant={TextVariantKeys.bodyMSmall}
                                    styles={aboutusDetailStyles.lastUpdate}>
                                    <AppText
                                        title={`: ${lastUpdate()}`}
                                        variant={TextVariantKeys.bodyMSmall}
                                        styles={aboutusDetailStyles.lastUpdate}
                                    />
                                </AppText>
                                <View style={aboutusDetailStyles.mt16}>
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.setting_table_of_content
                                        }
                                        variant={TextVariantKeys.bodyMMedium}
                                    />
                                </View>
                                <View style={aboutusDetailStyles.mt8}>
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.setting_privacy_policy
                                        }
                                        variant={TextVariantKeys.titleSmall}
                                        textColor={appColors.main.tokyoRed}
                                    />
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.setting_terms_and_conditions
                                        }
                                        variant={TextVariantKeys.titleSmall}
                                        textColor={appColors.main.tokyoRed}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                    <View style={aboutusDetailStyles.containerPolicy}>
                        {loading ? (
                            <>
                                <Loading />
                                <Spacer />
                            </>
                        ) : (
                            policyContent?.map(item => {
                                const htmlSource = { html: item.content };
                                return (
                                    <RenderHtml
                                        source={htmlSource}
                                        key={item._id}
                                    />
                                );
                            })
                        )}
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};
const Spacer = () => <View style={aboutusDetailStyles.h5} />;

const Loading = () => (
    <View style={[aboutusDetailStyles.center, aboutusDetailStyles.flex1]}>
        <ActivityIndicator />
    </View>
);
export default AboutUsDetail;
