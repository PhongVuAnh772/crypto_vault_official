import React from 'react';
import { ImageBackground, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { SuccessIllustratorSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useContactSuccess from './contact.success.hook';
import useStyles from './contact.success.style';

const ContactSuccess: React.FC<RootNavigationType> = ({ navigation }) => {
    const { newUI, insets, theme, handleGoBack } = useContactSuccess({
        navigation,
    });
    const contactSuccessStyles = useStyles(theme, insets);
    return (
        <ScreenWrapper
            headerTitleWithI18n={LanguageKey.setting_about}
            headerTextVariant={TextVariantKeys.titleLarge}
            paddingTop
            paddingBottom={!newUI}
            backgroundColor={
                newUI ? appColors.main.tokyoRed : appColors.neutral.n100
            }
            backgroundImage={newUI ? undefined : appImages.background1}>
            <ImageBackground
                style={appStyles.flex1}
                source={newUI ? appImages.newBackground1 : undefined}>
                <View
                    style={[
                        contactSuccessStyles.flex1,
                        contactSuccessStyles.pH25,
                    ]}>
                    <View style={[contactSuccessStyles.content]}>
                        <SuccessIllustratorSvgIcon />
                        <View style={contactSuccessStyles.textAppName}>
                            <AppText
                                titleWithI18n={LanguageKey.app_name}
                                variant={TextVariantKeys.titleLarge}
                            />
                        </View>
                        <AppText
                            titleWithI18n={
                                LanguageKey.setting_request_successful
                            }
                            variant={TextVariantKeys.bodyRMedium}
                        />
                    </View>
                </View>
            </ImageBackground>
            <View
                style={[
                    newUI ? contactSuccessStyles.viewButton : null,
                    appStyles.pH25,
                ]}>
                {newUI ? (
                    <AppButtonSVG
                        onPress={handleGoBack}
                        titleWithI18n={LanguageKey.ok}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        styles={{
                            ...contactSuccessStyles.button,
                        }}
                        textStyles={contactSuccessStyles.textButton}
                        SvgView={SvgView.button}
                    />
                ) : (
                    <AppButton
                        onPress={handleGoBack}
                        titleWithI18n={LanguageKey.ok}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        styles={{
                            ...contactSuccessStyles.button,
                        }}
                        textStyles={contactSuccessStyles.textButton}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default ContactSuccess;
