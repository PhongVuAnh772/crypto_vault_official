import React, { RefObject } from 'react';
import {
    KeyboardTypeOptions,
    NativeSyntheticEvent,
    StyleProp,
    TextInput,
    TextInputFocusEventData,
    TextStyle,
} from 'react-native';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import AppText from '../AppText';
import appTextInput from './style';

export type InputType = {
    labelName?: string;
    required?: boolean;
    placeholder?: string;
    value?: string;
    onChangeText?: (value: string) => void;
    styleTextInput?: StyleProp<TextStyle>;
    multiline?: boolean;
    keyboardType?: KeyboardTypeOptions;
    editable?: boolean;
    errorMessage?: string;
    numberOfLines?: number;
    refInput?: RefObject<TextInput>;
    onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
    secureTextEntry?: boolean;
    labelNameStyle?: StyleProp<TextStyle>;
    textVariant?: TextVariantKeys;
};

const AppTextInput = ({
    labelName,
    required,
    placeholder,
    value,
    onChangeText,
    styleTextInput,
    multiline,
    keyboardType,
    editable,
    errorMessage,
    numberOfLines,
    refInput,
    onBlur,
    secureTextEntry,
    labelNameStyle,
    textVariant,
}: InputType) => {
    return (
        <>
            {labelName && (
                <AppText
                    titleWithI18n={labelName}
                    variant={textVariant ?? TextVariantKeys.bodyRSmall}
                    styles={[appTextInput.labelName, labelNameStyle]}>
                    {required ? (
                        <AppText
                            title=" *"
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={appColors.main.tokyoRed}
                        />
                    ) : (
                        <></>
                    )}
                </AppText>
            )}
            <TextInput
                ref={refInput}
                scrollEnabled={false}
                multiline={multiline}
                placeholder={placeholder}
                placeholderTextColor={appColors.neutral.n400}
                value={value}
                onChangeText={onChangeText}
                style={[appTextInput.inputText, styleTextInput]}
                keyboardType={keyboardType}
                editable={editable}
                numberOfLines={numberOfLines}
                onBlur={onBlur}
                secureTextEntry={secureTextEntry}
            />
            {errorMessage && (
                <AppText
                    title={errorMessage}
                    variant={TextVariantKeys.bodyMSmall}
                    textColor={appColors.main.tokyoRed}
                />
            )}
        </>
    );
};

export default AppTextInput;
