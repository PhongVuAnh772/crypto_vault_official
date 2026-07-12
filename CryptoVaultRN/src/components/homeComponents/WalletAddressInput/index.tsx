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
import AppText from 'src/components/common/AppText';
import appColors from 'src/core/constants/AppColors';
import { ScanSvgIcon, Copy2SvgIcon } from 'src/core/constants/AppIconsSvg';
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
    iconColor?: string;
    dividerColor?: string;
    placeholderTextColor?: string;
};

const WalletAddressInput = ({
    handleCopyToClipboard,
    onChangeText,
    scanQR,
    value,
    labelStyle,
    showTo,
    containerStyle,
    editable = true,
    showLabel = true,
    labelPlaceholderTitle = LanguageKey.nft_contract_address,
    inputStyle,
    onPressClose,
    onSubmit,
    iconColor = "#8F9CFE",
    dividerColor = "#23253b",
    placeholderTextColor = "#4B4F68",
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
                    WalletAddressInputStyle.inputBox,
                    containerStyle,
                ]}>
                {showTo && (
                    <AppText
                        title={`${t(LanguageKey.common_text_to)}:`}
                        variant={TextVariantKeys.bodyMMedium}
                        styles={[WalletAddressInputStyle.to]}
                        textColor="#8894A6"
                    />
                )}
                <TextInput
                    numberOfLines={1}
                    onChangeText={text => onChangeText(text)}
                    value={value}
                    placeholder={t(labelPlaceholderTitle)}
                    placeholderTextColor={placeholderTextColor}
                    style={[
                        WalletAddressInputStyle.inputAddressContent,
                        inputStyle,
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
                            color={iconColor}
                        />
                    </TouchableOpacity>
                ) : null}
                <View style={WalletAddressInputStyle.actionIconsContainer}>
                    <TouchableOpacity
                        onPress={handleCopyToClipboard}
                        disabled={!editable}
                        style={WalletAddressInputStyle.actionIconButton}>
                        <Copy2SvgIcon width={22} height={22} color={iconColor} />
                    </TouchableOpacity>
                    <View style={[WalletAddressInputStyle.verticalDivider, { backgroundColor: dividerColor }]} />
                    <TouchableOpacity
                        onPress={scanQR}
                        disabled={!editable}
                        style={WalletAddressInputStyle.actionIconButton}>
                        <ScanSvgIcon width={22} height={22} color={iconColor} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default WalletAddressInput;
