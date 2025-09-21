import React, {FormEvent} from 'react';
import {
    GestureResponderEvent,
    StyleProp,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import {AppThemeType} from 'src/core/type/ThemeType';
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
    styles?: StyleProp<ViewStyle>;
    textStyles?: TextStyle;
    forceStyles?: StyleProp<ViewStyle>;
    textVariant?: TextVariantKeys;
    textColor?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    disabled?: boolean;
    disabledBackgroundColor?: string;
    disabledTextColor?: string;
    isLoading?: boolean;
    onlyDisabled?: boolean;
};

const AppButton: React.FC<AppButtonProps> = props => {
    const theme: AppThemeType = useAppTheme();

    const {
        onPress,
        title,
        titleWithI18n,
        textStyles,
        styles,
        forceStyles,
        textVariant,
        textColor,
        icon,
        rightIcon,
        disabled = false,
        isLoading = false,
        disabledTextColor = theme?.colors.label_text_disable,
        disabledBackgroundColor = theme.colors.label_surface_disable,
        onlyDisabled,
    } = props;

    const appButtonStyles = useAppButtonStyles(theme);
    let defaultStyle: StyleProp<ViewStyle> = appButtonStyles.container;

    const getButtonStyles = () => {
        if (forceStyles) {
            return forceStyles;
        }
        if (styles) {
            defaultStyle = [defaultStyle, styles];
        }

        return defaultStyle;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isLoading || disabled || onlyDisabled}
            style={[
                getButtonStyles(),
                disabled || isLoading
                    ? {backgroundColor: disabledBackgroundColor}
                    : null,
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
                            textColor={disabled ? disabledTextColor : textColor}
                            styles={textStyles}
                        />
                    ) : null}
                    {rightIcon}
                </>
            )}
        </TouchableOpacity>
    );
};

export default AppButton;
