import React from 'react';
import { View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppLogoLoadingAnimation from 'src/components/common/AppLogoLoadingAnimation';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { EmailVerifiedSvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useEmailVerifiedSuccessfully from './emailVerifiedSuccessfully.hook';

const EmailVerifiedSuccessfullyView: React.FC<
    RootNavigationType
> = navigation => {
    const { login, isLoading } = useEmailVerifiedSuccessfully(navigation);

    return (
        <ScreenWrapper
            backgroundImage={appImages.background1}
            subStyle={[appStyles.mbt30, appStyles.flex1, appStyles.pH25]}>
            <View style={[appStyles.flex1, appStyles.center, appStyles.mbt30]}>
                <EmailVerifiedSvgIcon />
                <View style={[appStyles.mt30, appStyles.mbt10]}>
                    <AppText
                        titleWithI18n={
                            LanguageKey.rez_point_verified_your_email
                        }
                        variant={TextVariantKeys.titleLarge}
                        textColor={appColors.neutral.black}
                    />
                </View>
                <AppText
                    titleWithI18n={
                        LanguageKey.rez_point_email_verified_sub_title
                    }
                    variant={TextVariantKeys.bodyRMedium}
                    styles={appStyles.textAlignCenter}
                    textColor={appColors.neutral.black}
                />
            </View>
            <AppButtonSVG
                onPress={login}
                titleWithI18n={LanguageKey.rez_point_continue_with_sign_in}
                textVariant={TextVariantKeys.bodyMMedium}
                textColor={appColors.neutral.white}
                SvgView={SvgView.button}
                buttonHeight={48}
            />
            <AppLogoLoadingAnimation isLoading={isLoading} />
        </ScreenWrapper>
    );
};

export default EmailVerifiedSuccessfullyView;
