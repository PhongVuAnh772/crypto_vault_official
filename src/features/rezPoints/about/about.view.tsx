import React from 'react';
import WebView from 'react-native-webview';
import { ScreenWrapper } from 'src/components';
import AppLogoLoadingAnimation from 'src/components/common/AppLogoLoadingAnimation';
import appColors from 'src/core/constants/AppColors';
import EnvConfig from 'src/core/constants/EnvConfig';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import useAboutRezPoint from './about.hook';

const AboutRezPointView: React.FC = () => {
    const { hideLoading, loading, showLoading, handleNavigation, webViewRef } =
        useAboutRezPoint();

    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            backgroundColor={appColors.main.tokyoRed}
            headerTextColor={appColors.neutral.white}
            backButtonColor={appColors.neutral.white}
            headerTitleWithI18n={LanguageKey.rez_point_about}>
            <WebView
                ref={webViewRef}
                source={{ uri: EnvConfig.REZ_POINT_PACKAGE }}
                style={appStyles.flex1}
                onLoadStart={() => {
                    showLoading();
                }}
                onLoadEnd={() => {
                    hideLoading();
                }}
                onShouldStartLoadWithRequest={handleNavigation}
            />
            <AppLogoLoadingAnimation isLoading={loading} />
        </ScreenWrapper>
    );
};

export default AboutRezPointView;
