import React, { ReactNode } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleProp,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import SvgView from 'src/components/SvgBox';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import GlobalUtils from 'src/core/utils/globalUtils';
import AppButton from '../AppButton';
import AppButtonSVG from '../AppButtonSvg';
import AppText from '../AppText';
import CoreModal from '../CoreModal';
import useStyles from './styles';

type AppModalType = {
    visible: boolean;
    twoOptions?: boolean;
    twoOptionsVertical?: boolean;
    onPress?: () => void;
    onPress2?: () => void;
    onTouchOutside?: () => void;
    titleWithI18n?: string;
    titleI18nParam?: object;
    titleVariant?: TextVariantKeys;
    subTitleWithI18n?: string;
    subTitleI18nParam?: object;
    subTitle?: string;
    buttonDisabled?: boolean;
    buttonTitleWithI18n?: string;
    buttonTitleWithI18n2?: string;
    footerView?: ReactNode;
    icon?: ReactNode;
    keepBottomButton?: boolean;
    buttonFirstContainerStyle?: ViewStyle;
    buttonSecondContainerStyle?: ViewStyle;
    textButtonSecondColor?: string;
    onDismiss?: () => void;
    subModal?: React.ReactNode;
    subTitleWithI18n2?: string;
    subTitle2?: string;
    enablePaddingSubTitle?: boolean;
    enableKeyboard?: boolean;
    iconButton2?: ReactNode;
    button2Styles?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    childrenContent?: React.ReactNode;
    usingExitIcon?: boolean;
    showRequirePinCode?: boolean;
};

const AppModal: React.FC<AppModalType> = props => {
    const {
        visible,
        twoOptions = false,
        twoOptionsVertical = false,
        onPress,
        onPress2,
        titleWithI18n,
        titleI18nParam,
        titleVariant,
        subTitleWithI18n,
        subTitleWithI18n2,
        subTitle2,
        subTitleI18nParam,
        subTitle,
        buttonTitleWithI18n,
        buttonDisabled = false,
        buttonTitleWithI18n2,
        footerView,
        onTouchOutside,
        icon,
        keepBottomButton = true,
        buttonFirstContainerStyle,
        buttonSecondContainerStyle,
        textButtonSecondColor,
        onDismiss,
        subModal,
        enablePaddingSubTitle,
        enableKeyboard = false,
        iconButton2,
        button2Styles,
        usingExitIcon = false,
        showRequirePinCode = true,
    } = props;
    const theme: AppThemeType = useAppTheme();

    const styles = useStyles(theme);
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    return (
        <CoreModal
            showRequirePinCode={showRequirePinCode}
            animationType="fade"
            transparent={true}
            visible={visible}
            subModal={subModal}
            onDismiss={onDismiss}>
            {enableKeyboard ? (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[styles.modalContainer, appStyles.flexRow]}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={onTouchOutside}
                        style={[
                            appStyles.flex1,
                            appStyles.center,
                            styles.modalContainer,
                        ]}>
                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.modalView}>
                            {usingExitIcon && (
                                <TouchableOpacity style={styles.exitIcon}>
                                    {icon}
                                </TouchableOpacity>
                            )}
                            <View style={appStyles.mbt20}>{icon}</View>

                            {titleWithI18n ? (
                                <AppText
                                    titleWithI18n={titleWithI18n}
                                    i18nParam={titleI18nParam}
                                    variant={
                                        titleVariant ??
                                        TextVariantKeys.titleLarge
                                    }
                                    styles={[
                                        appStyles.mbt20,
                                        appStyles.textAlignCenter,
                                        enablePaddingSubTitle && appStyles.pH15,
                                    ]}
                                    textColor={
                                        theme.colors
                                            .text_on_surface_text_highest
                                    }
                                />
                            ) : null}
                            {props.childrenContent}
                            {subTitleWithI18n || subTitle ? (
                                <AppText
                                    title={subTitle}
                                    titleWithI18n={subTitleWithI18n}
                                    i18nParam={subTitleI18nParam}
                                    variant={TextVariantKeys.bodyRMedium}
                                    styles={[
                                        appStyles.mbt20,
                                        appStyles.textAlignCenter,
                                        enablePaddingSubTitle && appStyles.pH15,
                                    ]}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                />
                            ) : null}
                            {subTitleWithI18n2 || subTitle2 ? (
                                <AppText
                                    titleWithI18n={subTitleWithI18n2}
                                    title={subTitle2}
                                    variant={TextVariantKeys.bodyRMedium}
                                    styles={[
                                        appStyles.mbt20,
                                        appStyles.textAlignCenter,
                                    ]}
                                    textColor={
                                        theme.colors.text_on_surface_text_high
                                    }
                                />
                            ) : null}

                            {footerView ?? null}
                            {keepBottomButton && (
                                <View style={[appStyles.flexRow]}>
                                    {twoOptions ? (
                                        newUI ? (
                                            <AppButtonSVG
                                                onPress={onPress2}
                                                titleWithI18n={
                                                    buttonTitleWithI18n2
                                                }
                                                backgroundColor={
                                                    theme.colors
                                                        .surface_surface_high
                                                }
                                                borderWidth={0.6}
                                                borderColor={
                                                    theme.colors
                                                        .text_on_surface_text_brand_2
                                                }
                                                styles={[
                                                    twoOptions
                                                        ? {
                                                              ...styles.button2,
                                                              ...buttonSecondContainerStyle,
                                                          }
                                                        : styles.button,
                                                    button2Styles,
                                                ]}
                                                textVariant={
                                                    TextVariantKeys.titleSmall
                                                }
                                                textColor={
                                                    textButtonSecondColor ??
                                                    theme.colors
                                                        .text_on_surface_text_invert
                                                }
                                                icon={iconButton2}
                                                SvgView={
                                                    SvgView.ButtonCustomSvg
                                                }
                                                buttonHeight={48}
                                            />
                                        ) : (
                                            <AppButton
                                                onPress={onPress2}
                                                titleWithI18n={
                                                    buttonTitleWithI18n2
                                                }
                                                styles={[
                                                    twoOptions
                                                        ? {
                                                              ...styles.button2,
                                                              ...buttonSecondContainerStyle,
                                                          }
                                                        : styles.button,
                                                    button2Styles,
                                                ]}
                                                textVariant={
                                                    TextVariantKeys.titleSmall
                                                }
                                                textColor={
                                                    textButtonSecondColor ??
                                                    theme.colors
                                                        .text_on_surface_text_invert
                                                }
                                                icon={iconButton2}
                                            />
                                        )
                                    ) : null}
                                    {twoOptions && (
                                        <View style={appStyles.mh6} />
                                    )}
                                    {newUI ? (
                                        <AppButtonSVG
                                            onPress={onPress}
                                            disabled={buttonDisabled}
                                            titleWithI18n={buttonTitleWithI18n}
                                            styles={
                                                twoOptions
                                                    ? {
                                                          ...styles.button2,
                                                          ...buttonFirstContainerStyle,
                                                      }
                                                    : styles.button
                                            }
                                            textVariant={
                                                TextVariantKeys.titleSmall
                                            }
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_invert
                                            }
                                            SvgView={SvgView.ButtonCustomSvg}
                                            buttonHeight={48}
                                        />
                                    ) : (
                                        <AppButton
                                            onPress={onPress}
                                            disabled={buttonDisabled}
                                            titleWithI18n={buttonTitleWithI18n}
                                            styles={
                                                twoOptions
                                                    ? {
                                                          ...styles.button2,
                                                          ...buttonFirstContainerStyle,
                                                      }
                                                    : styles.button
                                            }
                                            textVariant={
                                                TextVariantKeys.titleSmall
                                            }
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_invert
                                            }
                                        />
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            ) : (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onTouchOutside}
                    style={[
                        appStyles.flex1,
                        appStyles.center,
                        styles.modalContainer,
                    ]}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalView}>
                        <View style={appStyles.mbt20}>{icon}</View>
                        {titleWithI18n ? (
                            <AppText
                                titleWithI18n={titleWithI18n}
                                i18nParam={titleI18nParam}
                                variant={
                                    titleVariant ?? TextVariantKeys.titleLarge
                                }
                                styles={[
                                    appStyles.mbt20,
                                    appStyles.textAlignCenter,
                                    enablePaddingSubTitle && appStyles.pH15,
                                ]}
                                textColor={
                                    theme.colors.text_on_surface_text_highest
                                }
                            />
                        ) : null}
                        {subTitleWithI18n || subTitle ? (
                            <AppText
                                title={subTitle}
                                titleWithI18n={subTitleWithI18n}
                                i18nParam={subTitleI18nParam}
                                variant={TextVariantKeys.bodyRMedium}
                                styles={[
                                    appStyles.mbt20,
                                    appStyles.textAlignCenter,
                                    enablePaddingSubTitle && appStyles.pH15,
                                ]}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }
                            />
                        ) : null}
                        {subTitleWithI18n2 && (
                            <AppText
                                titleWithI18n={subTitleWithI18n2}
                                variant={TextVariantKeys.bodyRMedium}
                                styles={[
                                    appStyles.mbt20,
                                    appStyles.textAlignCenter,
                                ]}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }
                            />
                        )}

                        {footerView ?? null}
                        {keepBottomButton && (
                            <>
                                <View style={[appStyles.flexRow]}>
                                    {twoOptions && !twoOptionsVertical ? (
                                        newUI ? (
                                            <AppButtonSVG
                                                onPress={onPress2}
                                                titleWithI18n={
                                                    buttonTitleWithI18n2
                                                }
                                                backgroundColor={
                                                    theme.colors
                                                        .surface_surface_high
                                                }
                                                borderWidth={0.6}
                                                borderColor={
                                                    theme.colors
                                                        .text_on_surface_text_brand_2
                                                }
                                                styles={[
                                                    twoOptions
                                                        ? {
                                                              ...styles.button2,
                                                              ...buttonSecondContainerStyle,
                                                          }
                                                        : styles.button,
                                                    button2Styles,
                                                ]}
                                                textVariant={
                                                    TextVariantKeys.titleSmall
                                                }
                                                textColor={
                                                    textButtonSecondColor ??
                                                    theme.colors
                                                        .text_on_surface_text_invert
                                                }
                                                SvgView={
                                                    SvgView.ButtonCustomSvg
                                                }
                                                buttonHeight={48}
                                            />
                                        ) : (
                                            <AppButton
                                                onPress={onPress2}
                                                titleWithI18n={
                                                    buttonTitleWithI18n2
                                                }
                                                styles={[
                                                    twoOptions
                                                        ? {
                                                              ...styles.button2,
                                                              ...buttonSecondContainerStyle,
                                                          }
                                                        : styles.button,
                                                    button2Styles,
                                                ]}
                                                textVariant={
                                                    TextVariantKeys.titleSmall
                                                }
                                                textColor={
                                                    textButtonSecondColor ??
                                                    theme.colors
                                                        .text_on_surface_text_invert
                                                }
                                            />
                                        )
                                    ) : null}
                                    {twoOptions && (
                                        <View style={appStyles.mh6} />
                                    )}
                                    {newUI ? (
                                        <AppButtonSVG
                                            onPress={onPress}
                                            disabled={buttonDisabled}
                                            titleWithI18n={buttonTitleWithI18n}
                                            styles={
                                                twoOptions
                                                    ? {
                                                          ...styles.button2,
                                                          ...buttonFirstContainerStyle,
                                                      }
                                                    : styles.button
                                            }
                                            textVariant={
                                                TextVariantKeys.titleSmall
                                            }
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_invert
                                            }
                                            SvgView={
                                                twoOptions &&
                                                !twoOptionsVertical
                                                    ? SvgView.ButtonCustomSvg
                                                    : SvgView.button
                                            }
                                            buttonHeight={48}
                                        />
                                    ) : (
                                        <AppButton
                                            onPress={onPress}
                                            disabled={buttonDisabled}
                                            titleWithI18n={buttonTitleWithI18n}
                                            styles={
                                                twoOptions
                                                    ? {
                                                          ...styles.button2,
                                                          ...buttonFirstContainerStyle,
                                                      }
                                                    : styles.button
                                            }
                                            textVariant={
                                                TextVariantKeys.titleSmall
                                            }
                                            textColor={
                                                theme.colors
                                                    .text_on_surface_text_invert
                                            }
                                        />
                                    )}
                                </View>
                                {twoOptionsVertical && (
                                    <View
                                        style={[
                                            appStyles.flexRow,
                                            appStyles.mt15,
                                        ]}>
                                        {newUI ? (
                                            <AppButtonSVG
                                                onPress={onPress2}
                                                titleWithI18n={
                                                    buttonTitleWithI18n2
                                                }
                                                backgroundColor={
                                                    theme.colors
                                                        .surface_surface_high
                                                }
                                                styles={[
                                                    styles.button,
                                                    button2Styles,
                                                ]}
                                                borderWidth={0.6}
                                                borderColor={
                                                    theme.colors
                                                        .text_on_surface_text_brand_2
                                                }
                                                textVariant={
                                                    TextVariantKeys.titleSmall
                                                }
                                                textColor={
                                                    textButtonSecondColor ??
                                                    theme.colors
                                                        .text_on_surface_text_invert
                                                }
                                                SvgView={SvgView.button}
                                                buttonHeight={48}
                                            />
                                        ) : (
                                            <AppButton
                                                onPress={onPress2}
                                                titleWithI18n={
                                                    buttonTitleWithI18n2
                                                }
                                                styles={[
                                                    styles.button,
                                                    button2Styles,
                                                ]}
                                                textVariant={
                                                    TextVariantKeys.titleSmall
                                                }
                                                textColor={
                                                    textButtonSecondColor ??
                                                    theme.colors
                                                        .text_on_surface_text_invert
                                                }
                                            />
                                        )}
                                    </View>
                                )}
                            </>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            )}
            {props.children}
        </CoreModal>
    );
};

export default AppModal;
