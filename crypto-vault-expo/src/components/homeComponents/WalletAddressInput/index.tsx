import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    StyleProp,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import AppButton from 'src/components/common/AppButton';
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { ScanSvgIcon } from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import WalletAddressInputStyle from './style';

type WalletAddressInputType = {
    onChangeText: ((text: string) => void) & Function;
    value: string;
    handleCopyToClipboard: () => void;
    scanQR: () => void;
    labelStyle?: StyleProp<TextStyle>;
    showTo?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    inputAddressContainer?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    borderColor?: string;
    labelPlaceholderTitle?: string;
    editable?: boolean;
    showLabel?: boolean;
    onPressClose?: () => void;
    onSubmit?: () => void;
};

const WalletAddressInput = ({
    handleCopyToClipboard,
    onChangeText,
    scanQR,
    value,
    labelStyle,
    showTo,
    containerStyle,
    inputAddressContainer,
    borderColor = appColors.neutral.n100,
    labelPlaceholderTitle = LanguageKey.nft_contract_address,
    editable = true,
    showLabel = true,
    inputStyle,
    onPressClose,
    onSubmit,
}: WalletAddressInputType) => {
    const { t } = useTranslation();
    const onPress = () => {
        onChangeText('');
        if (onPressClose) {
            onPressClose();
        }
    };

    return (
        <View style={[WalletAddressInputStyle.mt15]}>
            {showLabel && labelPlaceholderTitle && (
                <AppText
                    title={t(labelPlaceholderTitle)}
                    variant={TextVariantKeys.bodyRSmall}
                    styles={[WalletAddressInputStyle.labelName, labelStyle]}
                />
            )}

            <View
                style={[
                    WalletAddressInputStyle.flexRow,
                    WalletAddressInputStyle.alignItemsCenter,
                    WalletAddressInputStyle.justifyContentBetween,
                    containerStyle,
                ]}>
                {showTo && (
                    <AppText
                        title={`${t(LanguageKey.common_text_to)}:`}
                        variant={TextVariantKeys.bodyMMedium}
                        styles={[WalletAddressInputStyle.to]}
                        textColor={appColors.neutral.n500}
                    />
                )}
                <View
                    style={[
                        WalletAddressInputStyle.flex1,
                        WalletAddressInputStyle.flexRow,
                        WalletAddressInputStyle.alignItemsCenter,
                    ]}>
                    <TextInput
                        numberOfLines={1}
                        onChangeText={text => onChangeText(text)}
                        value={value}
                        placeholder={t(labelPlaceholderTitle)}
                        style={[
                            WalletAddressInputStyle.inputAddressContainer,
                            inputAddressContainer ?? {},
                            WalletAddressInputStyle.inputAddressContent,
                        ]}
                        editable={editable}
                        onSubmitEditing={onSubmit}
                    />
                    {value.length > 0 && editable ? (
                        <TouchableOpacity
                            onPress={onPress}
                            style={{ padding: 10 }}>
                            <PaperTextInput.Icon
                                icon="close"
                                onPress={onPress}
                            />
                        </TouchableOpacity>
                    ) : null}
                </View>
                <AppButton
                    onPress={handleCopyToClipboard}
                    titleWithI18n={LanguageKey.common_text_paste}
                    textVariant={TextVariantKeys.bodyMMedium}
                    textColor={appColors.main.tokyoRed}
                    onlyDisabled={!editable}
                />
                <TouchableOpacity
                    style={WalletAddressInputStyle.scanIcon}
                    onPress={scanQR}
                    disabled={!editable}>
                    <ScanSvgIcon />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default WalletAddressInput;
