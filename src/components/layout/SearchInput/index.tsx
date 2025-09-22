import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardTypeOptions,
    Pressable,
    StyleProp,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { AppThemeType } from 'src/core/type/ThemeType';
import useStyles from './styles';

interface Props {
    bgColor?: string;
    placeholder: string;
    handleEnterPress?: () => void;
    keyboardType: KeyboardTypeOptions;
    value?: string;
    setValue?: (text: string) => void;
    maxLength?: number;
    inputStyles?: StyleProp<ViewStyle>;
    secureTextEntry?: boolean;
    title?: string;
    containerStyle?: ViewStyle;
    disabled?: boolean;
    RightIcon?: React.ReactNode;
    action?: () => void;
    leftIcon?: React.ReactNode;
    notTranslation?: boolean;
}

const RNCustomInput = ({
    containerStyle,
    maxLength,
    bgColor,
    placeholder,
    handleEnterPress,
    value,
    setValue,
    keyboardType,
    inputStyles,
    secureTextEntry,
    title,
    disabled,
    RightIcon,
    action,
    leftIcon,
    notTranslation,
}: Props) => {
    const theme: AppThemeType = useAppTheme();

    const styles = useStyles(theme);
    const { t } = useTranslation();
    const [focus, setFocus] = useState(false);
    const onChangeFocus = () => {
        setFocus(!focus);
    };

    return (
        <View
            style={[
                styles.wrap,
                {
                    borderColor: focus
                        ? theme.colors.text_on_surface_text_high
                        : theme.colors.outline_outine,
                },
            ]}>
            {title && (
                <Text style={styles.title}>
                    {notTranslation ? title : t(title)}
                </Text>
            )}
            <View
                style={[
                    styles.searchContainer,
                    { backgroundColor: bgColor },
                    inputStyles,
                    containerStyle,
                ]}>
                {leftIcon && <Pressable onPress={action}>{leftIcon}</Pressable>}
                <PaperTextInput
                    style={[styles.input, containerStyle]}
                    placeholder={notTranslation ? placeholder : t(placeholder)}
                    placeholderTextColor={
                        theme.colors.text_on_surface_text_light
                    }
                    returnKeyType="done"
                    onSubmitEditing={handleEnterPress}
                    keyboardType={keyboardType}
                    onChangeText={setValue}
                    value={value}
                    maxLength={maxLength}
                    secureTextEntry={secureTextEntry}
                    onBlur={onChangeFocus}
                    onFocus={onChangeFocus}
                    editable={disabled}
                    selectTextOnFocus={disabled}
                    mode="outlined"
                    outlineColor="transparent"
                    activeOutlineColor="transparent"
                    selectionColor={theme.colors.text_on_surface_text_highest}
                    textColor={theme.colors.text_on_surface_text_highest}
                    underlineColor={theme.colors.surface_surface_high}
                    contentStyle={styles.searchContent}
                    
                />
                {RightIcon && <>{RightIcon}</>}
            </View>
        </View>
    );
};

export default RNCustomInput;
