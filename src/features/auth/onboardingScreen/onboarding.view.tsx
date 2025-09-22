import React from 'react';
import {
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppAnimationSelector from 'src/components/common/AppAnimationSelector';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import BottomSheetWarningWallet from 'src/components/specific/BottomSheetWalletWarning/bottomSheetWalletWarning.view';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import {
    DropdowSvgIcon,
    NextOnboardingSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import useOnboardingScreen from 'src/features/auth/onboardingScreen/onboarding.hook';
import { ViewListLanguage } from 'src/features/setting/changelanguage/changeLanguage.compoent';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useStyles from './onboarding.styles';

const OnboardingScreen: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        createRestoreWalletAction,
        onChangeLanguage,
        nextAction,
        getTitle,
        getSubTitle,
        openDropdown,
        closeDropdown,
        showDropdown,
        count,
        listLanguage,
        languageType,
        insets,
        theme,
        isVisible,
        openModalCreateNewWallet,
        closeModalCreateNewWallet,
        createWalletAction,
        onModalConfirmDismiss,
        isFirstScreen,
        newUI,
    } = useOnboardingScreen({ navigation });

    const styles = useStyles(theme, isFirstScreen);

    const getIcon = () => {
        switch (count) {
            case 1:
                return (
                    <Image
                        source={appImages.onboarding1}
                        style={[appStyles.mt25, styles.imageOnboarding]}
                    />
                );
            case 2:
                return (
                    <Image
                        source={appImages.onboarding2}
                        style={[styles.imageOnboarding, appStyles.mt25]}
                    />
                );
            case 3:
                return (
                    <Image
                        source={appImages.onboarding3}
                        style={[styles.imageOnboarding, appStyles.mt25]}
                    />
                );
            default:
                break;
        }
    };

    return (
        <ScreenWrapper
            mainStyle={[appStyles.flex1]}
            subStyle={[appStyles.flex1]}
            backgroundImage={appImages.onboardingBackground}>
            <TouchableWithoutFeedback onPress={closeDropdown}>
                <View style={appStyles.flex1}>
                    <View style={newUI ? styles.viewNewTop : styles.viewTop}>
                        <>
                            <TouchableOpacity
                                onPress={openDropdown}
                                style={[
                                    styles.button_language,
                                    newUI ? styles.bdr0 : styles.bdr100,
                                    newUI
                                        ? styles.customBorderButtonNewUI
                                        : styles.customBorderButtonInitialUI,
                                ]}>
                                <AppText
                                    title={
                                        languageType === 'en'
                                            ? 'English'
                                            : '日本語'
                                    }
                                    variant={TextVariantKeys.bodyMSmall}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                    maxFontSizeMultiplier={1.3}
                                />
                                <DropdowSvgIcon
                                    color={
                                        theme.colors
                                            .text_on_surface_text_medium_high
                                    }
                                />
                            </TouchableOpacity>
                            <AppAnimationSelector
                                top={100}
                                height={84}
                                isShow={showDropdown}
                                contentStyle={styles.contentDropdown}
                                containerStyle={styles.dropdownContainer}>
                                <ViewListLanguage
                                    theme={theme}
                                    listLanguage={listLanguage}
                                    languageActive={languageType}
                                    style={[appStyles.pV10]}
                                    onChangeLanguage={onChangeLanguage}
                                />
                            </AppAnimationSelector>
                        </>
                        {getIcon()}
                    </View>
                    <View style={styles.viewBottom}>
                        <View style={[appStyles.flex1, styles.pT32]}>
                            <View style={[appStyles.pH10]}>
                                <AppText
                                    styles={styles.title}
                                    titleWithI18n={getTitle()}
                                    variant={TextVariantKeys.headlineMedium}
                                    textColor={
                                        theme.colors
                                            .text_on_surface_text_highest
                                    }
                                />
                            </View>
                            <AppText
                                styles={[styles.titleSub, styles.pT16]}
                                titleWithI18n={getSubTitle()}
                                variant={TextVariantKeys.bodyRMedium}
                                textColor={
                                    theme.colors
                                        .text_on_surface_text_medium_high
                                }
                            />
                        </View>
                        <View
                            style={[
                                {
                                    paddingBottom: insets.bottom,
                                },
                            ]}>
                            {count === 3 ? (
                                <View style={styles.viewButton}>
                                    {newUI ? (
                                        <AppButtonSVG
                                            onPress={openModalCreateNewWallet}
                                            titleWithI18n={
                                                LanguageKey.onboarding_new_wallet_button_title
                                            }
                                            textVariant={
                                                TextVariantKeys.titleSmall
                                            }
                                            textColor={appColors.neutral.white}
                                            SvgView={SvgView.button}
                                            buttonHeight={48}
                                        />
                                    ) : (
                                        <AppButton
                                            styles={{
                                                backgroundColor:
                                                    appColors.main.tokyoRed,
                                                ...appStyles.fullWidth,
                                            }}
                                            onPress={openModalCreateNewWallet}
                                            titleWithI18n={
                                                LanguageKey.onboarding_new_wallet_button_title
                                            }
                                            textVariant={
                                                TextVariantKeys.titleSmall
                                            }
                                            textColor={appColors.neutral.white}
                                        />
                                    )}

                                    <View style={styles.h10} />
                                    {newUI ? (
                                        <AppButtonSVG
                                            onPress={createRestoreWalletAction}
                                            titleWithI18n={
                                                LanguageKey.onboarding_restore_wallet_button_title
                                            }
                                            textVariant={
                                                TextVariantKeys.titleSmall
                                            }
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_highest
                                            }
                                            backgroundColor={
                                                theme.colors
                                                    .label_surface_button_light
                                            }
                                            SvgView={SvgView.button}
                                            buttonHeight={48}
                                        />
                                    ) : (
                                        <AppButton
                                            onPress={createRestoreWalletAction}
                                            styles={{
                                                backgroundColor:
                                                    theme.colors
                                                        .label_surface_button_light,
                                                ...appStyles.fullWidth,
                                            }}
                                            titleWithI18n={
                                                LanguageKey.onboarding_restore_wallet_button_title
                                            }
                                            textVariant={
                                                TextVariantKeys.titleSmall
                                            }
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_highest
                                            }
                                        />
                                    )}
                                </View>
                            ) : (
                                <View style={styles.viewCounterWithButton}>
                                    <View
                                        style={[
                                            appStyles.alignItemsCenter,
                                            appStyles.flexRow,
                                            appStyles.justifyContentBetween,
                                            appStyles.fullWidth,
                                        ]}>
                                        <AppText
                                            title={`${count}/3`}
                                            variant={TextVariantKeys.labelSmall}
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_medium_high
                                            }
                                        />
                                        {newUI ? (
                                            <TouchableOpacity
                                                onPress={nextAction}>
                                                <NextOnboardingSvgIcon />
                                            </TouchableOpacity>
                                        ) : (
                                            <AppButton
                                                forceStyles={styles.nextButton}
                                                titleWithI18n={
                                                    LanguageKey.common_text_next
                                                }
                                                textStyles={
                                                    styles.nextTextStyle
                                                }
                                                onPress={nextAction}
                                            />
                                        )}
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <BottomSheetWarningWallet
                isVisible={isVisible}
                closeModalCreateNewWallet={closeModalCreateNewWallet}
                continueAction={createWalletAction}
                onDismiss={onModalConfirmDismiss}
            />
        </ScreenWrapper>
    );
};

export default OnboardingScreen;
