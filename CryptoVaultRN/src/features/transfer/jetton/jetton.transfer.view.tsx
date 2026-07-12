import React from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, TouchableOpacity, View, TextInput as RNTextInput, Text } from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import { AppLoadingOpacity } from "src/components/common/AppLoadingOpacity";
import AppModal from "src/components/common/AppModal";
import AppSkeleton from "src/components/common/AppSkeleton";
import AppText from "src/components/common/AppText";
import CoinWidgets from "src/components/homeComponents/CoinWidgets";
import ConfirmView from "src/components/homeComponents/ConfirmView";
import SendLoading from "src/components/homeComponents/SendLoading/sendLoading.view";
import WalletAddressInput from "src/components/homeComponents/WalletAddressInput";
import RequirePinCodeLayout from "src/components/layout/RequirePinCode/requirePinCode.view";
import BottomSheetModal from "src/components/specific/BottomSheetModal/BottomSheetModal.view";
import BottomSheetModalGorhom from "src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view";
import SendMaximumAmountComponent from "src/components/specific/SendMaximumAmountComponent";
import appColors from "src/core/constants/AppColors";
import {
  DangerSvgIcon,
  InfoCircleSvgIcon,
  ScanSvgIcon,
  ArrowDownSvgIcon,
  ClockUnFocusSvgIcon,
} from "src/core/constants/AppIconsSvg";
import InputMode from "src/core/enum/InputMode";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import Utils from "src/core/utils/commonUtils";
import WalletUtils from "src/core/utils/walletUtils";
import { HomeStackScreenKey } from "src/navigation/enum/NavigationKey";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import useJettonTransfer from "./jetton.transfer.hook";
import useStyles from "./jetton.transfer.styles";

interface TransferJettonComponentProps extends RootNavigationType {
  isFromHome?: boolean;
}

const TransferJettonComponent: React.FC<TransferJettonComponentProps> = ({
  navigation,
  isFromHome,
}) => {
  const { t } = useTranslation();
  const theme = useAppTheme();

  const {
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
    jettonDataLoading,
    confirmAction,
    disableContinue,
    maxAction,
    inputAmountError,
    transferLoading,
    showModalConfirmBounceable,
    hideModalConfirmBounceable,
    continueActionAfterConfirm,
    showModalConfirm,
    onClose,
    toAddressFocus,
    onToAddressFocus,
    onToAddressBlur,
    onScanQR,
    showScanQRCamera,
    toAddressError,
    balanceCurrencyString,
    insets,
    onModalConfirmDismiss,
    requirePinCode,
    closeRequirePinCode,
    continueActionAfterPassPinCode,
    openNonBounceableMessageLink,
    bottomSheetSendMaximum,
    onCloseBottomSheetSendMaximum,
    onOpenBottomSheetSendMaximum,
    memo,
    setMemo,
    inputRecipientAddress,
    inputAmountRef,
    getMaxAmountLoading,
    logoUri,
    tokenName,
    errorTransaction,
    handleCallBackScanQR,
    onCloseScanQr,
    tokenSymbol,
    isRequireMemo,
    contentHeight,
    keyboardOpen,
    onInputAmountFocus,
    onInputAmountBlur,
    onMemoFocus,
    onMemoBlur,
  } = useJettonTransfer({ navigation });
  const styles = useStyles(theme, insets);
  return (
    <>
      <ScreenWrapper
        enableDismissKeyboard
        enableHeader
        headerTitleWithI18n={LanguageKey.home_send_title}
        headerTextVariant={TextVariantKeys.titleLarge}
        paddingTop
        backgroundColor="#08090C"
        headerTextColor="#FFFFFF"
        backButtonColor="#FFFFFF"
        callBackWhenScanQR={handleCallBackScanQR}
        onCloseScanQR={onCloseScanQr}
        showScanQRCamera={showScanQRCamera}
        iconRight={
          <TouchableOpacity onPress={() => {}}>
            <ClockUnFocusSvgIcon width={22} height={22} color="#FFFFFF" />
          </TouchableOpacity>
        }
      >
        <BottomSheetModal
          showModal={showModalConfirm}
          onDismiss={onModalConfirmDismiss}
          closeModalAction={onClose}
          child={
            <ConfirmView
              logoUri={logoUri}
              fromAddress={fromAddress}
              fromAmount={fromAmount}
              fromSubAmount={fromSubAmount}
              toAddress={WalletUtils.getShortAddress(toAddress)}
              networkFee={networkFee}
              subNetworkFee={subNetworkFee}
              adminFee={adminFee}
              subAdminFee={subAdminFee}
            />
          }
          bottomChild={
            <AppButton
              onPress={confirmAction}
              titleWithI18n={LanguageKey.home_send_title}
              styles={styles.button}
              textVariant={TextVariantKeys.titleSmall}
              textColor={appColors.neutral.white}
            />
          }
        />

        <AppModal
          titleWithI18n={LanguageKey.ton_bounceable_action_title}
          subTitleWithI18n={LanguageKey.ton_bounceable_action_sub_title_1}
          subTitleWithI18n2={LanguageKey.ton_bounceable_action_sub_title_2}
          visible={showModalConfirmBounceable}
          onPress={continueActionAfterConfirm}
          buttonTitleWithI18n={LanguageKey.understand_continue}
          onPress2={hideModalConfirmBounceable}
          twoOptionsVertical={true}
          buttonTitleWithI18n2={LanguageKey.cancel}
          button2Styles={styles.buttonCancel}
          textButtonSecondColor={theme.colors.text_on_surface_text_brand_2}
          footerView={
            <View style={[appStyles.pB15]}>
              <AppText
                titleWithI18n={LanguageKey.ton_bounceable_action_hyper_link}
                variant={TextVariantKeys.bodyMSmall}
                styles={styles.textUnderline}
                textColor={theme.colors.text_on_surface_text_brand_2}
                onPress={openNonBounceableMessageLink}
              />
            </View>
          }
          icon={<DangerSvgIcon />}
        />
        <KeyboardAvoidingView style={styles.container} behavior={"padding"}>
          <AppLoadingOpacity
            isLoading={jettonDataLoading}
            secondView={
              <View style={[appStyles.pH25, appStyles.pT15]}>
                <SendLoading />
              </View>
            }
          >
            <View style={[appStyles.flex1, appStyles.justifyContentBetween]}>
              <View>
                <View style={[appStyles.pH25, appStyles.pT15]}>
                  <CoinWidgets
                    name={tokenName}
                    logoUri={logoUri}
                    balanceTitle={balanceTitle}
                    isLoading={jettonDataLoading}
                    action={() => {
                      navigation.navigate(HomeStackScreenKey.SelectToken);
                    }}
                    hideAction={!isFromHome}
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
                    editable={!transferLoading}
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
                          ref={inputAmountRef}
                          placeholder="0.00"
                          placeholderTextColor="#4B4F68"
                          keyboardType="numeric"
                          onChangeText={onAmountSendChangeText}
                          value={amountSend}
                          editable={!transferLoading && !getMaxAmountLoading}
                          style={styles.amountInput}
                        />
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate(HomeStackScreenKey.SelectToken);
                          }}
                          disabled={!isFromHome}
                          style={styles.tokenSelectorBadge}
                        >
                          <Text style={styles.tokenBadgeText}>{tokenSymbol}</Text>
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
                        title={`Khả dụng: ${balanceShows}`}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor="#6C7A8A"
                      />
                      <TouchableOpacity onPress={onOpenBottomSheetSendMaximum}>
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

                    {/* Memo Field */}
                    <View style={[appStyles.mh25, appStyles.mt15]}>
                      <AppText
                        titleWithI18n={LanguageKey.send_memo_title}
                        variant={TextVariantKeys.bodyRSmall}
                        styles={styles.labelWalletAddress}
                      />
                      <View style={styles.amountInputWrapper}>
                        <RNTextInput
                          placeholder="Memo (Tùy chọn)"
                          placeholderTextColor="#4B4F68"
                          onChangeText={setMemo}
                          value={memo}
                          editable={!transferLoading}
                          style={styles.amountInput}
                        />
                      </View>
                    </View>

                    {isRequireMemo ? (
                      <View style={styles.warningBanner}>
                        <DangerSvgIcon width={24} height={24} color="#E1251B" />
                        <View style={styles.warningTextContainer}>
                          <AppText
                            title="Yêu cầu Memo"
                            variant={TextVariantKeys.titleSmall}
                            textColor="#E1251B"
                            styles={appStyles.fontWeightBold}
                          />
                          <AppText
                            titleWithI18n={LanguageKey.error_require_memo}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor="#A6B0C0"
                            styles={appStyles.mt5}
                          />
                        </View>
                      </View>
                    ) : null}

                    {errorTransaction ? (
                      <View style={styles.warningBanner}>
                        <DangerSvgIcon width={24} height={24} color="#E1251B" />
                        <View style={styles.warningTextContainer}>
                          <AppText
                            title="Lỗi giao dịch"
                            variant={TextVariantKeys.titleSmall}
                            textColor="#E1251B"
                            styles={appStyles.fontWeightBold}
                          />
                          <AppText
                            titleWithI18n={errorTransaction}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor="#A6B0C0"
                            styles={appStyles.mt5}
                          />
                        </View>
                      </View>
                    ) : null}
                  </>
                )}
              </View>
            <View style={styles.newButton}>
              <AppButton
                isLoading={transferLoading}
                disabled={disableContinue}
                onPress={createTransactionAction}
                titleWithI18n={LanguageKey.common_text_continue}
                styles={styles.button}
                textVariant={TextVariantKeys.titleSmall}
                textColor={appColors.neutral.white}
              />
            </View>
          </AppLoadingOpacity>
        </KeyboardAvoidingView>
      </ScreenWrapper>

      <RequirePinCodeLayout
        visible={requirePinCode}
        onClose={closeRequirePinCode}
        continueActionAfterPassPinCode={continueActionAfterPassPinCode}
      />

      <BottomSheetModalGorhom
        refModal={bottomSheetSendMaximum}
        snapPoints={["45"]}
      >
        <SendMaximumAmountComponent onPress={onCloseBottomSheetSendMaximum} />
      </BottomSheetModalGorhom>
    </>
  );
};

export default TransferJettonComponent;
