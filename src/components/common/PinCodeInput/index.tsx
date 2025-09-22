import React, { useEffect } from 'react';
import { Text, TextInput, View } from 'react-native';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';
import useStyles from './styles';

const CELL_COUNT = 6;

type PinCodeType = {
    customRef?: React.RefObject<TextInput>;
    count?: number;
    maxCount?: number;
    value: string;
    setValue(text: string): void;
    error?: boolean;
    customError?: string;
    unFocus?: boolean;
};

const PinCodeInput: React.FC<PinCodeType> = ({
    customRef,
    count,
    maxCount = 5,
    value,
    setValue,
    error = false,
    customError,
    unFocus = false,
}) => {
    const theme = useAppTheme();

    const styles = useStyles(theme);
    const defaultRef = useBlurOnFulfill({ value, cellCount: CELL_COUNT });

    const ref = customRef ?? defaultRef;

    const getColor = (isFocused: boolean) =>
        isFocused
            ? theme.colors.outline_outine_strong
            : theme.colors.outline_outine;
    useEffect(() => {
        if (!unFocus) {
            if (Utils.isAndroid) {
                // On some low-performance Android devices, the process of rendering pin code input is slow,
                // so we need to delay 1s to finish rendering before focusing
                setTimeout(() => {
                    ref.current?.focus();
                }, 1000);
            } else {
                ref.current?.focus();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unFocus]);

    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const renderCell = ({
        index,
        symbol,
        isFocused,
    }: {
        index: number;
        symbol: any;
        isFocused: boolean;
    }) => {
        let textChild = null;

        if (isFocused) {
            textChild = <Cursor />;
        }

        return (
            <View
                key={index}
                style={[
                    styles.cell,
                    appStyles.center,
                    {
                        borderColor: error
                            ? appColors.functional.warning
                            : getColor(isFocused),
                    },
                ]}
                onLayout={getCellOnLayoutHandler(index)}>
                {symbol ? (
                    <View style={styles.dot} />
                ) : (
                    <Text style={styles.text} allowFontScaling={false}>
                        {textChild}
                    </Text>
                )}
            </View>
        );
    };

    const getError = (): string => {
        const defaultError = count
            ? LanguageKey.incorrect_pin_title_with_count
            : LanguageKey.incorrect_pin_title;

        return customError ?? defaultError;
    };

    return (
        <View>
            {error ? (
                <View style={[appStyles.center, appStyles.mbt15]}>
                    <AppText
                        titleWithI18n={getError()}
                        variant={TextVariantKeys.bodyMSmall}
                        styles={[
                            styles.incorrectText,
                            appStyles.textAlignCenter,
                        ]}
                        i18nParam={{ count: count, maxCount }}
                    />
                </View>
            ) : null}
            <CodeField
                ref={ref}
                {...props}
                rootStyle={styles.codeFieldRoot}
                value={value}
                onChangeText={(currentValue: string) => {
                    const numericText = currentValue.replace(/\D/g, '');
                    if (numericText.length <= numericText.length + 1) {
                        setValue(numericText);
                    }
                }}
                cellCount={CELL_COUNT}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={renderCell}
            />
        </View>
    );
};

export default PinCodeInput;
