import { t } from 'i18next';
import React from 'react';
import { View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { ScreenWrapper } from 'src/components';
import AppButton from 'src/components/common/AppButton';
import AppButtonSVG from 'src/components/common/AppButtonSvg';
import AppText from 'src/components/common/AppText';
import AppTextInput from 'src/components/common/AppTextInput';
import WalletAddressInput from 'src/components/homeComponents/WalletAddressInput';
import SvgView from 'src/components/SvgBox';
import appColors from 'src/core/constants/AppColors';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import useAppSafeAreaInsets from 'src/core/hooks/useAppSafeAreaInsets';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import appStyles from 'src/core/styles';
import GlobalUtils from 'src/core/utils/globalUtils';
import useStyle from './style';

type AddCustomTokenViewProps = {
    onCloseScanQr: () => void;
    handleCallBackScanQR: (value: string) => void;
    showScanQRCamera: boolean;
    handleCopyToClipboard: () => Promise<void>;
    setContractAddress: React.Dispatch<React.SetStateAction<string>>;
    contractAddress: string;
    onShowScanQRCamera: () => void;
    handleClearData: () => void;
    error: boolean;
    nameToken: string;
    setNameToken: React.Dispatch<React.SetStateAction<string>>;
    symbolToken: string;
    setSymbolToken: React.Dispatch<React.SetStateAction<string>>;
    editable: boolean;
    decimalsToken: string;
    setDecimalsToken: React.Dispatch<React.SetStateAction<string>>;
    handleAddToken: () => Promise<void>;
    validateInput: () => boolean;
    isLoadingPage: boolean;
};

export const MainLayout = ({
    onCloseScanQr,
    handleCallBackScanQR,
    showScanQRCamera,
    handleCopyToClipboard,
    setContractAddress,
    contractAddress,
    onShowScanQRCamera,
    handleClearData,
    error,
    nameToken,
    setNameToken,
    symbolToken,
    setSymbolToken,
    editable,
    decimalsToken,
    setDecimalsToken,
    handleAddToken,
    validateInput,
    isLoadingPage,
}: AddCustomTokenViewProps) => {
    const theme = useAppTheme();
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const insets: EdgeInsets = useAppSafeAreaInsets();
    const addCustomTokenStyle = useStyle(insets, theme);
    return (
        <ScreenWrapper
            enableHeader
            paddingTop
            paddingBottom={!newUI}
            headerTitleWithI18n={LanguageKey.add_custom_crypto_title}
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTextColor={newUI ? appColors.neutral.white : undefined}
            backButtonColor={newUI ? appColors.neutral.white : undefined}
            backgroundColor={
                newUI
                    ? appColors.main.tokyoRed
                    : theme.colors.surface_surface_default
            }
            enableDismissKeyboard
            onCloseScanQR={onCloseScanQr}
            callBackWhenScanQR={handleCallBackScanQR}
            showScanQRCamera={showScanQRCamera}>
            <View
                style={[
                    addCustomTokenStyle.pH25,
                    addCustomTokenStyle.flex1,
                    addCustomTokenStyle.container,
                ]}>
                <View style={addCustomTokenStyle.flex1}>
                    <View style={addCustomTokenStyle.mt10}>
                        <WalletAddressInput
                            handleCopyToClipboard={handleCopyToClipboard}
                            onChangeText={setContractAddress}
                            scanQR={onShowScanQRCamera}
                            value={contractAddress}
                            labelStyle={addCustomTokenStyle.labelWalletAddress}
                            labelPlaceholderTitle={t(
                                LanguageKey.nft_contract_address,
                            )}
                            inputStyle={addCustomTokenStyle.inputAddress}
                            onPressClose={handleClearData}
                            inputAddressContainer={appStyles.flex1}
                        />
                    </View>
                    {error && (
                        <AppText
                            titleWithI18n={
                                LanguageKey.common_invalid_contract_address
                            }
                            variant={TextVariantKeys.bodyRSmall}
                            textColor={theme.colors.outline_outine_brands}
                        />
                    )}
                    <View style={addCustomTokenStyle.mt10}>
                        <AppTextInput
                            labelName={t(LanguageKey.common_name_token)}
                            required
                            placeholder={t(LanguageKey.common_enter_name_token)}
                            value={nameToken}
                            onChangeText={setNameToken}
                            keyboardType="default"
                            editable={editable}
                            styleTextInput={
                                editable ? null : addCustomTokenStyle.disable
                            }
                        />
                    </View>
                    <View style={addCustomTokenStyle.mt15}>
                        <AppTextInput
                            labelName={t(LanguageKey.common_symbol_token)}
                            required
                            placeholder={t(
                                LanguageKey.common_enter_symbol_token,
                            )}
                            value={symbolToken}
                            onChangeText={setSymbolToken}
                            keyboardType="default"
                            editable={editable}
                            styleTextInput={
                                editable ? null : addCustomTokenStyle.disable
                            }
                        />
                    </View>
                    <View style={addCustomTokenStyle.mt15}>
                        <AppTextInput
                            labelName={t(LanguageKey.common_decimals_token)}
                            required
                            placeholder={t(
                                LanguageKey.common_enter_decimals_token,
                            )}
                            value={decimalsToken}
                            onChangeText={setDecimalsToken}
                            keyboardType="numeric"
                            editable={editable}
                            styleTextInput={
                                editable ? null : addCustomTokenStyle.disable
                            }
                        />
                    </View>
                </View>
                {newUI ? (
                    <AppButtonSVG
                        onPress={handleAddToken}
                        titleWithI18n={LanguageKey.common_add}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        isLoading={isLoadingPage}
                        disabled={validateInput() || error}
                        SvgView={SvgView.button}
                        buttonHeight={48}
                    />
                ) : (
                    <AppButton
                        onPress={handleAddToken}
                        titleWithI18n={LanguageKey.common_add}
                        textVariant={TextVariantKeys.bodyMMedium}
                        textColor={appColors.neutral.white}
                        styles={addCustomTokenStyle.button}
                        isLoading={isLoadingPage}
                        disabled={validateInput() || error}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};
