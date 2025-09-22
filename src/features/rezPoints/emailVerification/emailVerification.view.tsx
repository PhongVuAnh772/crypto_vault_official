import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppLogoLoadingAnimation from 'src/components/common/AppLogoLoadingAnimation';
import AppText from 'src/components/common/AppText';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import { EmailVerifySvgIcon } from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useEmailVerification from './emailVerification.hook';

const EmailVerificationView: React.FC<RootNavigationType> = navigation => {
    const {
        handleCheckEmailVerified,
        isLoading,
        handleClickRestartMyRegistration,
        getInformation,
        handleResendEmail,
        timeLeft,
    } = useEmailVerification(navigation);

    return (
        <ScreenWrapper
            backgroundImage={appImages.background1}
            subStyle={[appStyles.mbt30, appStyles.flex1, appStyles.pH25]}>
            <View style={[appStyles.flex1, appStyles.center, appStyles.mbt30]}>
                <EmailVerifySvgIcon />
                <View style={[appStyles.mt30, appStyles.mbt10]}>
                    <AppText
                        titleWithI18n={LanguageKey.rez_point_verify_your_email}
                        variant={TextVariantKeys.titleLarge}
                        textColor={appColors.neutral.black}
                    />
                </View>
                <AppText
                    titleWithI18n={
                        LanguageKey.rez_point_verify_email_sub_title_1
                    }
                    variant={TextVariantKeys.bodyRMedium}
                    styles={appStyles.textAlignCenter}
                    textColor={appColors.neutral.black}>
                    <AppText
                        title={` ${getInformation.email} `}
                        variant={TextVariantKeys.labelMedium}
                        textColor={appColors.main.tokyoRed}
                        styles={appStyles.textAlignCenter}>
                        <AppText
                            titleWithI18n={
                                LanguageKey.rez_point_verify_email_sub_title_2
                            }
                            variant={TextVariantKeys.bodyRMedium}
                            styles={appStyles.textAlignCenter}
                            textColor={appColors.neutral.black}
                        />
                    </AppText>
                </AppText>
                <View style={appStyles.mt30}>
                    {timeLeft > 0 ? (
                        <AppText
                            titleWithI18n={
                                LanguageKey.rez_point_resend_email_in
                            }
                            variant={TextVariantKeys.bodyMMedium}
                            styles={[appStyles.textAlignCenter]}
                            textColor={appColors.neutral.n600}
                            i18nParam={{
                                time: `00:${timeLeft}`,
                            }}
                        />
                    ) : (
                        <TouchableOpacity onPress={handleResendEmail}>
                            <AppText
                                titleWithI18n={LanguageKey.rez_point_re_send}
                                variant={TextVariantKeys.bodyMMedium}
                                styles={[
                                    appStyles.textAlignCenter,
                                    appStyles.textUnderline,
                                ]}
                                textColor={appColors.main.tokyoRed}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <TouchableOpacity
                style={appStyles.mbt15}
                onPress={handleClickRestartMyRegistration}>
                <AppText
                    titleWithI18n={
                        LanguageKey.rez_point_restart_my_registration
                    }
                    variant={TextVariantKeys.bodyMMedium}
                    styles={appStyles.textAlignCenter}
                    textColor={appColors.main.tokyoRed}
                />
            </TouchableOpacity>

            <AppButtonSVG
                onPress={() => handleCheckEmailVerified(true)}
                titleWithI18n={LanguageKey.rez_point_i_verified_my_email}
                textVariant={TextVariantKeys.bodyMMedium}
                textColor={appColors.neutral.white}
                SvgView={SvgView.button}
                buttonHeight={48}
            />
            <AppLogoLoadingAnimation isLoading={isLoading} />
        </ScreenWrapper>
    );
};

export default EmailVerificationView;
