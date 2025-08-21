import AppText from "components/AppText";
import React, { useEffect } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import appColors from "src/core/constants/AppColors";
import TextVariantKeys from "src/core/constants/TextVariantKeys";
import appStyles from "src/core/styles";
import Utils from "src/utils/commonUtils";

const CELL_COUNT = 6;

type PinCodeType = {
  customRef?: React.RefObject<TextInput | null>;
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
  const styles = useStyles();
  const defaultRef = useBlurOnFulfill({ value, cellCount: CELL_COUNT });

  const ref = customRef ?? defaultRef;

  const getColor = (isFocused: boolean) =>
    isFocused ? appColors.neutral.n700 : appColors.neutral.n400;
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
        onLayout={getCellOnLayoutHandler(index)}
      >
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
    const defaultError = "Pin code bị sai, hãy thử lại";

    return customError ?? defaultError;
  };

  return (
    <View>
      {error ? (
        <View style={[appStyles.center, appStyles.mbt15]}>
          <AppText
            titleWithI18n={getError()}
            variant={TextVariantKeys.BodySmall}
            styles={[styles.incorrectText, appStyles.textAlignCenter]}
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
          const numericText = currentValue.replace(/\D/g, "");
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

const useStyles = () =>
  StyleSheet.create({
    codeFieldRoot: {
      paddingHorizontal: 20,
      width: "100%",
    },
    cell: {
      width: 44,
      height: 44,
      borderWidth: 1,
      borderRadius: 3,
      backgroundColor: "white",
    },
    text: {
      lineHeight: 38,
      fontSize: 24,
      textAlign: "center",
      color: "black",
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: 100,
      backgroundColor: "black",
    },
    incorrectText: {
      color: appColors.functional.warning,
    },
  });

export default PinCodeInput;
