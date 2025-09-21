import React from 'react';
import { ImageBackground, View } from 'react-native';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import LoadingScreen from 'src/components/common/LoadingScreen';
import PinCodeInput from 'src/components/common/PinCodeInput';
import ViewSvg from 'src/components/common/ViewSvg/indext';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import {
    CheckCircleSvgIcon,
    CreateWalletSuccessSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import { appImages } from 'src/core/constants/AppImages';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import ThemeKey from 'src/core/enum/ThemeKey';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import RiskTextWithIcon from 'src/features/auth/components/RiskTextWithIcon';
import useRePinCode from 'src/features/auth/reEnterPin/rePinCode.hook';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import useStyles from './reEnterPin.style';

const ReEnterPin: React.FC<RootNavigationType> = ({ navigation }) => {
    const {
        correctPin,
        continueAction,
        value,
        onChangeValue,
        incorrectPin,
        theme,
        themeMode,
        isLoading,
        insets,
        newUI,
    } = useRePinCode({
        navigation,
    });

    const getBackgroundImage = () => {
        return themeMode === ThemeKey.dark
            ? appImages.background1Dark
            : appImages.background1;
    };
    const styles = useStyles(theme, insets);
    return (
        <ScreenWrapper
            enableDismissKeyboard
            enableHeader={newUI ? true : !correctPin}
            paddingTop={newUI ? true : !correctPin}
            headerTitleWithI18n={
                !correctPin ? LanguageKey.re_enter_pin_title : undefined
            }
            headerTextVariant={TextVariantKeys.titleLarge}
            backgroundImage={
                (newUI ? undefined : correctPin)
                    ? getBackgroundImage()
                    : undefined
            }
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}>
            <View style={newUI ? styles.newContainer : styles.container}>
                {correctPin ? (
                    newUI ? (
                        <View style={[appStyles.flex1]}>
                            <ImageBackground
                                style={appStyles.flex1}
                                source={appImages.newBackground1}>
                                <View
                                    style={[
                                        appStyles.flex1,
                                        appStyles.justifyContentEnd,
                                    ]}>
                                    <View>
                                        <View
                                            style={[
                                                appStyles.alignItemsCenter,
                                                appStyles.mbt30,
                                            ]}>
                                            <CreateWalletSuccessSvgIcon />
                                        </View>
                                        <ViewSvg
                                            SvgView={SvgView.viewHome}
                                            backgroundColor={
                                                appColors.neutral.white
                                            }
                                            itemHeight={280}
                                            styleContainer={appStyles.m16}>
                                            <View style={[appStyles.mh30]}>
                                                <View style={appStyles.mv30}>
                                                    <AppText
                                                        titleWithI18n={
                                                            LanguageKey.create_wallet_success_title
                                                        }
                                                        variant={
                                                            TextVariantKeys.titleLarge
                                                        }
                                                        styles={
                                                            appStyles.textAlignCenter
                                                        }
                                                        textColor={
                                                            theme.colors
                                                                .text_on_surface_text_highest
                                                        }
                                                    />
                                                </View>
                                                <View
                                                    style={[
                                                        appStyles.flex1,
                                                        appStyles.pH5,
                                                    ]}>
                                                    <RiskTextWithIcon
                                                        titleWithI18n={
                                                            LanguageKey.create_wallet_success_sub_title_1
                                                        }
                                                        icon={
                                                            <CheckCircleSvgIcon
                                                                color={
                                                                    appColors
                                                                        .main
                                                                        .tokyoRed
                                                                }
                                                            />
                                                        }
                                                        textColor={
                                                            theme.colors
                                                                .text_on_surface_text_high
                                                        }
                                                    />
                                                    <RiskTextWithIcon
                                                        titleWithI18n={
                                                            LanguageKey.create_wallet_success_sub_title_2
                                                        }
                                                        icon={
                                                            <CheckCircleSvgIcon
                                                                color={
                                                                    appColors
                                                                        .main
                                                                        .tokyoRed
                                                                }
                                                            />
                                                        }
                                                        textColor={
                                                            theme.colors
                                                                .text_on_surface_text_high
                                                        }
                                                        style={appStyles.pv16}
                                                    />
                                                    <RiskTextWithIcon
                                                        titleWithI18n={
                                                            LanguageKey.create_wallet_success_sub_title_3
                                                        }
                                                        icon={
                                                            <CheckCircleSvgIcon
                                                                color={
                                                                    appColors
                                                                        .main
                                                                        .tokyoRed
                                                                }
                                                            />
                                                        }
                                                        textColor={
                                                            theme.colors
                                                                .text_on_surface_text_high
                                                        }
                                                    />
                                                </View>
                                            </View>
                                        </ViewSvg>
                                    </View>
                                </View>
                            </ImageBackground>
                            <View
                                style={[
                                    styles.createAccount,
                                    appStyles.pv16,
                                    appStyles.pH25,
                                ]}>
                                <AppButtonSVG
                                    onPress={continueAction}
                                    titleWithI18n={
                                        LanguageKey.common_text_finish
                                    }
                                    styles={{
                                        ...appStyles.fullWidth,
                                        backgroundColor:
                                            theme.colors
                                                .label_surface_button_primary,
                                    }}
                                    textVariant={TextVariantKeys.bodyMMedium}
                                    textColor={
                                        theme.colors.text_on_surface_text_invert
                                    }
                                    SvgView={SvgView.button}
                                    buttonHeight={48}
                                />
                            </View>
                        </View>
                    ) : (
                        <View
                            style={[
                                appStyles.flex1,
                                appStyles.justifyContentBetween,
                                styles.createAccount,
                            ]}>
                            <View style={[appStyles.center, appStyles.flex1]}>
                                <View
                                    style={[
                                        appStyles.flex1,
                                        appStyles.justifyContentEnd,
                                    ]}>
                                    <CreateWalletSuccessSvgIcon />
                                </View>
                                <View style={[appStyles.flex1, appStyles.mh25]}>
                                    <View style={appStyles.mv30}>
                                        <AppText
                                            titleWithI18n={
                                                LanguageKey.create_wallet_success_title
                                            }
                                            variant={TextVariantKeys.titleLarge}
                                            styles={appStyles.textAlignCenter}
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_highest
                                            }
                                        />
                                    </View>
                                    <View style={[appStyles.flex1]}>
                                        <RiskTextWithIcon
                                            titleWithI18n={
                                                LanguageKey.create_wallet_success_sub_title_1
                                            }
                                            icon={
                                                <CheckCircleSvgIcon
                                                    color={
                                                        appColors.main.tokyoRed
                                                    }
                                                />
                                            }
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_high
                                            }
                                        />
                                        <RiskTextWithIcon
                                            titleWithI18n={
                                                LanguageKey.create_wallet_success_sub_title_2
                                            }
                                            icon={
                                                <CheckCircleSvgIcon
                                                    color={
                                                        appColors.main.tokyoRed
                                                    }
                                                />
                                            }
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_high
                                            }
                                            style={appStyles.pV10}
                                        />
                                        <RiskTextWithIcon
                                            titleWithI18n={
                                                LanguageKey.create_wallet_success_sub_title_3
                                            }
                                            icon={
                                                <CheckCircleSvgIcon
                                                    color={
                                                        appColors.main.tokyoRed
                                                    }
                                                />
                                            }
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_high
                                            }
                                        />
                                    </View>
                                </View>
                            </View>
                            <AppButton
                                onPress={continueAction}
                                titleWithI18n={LanguageKey.common_text_finish}
                                styles={{
                                    ...appStyles.fullWidth,
                                    backgroundColor:
                                        theme.colors
                                            .label_surface_button_primary,
                                }}
                                textVariant={TextVariantKeys.bodyMMedium}
                                textColor={
                                    theme.colors.text_on_surface_text_invert
                                }
                            />
                        </View>
                    )
                ) : (
                    <View
                        style={[
                            appStyles.justifyContentBetween,
                            appStyles.flex1,
                            newUI ? appStyles.pH15 : undefined,
                        ]}>
                        <View style={[appStyles.alignItemsCenter]}>
                            <View
                                style={[
                                    appStyles.mt55,
                                    appStyles.alignItemsCenter,
                                ]}>
                                <View style={[appStyles.mbt15]}>
                                    <AppText
                                        titleWithI18n={
                                            LanguageKey.pin_input_title
                                        }
                                        variant={TextVariantKeys.bodyRLarge}
                                        textColor={
                                            theme.colors
                                                .text_on_surface_text_medium
                                        }
                                    />
                                </View>
                                <PinCodeInput
                                    value={value}
                                    setValue={onChangeValue}
                                    error={incorrectPin}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </View>
            <LoadingScreen visible={isLoading} />
        </ScreenWrapper>
    );
};

export default ReEnterPin;
