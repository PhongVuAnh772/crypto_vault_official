import React from "react";
import { KeyboardAvoidingView, TouchableOpacity, View, TextInput as RNTextInput, Text } from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import { AppLoadingOpacity } from "src/components/common/AppLoadingOpacity";
import AppText from "src/components/common/AppText";
import AppImage from "src/components/common/AppImage";
import SendLoading from "src/components/homeComponents/SendLoading/sendLoading.view";
import { TokenLabel } from "src/components/homeComponents/TokenLabel";
import WalletAddressInput from "src/components/homeComponents/WalletAddressInput";
import RequirePinCodeLayout from "src/components/layout/RequirePinCode/requirePinCode.view";
import BottomSheetModalGorhom from "src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view";
import SendMaximumAmountComponent from "src/components/specific/SendMaximumAmountComponent";
import appColors from "src/core/constants/AppColors";
import { appImages } from "src/core/constants/AppImages";
import {
  InfoCircleSvgIcon,
  ArrowDownSvgIcon,
  Copy2SvgIcon,
  ScanSvgIcon,
  FeeSvgIcon,
  DangerSvgIcon,
  ClockUnFocusSvgIcon,
  ArrowRightSvgIcon,
} from "src/core/constants/AppIconsSvg";
import InputMode from "src/core/enum/InputMode";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  BottomSheetContentConfirmation,
  GivePermissionSpendToken,
} from "./send.evm.components";
import useSendEVM from "./send.evm.hook";
import useStyles from "./send.evm.style";

const SendTokenEVM: React.FC<RootNavigationType> = ({ navigation }) => {
  const theme = useAppTheme();

  const {
    handleCallBackScanQR,
    handleCopyToClipboard,
    onShowScanQRCamera,
    showScanQRCamera,
    handleOnClickContinue,
    isLoadingPage,
    tokenSelected,
    amountSend,
    error,
    handleSetMaxAmount,
    t,
    balanceShows,
    bottomSheetConfirmationRef,
    handleConfirmSend,
    recipientAddress,
    setRecipientAddress,
    amountShows,
    serviceFeeShows,
    walletShows,
    gasFeeShows,
    recipientAddressShow,
    logoShow,
    showAmountCurrency,
    showAmountCurrencyConfirm,
    sendMaximumShows,
    handleEnableButtonSend,
    onShowPinCode,
    handlePressSelectToken,
    bottomSheetApprove,
    handleOpenConfirmPinCode,
    handleCloseConfirmPinCode,
    handleCloseApprovePinCode,
    handleOpenApprovePinCode,
    gasFeeApproveShows,
    handleApproveToken,
    tokenAmountApproved,
    handleOnDismissBottomSheetApprove,
    handleSetAmountSend,
    totalAmount,
    onCloseBottomConfirm,
    onCloseBottomApprove,
    disableInput,
    onCloseScanQr,
    params,
    bottomSheetSendMaximum,
    onCloseBottomSheetSendMaximum,
    onOpenBottomSheetSendMaximum,
    isNative,
    insets,
  } = useSendEVM({
    navigation: navigation,
  });
  const styles = useStyles(theme, insets);
  return (
    <>
      <ScreenWrapper
        enableHeader
        paddingTop
        enableDismissKeyboard
        headerTitleWithI18n={LanguageKey.home_send_title}
        headerTextVariant={TextVariantKeys.titleLarge}
        backgroundColor="#08090C"
        headerTextColor="#FFFFFF"
        backButtonColor="#FFFFFF"
        onCloseScanQR={onCloseScanQr}
        showScanQRCamera={showScanQRCamera}
        callBackWhenScanQR={handleCallBackScanQR}
        iconRight={
          <TouchableOpacity onPress={() => {}}>
            <ClockUnFocusSvgIcon width={22} height={22} color="#FFFFFF" />
          </TouchableOpacity>
        }
      >
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <View style={[styles.flex1, styles.pH25]}>
            <AppLoadingOpacity
              secondView={<SendLoading />}
              isLoading={isLoadingPage.screen}
            >
              <>
                <TokenLabel
                  balance={balanceShows}
                  data={tokenSelected}
                  theme={theme}
                  onPress={handlePressSelectToken}
                  disable={!!params}
                />
                
                <WalletAddressInput
                  handleCopyToClipboard={handleCopyToClipboard}
                  onChangeText={setRecipientAddress}
                  scanQR={onShowScanQRCamera}
                  value={recipientAddress}
                  containerStyle={[styles.WalletInput]}
                  labelStyle={styles.labelWalletAddress}
                  labelPlaceholderTitle={LanguageKey.send_recipient_address_title}
                  editable={!disableInput}
                  showTo
                  showLabel={true}
                />
                
                {!!error.address && (
                  <AppText
                    title={error.address}
                    textColor={appColors.functional.warning}
                    styles={styles.mt5}
                  />
                )}

                <View style={[styles.mt15]}>
                  <AppText
                    title="Số lượng"
                    variant={TextVariantKeys.bodyRSmall}
                    styles={styles.labelWalletAddress}
                  />
                  <View style={styles.amountInputWrapper}>
                    <RNTextInput
                      placeholder="0.00"
                      placeholderTextColor="#4B4F68"
                      keyboardType="numeric"
                      onChangeText={handleSetAmountSend}
                      value={amountSend}
                      editable={!isLoadingPage.send && !disableInput}
                      style={styles.amountInput}
                    />
                    <TouchableOpacity
                      onPress={handlePressSelectToken}
                      disabled={!!params}
                      style={styles.tokenSelectorBadge}
                    >
                      <AppImage
                        uri={tokenSelected?.logo ?? ''}
                        styleImage={{ width: 18, height: 18, borderRadius: 9 }}
                        defaultImage={appImages.logo}
                      />
                      <Text style={styles.tokenBadgeText}>{tokenSelected?.symbol || "ETH"}</Text>
                      <ArrowDownSvgIcon width={12} height={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View
                  style={[
                    styles.mt10,
                    styles.flexRow,
                    styles.justifyContentBetween,
                    styles.alignItemsCenter,
                  ]}
                >
                  <AppText
                    title={`Khả dụng: ${balanceShows}`}
                    variant={TextVariantKeys.bodyMSmall}
                    textColor="#6C7A8A"
                  />
                  <TouchableOpacity onPress={handleSetMaxAmount}>
                    <AppText
                      title="GỬI TỐI ĐA"
                      variant={TextVariantKeys.bodyMSmall}
                      textColor="#8F9CFE"
                      styles={styles.fontWeightBold}
                    />
                  </TouchableOpacity>
                </View>

                {/* Fee Section */}
                <View style={styles.feeCard}>
                  <View style={styles.feeIconWrapper}>
                    <FeeSvgIcon width={20} height={20} color="#8F9CFE" />
                  </View>
                  <View style={styles.flex1}>
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                      <AppText
                        title="Phí mạng ước tính"
                        variant={TextVariantKeys.bodyMSmall}
                        textColor="#A6B0C0"
                      />
                      <InfoCircleSvgIcon width={12} height={12} color="#A6B0C0" style={styles.mL5} />
                    </View>
                    <AppText
                      title={`~${gasFeeShows || '0.00021 ETH'}`}
                      variant={TextVariantKeys.titleSmall}
                      textColor="#FFFFFF"
                      styles={styles.mt5}
                    />
                  </View>
                  <AppText
                    title={serviceFeeShows || '≈ $0.72'}
                    variant={TextVariantKeys.bodyMSmall}
                    textColor="#A6B0C0"
                  />
                  <ArrowRightSvgIcon width={16} height={16} color="#8F9CFE" style={styles.mL10} />
                </View>

                {/* Error Banner */}
                {!!error.amount && (
                  <View style={styles.warningBanner}>
                    <DangerSvgIcon width={24} height={24} color="#E1251B" />
                    <View style={styles.warningTextContainer}>
                      <AppText
                        title="Số dư không đủ"
                        variant={TextVariantKeys.titleSmall}
                        textColor="#E1251B"
                        styles={styles.fontWeightBold}
                      />
                      <AppText
                        title={error.amount}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor="#A6B0C0"
                        styles={styles.mt5}
                      />
                    </View>
                  </View>
                )}
              </>
            </AppLoadingOpacity>
          </View>
          <View style={styles.newButton}>
            <AppButton
              onPress={handleOnClickContinue}
              titleWithI18n={LanguageKey.common_text_continue}
              textVariant={TextVariantKeys.bodyMMedium}
              textColor={appColors.neutral.white}
              styles={styles.button}
              isLoading={isLoadingPage.send}
              disabled={handleEnableButtonSend}
            />
          </View>
        </KeyboardAvoidingView>

        <BottomSheetModalGorhom
          refModal={bottomSheetApprove}
          snapPoints={["70"]}
          pressBehavior="none"
          onDismiss={handleOnDismissBottomSheetApprove}
          enablePanDownToClose={false}
        >
          <GivePermissionSpendToken
            disable={isLoadingPage.send}
            estimateGas={gasFeeApproveShows}
            handleConfirm={handleOpenApprovePinCode}
            isLoading={isLoadingPage.send}
            theme={theme}
            sendAmount={tokenAmountApproved}
            commissionAmount={serviceFeeShows}
            tokenName={tokenSelected?.name || ""}
            totalAmount={totalAmount}
            onClose={onCloseBottomApprove}
          />
        </BottomSheetModalGorhom>
        <BottomSheetModalGorhom
          refModal={bottomSheetConfirmationRef}
          pressBehavior="none"
          enablePanDownToClose={false}
        >
          <BottomSheetContentConfirmation
            amount={amountShows}
            amountFollowCurrency={showAmountCurrencyConfirm}
            estimateGas={gasFeeShows}
            logo={logoShow}
            recipient={recipientAddressShow}
            sender={walletShows}
            serviceFee={serviceFeeShows}
            theme={theme}
            isLoading={isLoadingPage.send}
            handleConfirm={handleOpenConfirmPinCode}
            totalAmount={totalAmount}
            onClose={onCloseBottomConfirm}
            disable={isLoadingPage.send}
          />
        </BottomSheetModalGorhom>
        <BottomSheetModalGorhom
          refModal={bottomSheetSendMaximum}
          snapPoints={["45"]}
        >
          <SendMaximumAmountComponent onPress={onCloseBottomSheetSendMaximum} />
        </BottomSheetModalGorhom>
      </ScreenWrapper>
      <RequirePinCodeLayout
        onClose={handleCloseConfirmPinCode}
        visible={onShowPinCode.confirm}
        continueActionAfterPassPinCode={handleConfirmSend}
      />
      <RequirePinCodeLayout
        onClose={handleCloseApprovePinCode}
        visible={onShowPinCode.approve}
        continueActionAfterPassPinCode={handleApproveToken}
      />
    </>
  );
};

export default SendTokenEVM;
