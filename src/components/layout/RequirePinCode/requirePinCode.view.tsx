import React from 'react';
import { StyleSheet, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import AppButton from 'src/components/common/AppButton';
import AppText from 'src/components/common/AppText';
import PinCodeInput from 'src/components/common/PinCodeInput';
import appColors from 'src/core/constants/AppColors';
import { ArrowLeftSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import CountdownTimer from './CountdownTimer';
import useRequirePinCode from './requirePinCode.hook';

type RequirePinCodeLayoutType = {
    headerTitle?: string;
    subVisible?: boolean;
    visible?: boolean;
    onClose?: () => void;
    continueActionAfterPassPinCode?: (pinCode: string) => void;
    isWebviewShowing?: boolean;
    isMainRequirePinCode?: boolean;
    disableFaceId?: boolean;
};

const RequirePinCodeLayout: React.FC<RequirePinCodeLayoutType> = ({
    headerTitle,
    subVisible = true,
    visible,
    onClose,
    continueActionAfterPassPinCode,
    isWebviewShowing = false,
    isMainRequirePinCode = false,
    disableFaceId = false,
}) => {
    const {
        requirePinCode,
        pinCode,
        onChangeValue,
        incorrectPin,
        insets,
        maxPinCodeAttempts,
        timeLock,
        remainingTime,
        keepSplash,
        theme,
        isUseFaceIdOrTouch,
        onCloseAction,
        ignoreUnfocusCheck,
    } = useRequirePinCode({
        isMainRequirePinCode,
        visible: visible,
        continueActionAfterPassPinCode: continueActionAfterPassPinCode,
        onClose,
        disableFaceId,
    });
    const newUI = GlobalUtils.getEnableRedXNewTheme();

    const styles = useStyles(theme, insets);
    const header = (
        <AppText
            titleWithI18n={headerTitle ?? LanguageKey.pin_code_title}
            variant={TextVariantKeys.titleLarge}
            styles={appStyles.textAlignCenter}
            textColor={
                newUI
                    ? appColors.neutral.white
                    : theme.colors.text_on_surface_text_highest
            }
        />
    );

    const showState = subVisible && (visible ?? requirePinCode) && !keepSplash;
    return showState ? (
        <View style={styles.container}>
            {timeLock ? (
                <CountdownTimer remainingTime={remainingTime} />
            ) : (
                <View style={[appStyles.flex1]}>
                    {onClose ? (
                        <View
                            style={[
                                appStyles.justifyContentBetween,
                                appStyles.flexRow,
                                appStyles.alignItemsCenter,
                                appStyles.mh15,
                            ]}>
                            <AppButton
                                onPress={onCloseAction}
                                icon={
                                    <ArrowLeftSvgIcon
                                        color={
                                            newUI
                                                ? appColors.neutral.white
                                                : theme?.colors
                                                      ?.text_on_surface_text_high
                                        }
                                    />
                                }
                                styles={styles.button}
                            />
                            {header}
                            <AppButton styles={styles.button} />
                        </View>
                    ) : (
                        header
                    )}
                    <View style={styles.box}>
                        <View>
                            <View style={appStyles.mbt15}>
                                <AppText
                                    titleWithI18n={LanguageKey.pin_input_title}
                                    variant={TextVariantKeys.bodyRLarge}
                                    styles={appStyles.textAlignCenter}
                                    textColor={
                                        theme.colors.text_on_surface_text_medium
                                    }
                                />
                            </View>
                            <PinCodeInput
                                value={pinCode}
                                setValue={onChangeValue}
                                error={incorrectPin}
                                count={maxPinCodeAttempts}
                                unFocus={
                                    ignoreUnfocusCheck
                                        ? false
                                        : isUseFaceIdOrTouch || isWebviewShowing
                                }
                            />
                        </View>
                    </View>
                </View>
            )}
        </View>
    ) : null;
};

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        container: {
            position: 'absolute',
            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? appColors.main.tokyoRed
                : theme.colors.surface_surface_default,
            width: Utils.screenWidth,
            height: Utils.screenHeight,
            paddingTop: insets.top,
            zIndex: 100,
        },
        button: {
            width: 32,
        },
        box: {
            ...appStyles.flex1,
            ...appStyles.pT60,
            ...appStyles.pH15,

            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? theme.colors.surface_surface_default
                : undefined,
        },
    });

export default RequirePinCodeLayout;
