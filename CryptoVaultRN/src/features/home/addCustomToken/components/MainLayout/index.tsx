import { t } from "i18next";
import React from "react";
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import { ScreenWrapper } from "src/components";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import { ScanSvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import useStyle from "./style";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

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

const InputBox: React.FC<{
  label: string;
  required?: boolean;
  leftIcon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (val: string) => void;
  keyboardType?: "default" | "numeric";
  editable?: boolean;
  rightAction?: React.ReactNode;
  onPressClose?: () => void;
  styleTextInput?: any;
  styles: any;
}> = ({
  label,
  required,
  leftIcon,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  editable = true,
  rightAction,
  onPressClose,
  styleTextInput,
  styles,
}) => {
  return (
    <View style={styles.inputWrapper}>
      <View style={styles.labelRow}>
        <AppText variant={TextVariantKeys.bodyRSmall} styles={styles.labelText}>
          {label}
          {required && <Text style={{ color: "#EF4444" }}> *</Text>}
        </AppText>
        {rightAction}
      </View>
      <View style={styles.inputContainer}>
        <View style={styles.leftIconCircle}>
          {leftIcon}
        </View>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#A6B0C0"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          editable={editable}
          style={[styles.textInput, styleTextInput]}
        />
        {value.length > 0 && editable && onPressClose ? (
          <TouchableOpacity
            onPress={onPressClose}
            style={{ padding: 6, marginRight: 4 }}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
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
  const navigation = useNavigation();
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const addCustomTokenStyle = useStyle(insets, theme);

  const addressRightAction = (
    <View style={addCustomTokenStyle.rightActionRow}>
      <TouchableOpacity onPress={handleCopyToClipboard} style={addCustomTokenStyle.pasteBtn}>
        <AppText variant={TextVariantKeys.bodyRSmall} textColor="#5B63E4" styles={addCustomTokenStyle.pasteText}>
          Dán
        </AppText>
      </TouchableOpacity>
      <TouchableOpacity onPress={onShowScanQRCamera} style={addCustomTokenStyle.scanBtn}>
        <ScanSvgIcon width={20} height={20} color="#5B63E4" />
      </TouchableOpacity>
    </View>
  );

  const isBtnDisabled = validateInput() || error || isLoadingPage;

  return (
    <ScreenWrapper
      enableHeader={false}
      paddingTop
      backgroundColor={theme.colors.surface_surface_default}
      enableDismissKeyboard
      onCloseScanQR={onCloseScanQr}
      callBackWhenScanQR={handleCallBackScanQR}
      showScanQRCamera={showScanQRCamera}
    >
      <View style={[addCustomTokenStyle.container]}>
        {/* Custom Header */}
        <View style={addCustomTokenStyle.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={addCustomTokenStyle.backButton}>
            <Ionicons name="close" size={28} color="#5B63E4" />
          </TouchableOpacity>
          <View style={addCustomTokenStyle.headerTitleContainer}>
            <AppText
              titleWithI18n={LanguageKey.add_custom_crypto_title}
              variant={TextVariantKeys.titleLarge}
              styles={addCustomTokenStyle.headerTitle}
            />
            <AppText
              titleWithI18n={LanguageKey.add_custom_token_header_subtitle}
              variant={TextVariantKeys.bodyMSmall}
              styles={addCustomTokenStyle.headerSubtitle}
            />
          </View>
          <View style={addCustomTokenStyle.headerSpacer} />
        </View>

        {/* Form Body */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={addCustomTokenStyle.flex1}
        >
          <ScrollView
            style={addCustomTokenStyle.flex1}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Warning Card */}
            <View style={addCustomTokenStyle.warningCard}>
              <Ionicons name="information-circle" size={24} color="#5B63E4" />
              <AppText
                titleWithI18n={LanguageKey.add_custom_token_warning_text}
                variant={TextVariantKeys.bodyMSmall}
                styles={addCustomTokenStyle.warningText}
              />
            </View>

            {/* Contract Address Input */}
            <InputBox
              label="Địa chỉ hợp đồng"
              required
              leftIcon={<Ionicons name="document-text-outline" size={18} color="#5B63E4" />}
              placeholder={t(LanguageKey.nft_contract_address)}
              value={contractAddress}
              onChangeText={setContractAddress}
              rightAction={addressRightAction}
              onPressClose={handleClearData}
              styles={addCustomTokenStyle}
            />

            {error && (
              <View style={{ marginHorizontal: 20, marginTop: 4 }}>
                <AppText
                  titleWithI18n={LanguageKey.common_invalid_contract_address}
                  variant={TextVariantKeys.bodyRSmall}
                  textColor={theme.colors.outline_outine_brands}
                />
              </View>
            )}

            {/* Token Name Input */}
            <InputBox
              label="Tên token"
              required
              leftIcon={<Text style={addCustomTokenStyle.leftIconText}>T</Text>}
              placeholder="Nhập tên token"
              value={nameToken}
              onChangeText={setNameToken}
              editable={editable}
              styleTextInput={editable ? null : addCustomTokenStyle.disable}
              styles={addCustomTokenStyle}
            />

            {/* Token Symbol Input */}
            <InputBox
              label="Ký hiệu token"
              required
              leftIcon={<Text style={addCustomTokenStyle.leftIconText}>#</Text>}
              placeholder="Nhập ký hiệu token (ví dụ: USDT)"
              value={symbolToken}
              onChangeText={setSymbolToken}
              editable={editable}
              styleTextInput={editable ? null : addCustomTokenStyle.disable}
              styles={addCustomTokenStyle}
            />

            {/* Token Decimals Input */}
            <InputBox
              label="Số thập phân"
              required
              leftIcon={<Text style={addCustomTokenStyle.leftIconText}>0</Text>}
              placeholder="Nhập số thập phân (ví dụ: 18)"
              value={decimalsToken}
              onChangeText={setDecimalsToken}
              keyboardType="numeric"
              editable={editable}
              styleTextInput={editable ? null : addCustomTokenStyle.disable}
              styles={addCustomTokenStyle}
            />

            {/* Help Card */}
            <View style={addCustomTokenStyle.helpCard}>
              <Ionicons name="bulb-outline" size={24} color="#5B63E4" />
              <View style={addCustomTokenStyle.helpTextContainer}>
                <AppText
                  titleWithI18n={LanguageKey.add_custom_token_help_title}
                  variant={TextVariantKeys.bodyMSmall}
                  styles={addCustomTokenStyle.helpTitle}
                />
                <AppText
                  titleWithI18n={LanguageKey.add_custom_token_help_subtitle}
                  variant={TextVariantKeys.bodyMSmall}
                  styles={addCustomTokenStyle.helpSubtitle}
                />
              </View>
              <Ionicons name="chevron-forward" size={20} color="#7C8099" />
            </View>

            {/* Spacer */}
            <View style={{ flex: 1, minHeight: 20 }} />

            {/* Add Button */}
            <TouchableOpacity
              onPress={handleAddToken}
              disabled={isBtnDisabled}
              style={[
                addCustomTokenStyle.button,
                isBtnDisabled && addCustomTokenStyle.buttonDisabled,
              ]}
              activeOpacity={0.8}
            >
              <AppText
                titleWithI18n={LanguageKey.common_add}
                variant={TextVariantKeys.bodyMMedium}
                styles={addCustomTokenStyle.buttonText}
              />
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenWrapper>
  );
};
