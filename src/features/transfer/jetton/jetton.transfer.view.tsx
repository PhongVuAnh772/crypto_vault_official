import React from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import { AppLoadingOpacity } from "src/components/common/AppLoadingOpacity";
import AppModal from "src/components/common/AppModal";
import AppSkeleton from "src/components/common/AppSkeleton";
import AppText from "src/components/common/AppText";
import CoinWidgets from "src/components/homeComponents/CoinWidgets";
import ConfirmView from "src/components/homeComponents/ConfirmView";
import SendLoading from "src/components/homeComponents/SendLoading/sendLoading.view";
import RequirePinCodeLayout from "src/components/layout/RequirePinCode/requirePinCode.view";
import BottomSheetModal from "src/components/specific/BottomSheetModal/BottomSheetModal.view";
import BottomSheetModalGorhom from "src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view";
import SendMaximumAmountComponent from "src/components/specific/SendMaximumAmountComponent";
import appColors from "src/core/constants/AppColors";
import {
  DangerSvgIcon,
  InfoCircleSvgIcon,
  ScanSvgIcon,
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
        backgroundColor={theme.colors.surface_surface_default}
        callBackWhenScanQR={handleCallBackScanQR}
        onCloseScanQR={onCloseScanQr}
        showScanQRCamera={showScanQRCamera}
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
                <View style={appStyles.pV30}>
                  <View
                    style={[
                      appStyles.flexRow,
                      appStyles.alignItemsCenter,
                      appStyles.pH25,
                    ]}
                  >
                    <View style={styles.textTo}>
                      <AppText
                        titleWithI18n={LanguageKey.common_text_to}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor={appColors.neutral.n600}
                      />
                    </View>
                    <View style={appStyles.flex1}>
                      <TextInput
                        dense={false}
                        autoCorrect={false}
                        autoCapitalize="none"
                        autoComplete="off"
                        importantForAutofill="no"
                        spellCheck={false}
                        readOnly={transferLoading}
                        onFocus={onToAddressFocus}
                        onBlur={onToAddressBlur}
                        numberOfLines={1}
                        onChangeText={onToAddressChange}
                        value={
                          toAddressFocus
                            ? toAddress
                            : WalletUtils.getShortAddress(toAddress)
                        }
                        mode={InputMode.outlined}
                        outlineColor={theme.colors.surface_surface_default}
                        activeOutlineColor={
                          theme.colors.surface_surface_default
                        }
                        placeholder={t(
                          LanguageKey.send_recipient_address_title
                        )}
                        selectionColor={appColors.neutral.black}
                        cursorColor={appColors.neutral.black}
                        style={[styles.inputAddressContainer]}
                        contentStyle={styles.inputAddressContent}
                        right={
                          toAddress.length > 0 ? (
                            <TextInput.Icon
                              icon={"close"}
                              onPress={clearToAddress}
                              color={theme.colors.text_on_surface_text_light}
                              size={20}
                            />
                          ) : null
                        }
                      />
                    </View>
                    <AppButton
                      onPress={handleCopyToClipboard}
                      titleWithI18n={LanguageKey.common_text_paste}
                      textVariant={TextVariantKeys.bodyMMedium}
                      textColor={appColors.main.tokyoRed}
                    />
                    <TouchableOpacity
                      style={styles.scanIcon}
                      onPress={onScanQR}
                    >
                      <ScanSvgIcon />
                    </TouchableOpacity>
                  </View>
                  {toAddressError && (
                    <View style={[appStyles.mh25]}>
                      <AppText
                        titleWithI18n={LanguageKey.send_input_to_address_error}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor={appColors.main.tokyoRed}
                      />
                    </View>
                  )}
                </View>
                {inputRecipientAddress && (
                  <>
                    <View
                      style={[
                        appStyles.mh25,
                        appStyles.mbt5,
                        appStyles.flexRow,
                        appStyles.justifyContentBetween,
                      ]}
                    >
                      <AppText
                        titleWithI18n={LanguageKey.send_enter_amount_title}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor={appColors.neutral.n600}
                      />
                      {getMaxAmountLoading ? (
                        <AppSkeleton width={100} height={30} />
                      ) : (
                        <TouchableOpacity
                          style={[appStyles.flexRow, appStyles.center]}
                          onPress={onOpenBottomSheetSendMaximum}
                        >
                          <AppText
                            titleWithI18n={LanguageKey.send_send_maximum_title}
                            variant={TextVariantKeys.bodyMSmall}
                            textColor={appColors.main.tokyoRed}
                          />
                          {getMaxAmountLoading ? (
                            <AppSkeleton width={70} height={20} />
                          ) : (
                            <AppText
                              title={maxAmountTitle}
                              textColor={appColors.main.tokyoRed}
                            />
                          )}
                          <View style={[appStyles.ml5]}>
                            <InfoCircleSvgIcon
                              height={18}
                              width={18}
                              color={appColors.main.tokyoRed}
                            />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={[appStyles.pH25, appStyles.flexRow]}>
                      <TextInput
                        ref={inputAmountRef}
                        readOnly={transferLoading || getMaxAmountLoading}
                        onFocus={onInputAmountFocus}
                        onBlur={onInputAmountBlur}
                        keyboardType="numeric"
                        dense={false}
                        onChangeText={onAmountSendChangeText}
                        clearButtonMode="while-editing"
                        value={amountSend}
                        mode={InputMode.outlined}
                        outlineColor={theme.colors.surface_surface_high}
                        activeOutlineColor={theme.colors.surface_surface_high}
                        selectionColor={appColors.neutral.black}
                        cursorColor={appColors.neutral.black}
                        outlineStyle={styles.inputAmountOutline}
                        textColor={
                          inputAmountError
                            ? appColors.main.tokyoRed
                            : theme.colors.text_on_surface_text_high
                        }
                        style={[
                          styles.inputAmountContainer,
                          {
                            ...theme.fonts.titleSmall,
                          },
                        ]}
                      />
                      <View style={styles.currencyText}>
                        <AppButton
                          titleWithI18n={LanguageKey.common_text_max}
                          textVariant={TextVariantKeys.titleMedium}
                          textColor={appColors.main.tokyoRed}
                          onPress={maxAction}
                        />
                      </View>
                      <View style={[styles.currencyText, appStyles.pR15]}>
                        <AppText
                          title={tokenSymbol}
                          variant={TextVariantKeys.titleMedium}
                          textColor={theme.colors.text_on_surface_text_high}
                        />
                      </View>
                    </View>
                    {balanceCurrencyString ? (
                      <View style={[appStyles.pT10, appStyles.mh25]}>
                        <AppText
                          title={balanceCurrencyString}
                          variant={TextVariantKeys.bodyMMedium}
                          textColor={theme.colors.text_on_surface_text_high}
                        />
                      </View>
                    ) : null}

                    {inputAmountError ? (
                      <View style={[appStyles.pT10, appStyles.mh25]}>
                        <AppText
                          titleWithI18n={LanguageKey.send_input_error}
                          variant={TextVariantKeys.bodyMSmall}
                          textColor={appColors.main.tokyoRed}
                        />
                      </View>
                    ) : null}
                    <View
                      style={[
                        appStyles.mh25,
                        appStyles.mt15,
                        appStyles.mbt5,
                        appStyles.flexRow,
                        appStyles.justifyContentBetween,
                      ]}
                    >
                      <AppText
                        titleWithI18n={LanguageKey.send_memo_title}
                        variant={TextVariantKeys.bodyMSmall}
                        textColor={appColors.neutral.n600}
                      />
                    </View>
                    <View style={[appStyles.pH25, appStyles.flexRow]}>
                      <TextInput
                        readOnly={transferLoading}
                        onFocus={onMemoFocus}
                        onBlur={onMemoBlur}
                        dense={false}
                        autoCorrect={false}
                        autoCapitalize="none"
                        autoComplete="off"
                        importantForAutofill="no"
                        spellCheck={false}
                        keyboardType={
                          Utils.isAndroid ? "visible-password" : "default"
                        }
                        onChangeText={setMemo}
                        clearButtonMode="while-editing"
                        value={memo}
                        mode={InputMode.outlined}
                        outlineColor={theme.colors.surface_surface_high}
                        activeOutlineColor={theme.colors.surface_surface_high}
                        selectionColor={appColors.neutral.black}
                        cursorColor={appColors.neutral.black}
                        outlineStyle={styles.inputAmountOutline}
                        textColor={theme.colors.text_on_surface_text_high}
                        style={[
                          styles.inputAmountContainer,
                          {
                            ...theme.fonts.titleSmall,
                          },
                        ]}
                      />
                    </View>
                    {isRequireMemo ? (
                      <View style={[appStyles.pT10, appStyles.mh25]}>
                        <AppText
                          titleWithI18n={LanguageKey.error_require_memo}
                          variant={TextVariantKeys.bodyMSmall}
                          textColor={appColors.functional.pending}
                        />
                      </View>
                    ) : null}
                    {errorTransaction ? (
                      <View style={[appStyles.pT10, appStyles.mh25]}>
                        <AppText
                          titleWithI18n={errorTransaction}
                          variant={TextVariantKeys.bodyMSmall}
                          textColor={appColors.main.tokyoRed}
                        />
                      </View>
                    ) : null}
                  </>
                )}
              </View>
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
