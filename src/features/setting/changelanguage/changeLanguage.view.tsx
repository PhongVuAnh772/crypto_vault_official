import React from 'react';
import { ScreenWrapper } from 'src/components';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';

import { View } from 'react-native';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import { ViewListLanguage } from './changeLanguage.compoent';
import useChangeLanguage from './changeLanguage.hook';
import useStyles from './changeLanguage.style';

const ChangeLanguageScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        theme,
        insets,
        listLanguage,
        languageType,
        newUI,
        onChangeLanguage,
    } = useChangeLanguage();
    const styles = useStyles(theme, insets);
    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            headerTitleWithI18n={LanguageKey.language_title}
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }>
            <View style={styles.container}>
                <View style={styles.box_language}>
                    <ViewListLanguage
                        theme={theme}
                        listLanguage={listLanguage}
                        languageActive={languageType}
                        style={appStyles.pd15}
                        onChangeLanguage={onChangeLanguage}
                    />
                </View>
                {newUI ? (
                    <View
                        style={[appStyles.flex1, appStyles.justifyContentEnd]}>
                        <View style={styles.button}>
                            <AppButtonSVG
                                onPress={() => navigation.goBack()}
                                titleWithI18n={LanguageKey.common_text_continue}
                                SvgView={SvgView.button}
                                backgroundColor="red"
                                buttonHeight={48}
                                textVariant={TextVariantKeys.bodyMMedium}
                                textColor={
                                    theme.colors.text_on_surface_text_brand
                                }
                            />
                        </View>
                    </View>
                ) : undefined}
            </View>
        </ScreenWrapper>
    );
};

export default ChangeLanguageScreen;
