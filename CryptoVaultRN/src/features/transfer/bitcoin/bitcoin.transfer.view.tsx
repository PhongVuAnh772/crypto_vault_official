import React from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Modal,
  TouchableOpacity,
  View,
  TextInput as RNTextInput,
  Text,
} from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import { AppLoadingOpacity } from "src/components/common/AppLoadingOpacity";
import AppModal from "src/components/common/AppModal";
import AppText from "src/components/common/AppText";
import { TokenLabel } from "src/components/homeComponents/TokenLabel";
import ConfirmView from "src/components/homeComponents/ConfirmView";
import { useProtocolSelected } from "src/core/redux/slice/account.selector";
import { appImages } from "src/core/constants/AppImages";
import AppImage from "src/components/common/AppImage";
import SendLoading from "src/components/homeComponents/SendLoading/sendLoading.view";
import WalletAddressInput from "src/components/homeComponents/WalletAddressInput";
import RequirePinCodeLayout from "src/components/layout/RequirePinCode/requirePinCode.view";
import BottomSheetModal from "src/components/specific/BottomSheetModal/BottomSheetModal.view";
import appColors from "src/core/constants/AppColors";
import { DangerSvgIcon, ScanSvgIcon, ArrowDownSvgIcon, ClockUnFocusSvgIcon } from "src/core/constants/AppIconsSvg";
import InputMode from "src/core/enum/InputMode";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import Utils from "src/core/utils/commonUtils";
import WalletUtils from "src/core/utils/walletUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { useBitcoinTransfer } from "./bitcoin.transfer.hook";
import useStyles from "./bitcoin.transfer.styles";

const TransferBitcoinComponent: React.FC<
  RootNavigationType & {
    isFromHome?: boolean;
  }
> = ({ navigation, isFromHome }) => {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const protocolBaseData = useProtocolSelected();

  const {
    coinType,
    balanceTitle,
    adminFee,
    subAdminFee,
    networkFee,
    subNetworkFee,
    fromAddress,
    onToAddressChange,
    clearToAddress,
    toAddress,
    handleCopyToClipboard,
    maxAmountTitle,
    onAmountSendChangeText,
    amountSend,
    fromAmount,
    fromSubAmount,
    createTransactionAction,
    coinDataLoading,
    maxAmountLoading,
    confirmAction,
    isLoadingPushTransaction,
    disableContinue,
    maxAction,
    inputAmountError,
    showModal,
    onClose,
    toAddressFocus,
    onToAddressFocus,
    onToAddressBlur,
    onScanQR,
    showScanQRCamera,
    isPushTransactionFailure,
    onClosePushTransactionFailureModal,
    showDustError,
    errorNetworkFeeHigh,
    toAddressError,
    balanceCurrencyString,
    isLoading,
    errorSubTitle,
    insets,
    errorHash,
    openErrorHashLink,
    pushBitcoinHashErrorExists,
    pushBitcoinHashErrorDust,
    onModalConfirmDismiss,
    requirePinCode,
    closeRequirePinCode,
    continueActionAfterPassPinCode,
    handleCallBackScanQR,
    onCloseScanQR,
    inputRecipientAddress,
  } = useBitcoinTransfer({ navigation });
  const styles = useStyles(theme, insets);

  return (
    <ScreenWrapper
      enableDismissKeyboard
      enableHeader
      headerTitleWithI18n={LanguageKey.home_send_title}
      headerTextVariant={TextVariantKeys.titleLarge}
      paddingTop
      callBackWhenScanQR={handleCallBackScanQR}
      showScanQRCamera={showScanQRCamera}
      onCloseScanQR={onCloseScanQR}
      backgroundColor="#08090C"
      headerTextColor="#FFFFFF"
      backButtonColor="#FFFFFF"
      iconRight={
        <TouchableOpacity onPress={() => {}}>
          <ClockUnFocusSvgIcon width={22} height={22} color="#FFFFFF" />
        </TouchableOpacity>
      }
    >
      <KeyboardAvoidingView
        style={styles.container}
        keyboardVerticalOffset={insets.bottom}
        behavior={Utils.isIos ? "padding" : "height"}
      >
        <BottomSheetModal
          showModal={showModal}
          onDismiss={onModalConfirmDismiss}
          closeModalAction={onClose}
          child={
            <>
              <ConfirmView
                coinType={coinType}
                fromAddress={fromAddress}
                fromAmount={fromAmount}
                fromSubAmount={fromSubAmount}
                toAddress={WalletUtils.getShortAddress(toAddress)}
                networkFee={networkFee}
                subNetworkFee={subNetworkFee}
                adminFee={adminFee}
                subAdminFee={subAdminFee}
              />
              <Modal visible={requirePinCode}>
                <RequirePinCodeLayout
                  visible={requirePinCode}
                  onClose={closeRequirePinCode}
                  continueActionAfterPassPinCode={
                    continueActionAfterPassPinCode
                  }
                />
              </Modal>
            </>
          }
          bottomChild={
            <AppButton
              onPress={() => {
                confirmAction();
              }}
              titleWithI18n={LanguageKey.home_send_title}
              styles={styles.button}
              textVariant={TextVariantKeys.titleSmall}
              textColor={appColors.neutral.white}
            />
          }
        />

        <AppModal
          titleWithI18n={errorSubTitle.titleWithI18N}
          subTitleWithI18n={errorSubTitle.subTitleWithI18N}
          subTitle={errorSubTitle.subTitle}
          visible={isPushTransactionFailure}
          onPress={onClosePushTransactionFailureModal}
          onTouchOutside={onClosePushTransactionFailureModal}
          buttonTitleWithI18n={LanguageKey.common_text_ok}
          keepBottomButton
          titleVariant={TextVariantKeys.titleMedium}
          footerView={
            errorHash &&
            (pushBitcoinHashErrorExists || pushBitcoinHashErrorDust) && (
              <TouchableOpacity
                onPress={openErrorHashLink}
                style={[appStyles.pB20]}
              >
                <AppText
                  title={errorHash}
                  numberOfLines={1}
                  textColor={theme.colors.surface_surface_brand}
                  styles={styles.hashLink}
                />
              </TouchableOpacity>
            )
          }
          icon={<DangerSvgIcon />}
        />
        <AppLoadingOpacity
          secondView={
            <View style={[appStyles.pH25, appStyles.pT15]}>
              <SendLoading />
            </View>
          }
          isLoading={coinDataLoading || maxAmountLoading}
        >
          <View style={[appStyles.justifyContentBetween, appStyles.flex1]}>
            <View>
              <View style={[appStyles.pH25, appStyles.pT15]}>
                <TokenLabel
                  balance={balanceTitle}
                  data={protocolBaseData}
                  theme={theme}
                  onPress={() => {}}
                  disable={true}
                />
              </View>
              <WalletAddressInput
                handleCopyToClipboard={handleCopyToClipboard}
                onChangeText={onToAddressChange}
                scanQR={onScanQR}
                value={
                  toAddressFocus
                    ? toAddress
                    : WalletUtils.getShortAddress(toAddress)
                }
                containerStyle={[styles.inputAddressContainer, { marginHorizontal: 20 }]}
                labelStyle={{ marginHorizontal: 20 }}
                labelPlaceholderTitle={LanguageKey.send_recipient_address_title}
                editable={!isLoading}
                showTo
                showLabel={true}
                onPressClose={clearToAddress}
              />
              {toAddressError && (
                <View style={[appStyles.mh25, appStyles.mt5]}>
                  <AppText
                    titleWithI18n={LanguageKey.send_input_to_address_error}
                    variant={TextVariantKeys.bodyMSmall}
                    textColor={appColors.functional.warning}
                  />
                </View>
              )}
            </View>
            {inputRecipientAddress && (
              <>
                <View style={[appStyles.mh25, appStyles.mt15]}>
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
                      onChangeText={onAmountSendChangeText}
                      value={amountSend}
                      editable={!isLoading}
                      style={styles.amountInput}
                    />
                    <TouchableOpacity
                      onPress={() => {}}
                      disabled={true}
                      style={styles.tokenSelectorBadge}
                    >
                      <AppImage
                        uri={protocolBaseData?.logo ?? ''}
                        styleImage={{ width: 18, height: 18, borderRadius: 9 }}
                        defaultImage={appImages.logo}
                      />
                      <Text style={styles.tokenBadgeText}>{protocolBaseData?.symbol || "BTC"}</Text>
                      <ArrowDownSvgIcon width={12} height={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View
                  style={[
                    appStyles.mt10,
                    appStyles.mh25,
                    appStyles.flexRow,
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                  ]}
                >
                  <AppText
                    title={`Khả dụng: ${fromAmount} ${fromSubAmount}`}
                    variant={TextVariantKeys.bodyMSmall}
                    textColor="#6C7A8A"
                  />
                  <TouchableOpacity onPress={maxAction}>
                    <AppText
                      title="GỬI TỐI ĐA"
                      variant={TextVariantKeys.bodyMSmall}
                      textColor="#8F9CFE"
                      styles={appStyles.fontWeightBold}
                    />
                  </TouchableOpacity>
                </View>

                {inputAmountError ? (
                  <View style={[appStyles.pT10, appStyles.mh25]}>
                    <AppText
                      titleWithI18n={LanguageKey.send_input_error}
                      variant={TextVariantKeys.bodyMSmall}
                      textColor={appColors.functional.warning}
                    />
                  </View>
                ) : null}

                {errorNetworkFeeHigh ? (
                  <View style={[appStyles.pT10, appStyles.mh25]}>
                    <AppText
                      titleWithI18n={LanguageKey.send_input_error_2}
                      variant={TextVariantKeys.bodyMSmall}
                      textColor={appColors.functional.warning}
                    />
                  </View>
                ) : null}

                {showDustError ? (
                  <View style={styles.warningBanner}>
                    <DangerSvgIcon width={24} height={24} color="#E1251B" />
                    <View style={styles.warningTextContainer}>
                      <AppText
                        titleWithI18n={LanguageKey.send_dust_error_title}
                        variant={TextVariantKeys.bodyMLarge}
                        textColor="#E1251B"
                        styles={appStyles.fontWeightBold}
                      />
                      <AppText
                        titleWithI18n={LanguageKey.send_dust_error_sub_title}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor="#A6B0C0"
                        styles={appStyles.mt5}
                      />
                      <AppText
                        titleWithI18n={LanguageKey.send_dust_error_sub_title_2}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor="#A6B0C0"
                        styles={appStyles.mt5}
                      />
                    </View>
                  </View>
                ) : null}
              </>
            )}
            <View style={styles.newButton}>
              <AppButton
                isLoading={isLoadingPushTransaction}
                disabled={disableContinue}
                onPress={createTransactionAction}
                titleWithI18n={LanguageKey.common_text_continue}
                styles={styles.button}
                textVariant={TextVariantKeys.titleSmall}
                textColor={appColors.neutral.white}
              />
            </View>
          </View>
        </AppLoadingOpacity>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default TransferBitcoinComponent;
