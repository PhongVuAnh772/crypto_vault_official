import React, { FormEvent, useState } from 'react';
import {
    GestureResponderEvent,
    StyleProp,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import AppLoading from '../AppLoading';
import AppText from '../AppText';
import useAppButtonStyles from './styles';

type AppButtonProps = {
    title?: string;
    titleWithI18n?: string;
    onPress?: (
        event: GestureResponderEvent,
    ) =>
        | void
        | ((e?: FormEvent<HTMLFormElement> | undefined) => void)
        | Promise<void>;
    textStyles?: TextStyle;
    textVariant?: TextVariantKeys;
    textColor?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    disabled?: boolean;
    disabledBackgroundColor?: string;
    backgroundColor?: string;
    disabledTextColor?: string;
    isLoading?: boolean;
    onlyDisabled?: boolean;
    forceStyles?: StyleProp<ViewStyle>;
    styles?: StyleProp<ViewStyle>;
    SvgView?: ({
        height,
        backgroundColor,
        width,
        borderColor,
        borderWidth,
    }: {
        height: number;
        backgroundColor: string;
        width: number;
        borderWidth?: number;
        borderColor?: string;
    }) => React.JSX.Element;
    buttonHeight?: number;
    borderWidth?: number;
    borderColor?: string;
};

const AppButtonSVG: React.FC<AppButtonProps> = props => {
    const theme: AppThemeType = useAppTheme();

    const {
        onPress,
        title,
        titleWithI18n,
        textStyles,
        textVariant,
        textColor,
        icon,
        rightIcon,
        disabled = false,
        isLoading = false,
        disabledTextColor = theme?.colors.label_text_disable,
        disabledBackgroundColor = theme.colors.label_surface_disable,
        onlyDisabled,
        backgroundColor,
        forceStyles,
        styles,
        SvgView,
        buttonHeight,
        borderColor,
        borderWidth,
    } = props;

    const appButtonStyles = useAppButtonStyles(theme);
    const [widthHeader, setWidthHeader] = useState<number>(Utils.screenWidth);
    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setWidthHeader(width);
    };
    const getButtonStyles = () => {
        if (forceStyles) {
            return forceStyles;
        }
        if (styles) {
            return styles;
        }
        return undefined;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onLayout={handleLayout}
            style={[getButtonStyles(), { backgroundColor: 'transparent' }]}
            disabled={isLoading || disabled || onlyDisabled}>
            {SvgView?.({
                borderColor: borderColor,
                borderWidth: borderWidth,
                height: buttonHeight ?? 48,
                width: widthHeader,
                backgroundColor:
                    disabled || isLoading
                        ? disabledBackgroundColor
                        : (backgroundColor ?? appColors.main.tokyoRed),
            })}
            <View
                style={[
                    appButtonStyles.content,
                    SvgView
                        ? null
                        : {
                              backgroundColor:
                                  disabled || isLoading
                                      ? disabledBackgroundColor
                                      : backgroundColor,
                          },
                ]}>
                {isLoading ? (
                    <AppLoading />
                ) : (
                    <>
                        {icon}
                        {title || titleWithI18n ? (
                            <AppText
                                variant={textVariant}
                                title={title}
                                titleWithI18n={titleWithI18n}
                                textColor={
                                    disabled ? disabledTextColor : textColor
                                }
                                styles={textStyles}
                            />
                        ) : null}
                        {rightIcon}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default AppButtonSVG;
