import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import {
  ArrowForward2SvgIcon,
  PendingSvgIcon,
  SuccessSvgIcon,
} from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import {
  TransactionStatusType,
  TransactionType,
} from "src/core/enum/TransactionType";
import AppI18Next from "src/core/locales";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import DateTimeUtils from "src/core/utils/dateTimeUtils";
import WalletUtils from "src/core/utils/walletUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  DefaultView,
  DetailRow,
  LoadingTransactionDetails,
} from "./transactionDetails.components";
import useTransactionDetails from "./transactionDetails.hook";
import useStyles from "./transactionDetails.styles";

const TransactionDetails: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    theme,
    transactionData,
    isSent,
    status,
    fee,
    adminFee,
    amountSend,
    convertTitle,
    onViewOnScan,
    backAction,
    copyAction,
    isSendEVMNFT,
    isEVM,
    isSuccess,
    isTonNFTTransfer,
    isReceiveTonNFT,
    totalAmountDisplay,
    currentWallet,
    insets,
    loading,
    tonNFTMetadata,
    networkFeeTon,
    isTransactionCallSmartContract,
    isCommonTransactionSmartContract,
  } = useTransactionDetails({ navigation });
  const styles = useStyles(theme, insets);
  const getIcon = () => {
    switch (status) {
      case TransactionStatusType.Completed:
        return <SuccessSvgIcon color={appColors.functional.success} />;
      case TransactionStatusType.Pending:
        return <PendingSvgIcon color={appColors.functional.pending} />;
      case TransactionStatusType.Failed:
        return <PendingSvgIcon color={appColors.functional.warning} />;
      default:
        return <PendingSvgIcon color={appColors.functional.pending} />;
    }
  };

  const getStatusTextStyle = () => {
    switch (status) {
      case TransactionStatusType.Completed:
        return appColors.functional.success;
      case TransactionStatusType.Pending:
        return appColors.functional.pending;
      case TransactionStatusType.Failed:
        return appColors.functional.warning;
      default:
        return appColors.functional.success;
    }
  };
  const getStatusText = () => {
    switch (status) {
      case TransactionStatusType.Completed:
        return LanguageKey.transaction_history_completed;
      case TransactionStatusType.Pending:
        return LanguageKey.transaction_history_pending;
      case TransactionStatusType.Failed:
        return LanguageKey.common_text_fail;
      default:
        return LanguageKey.transaction_history_pending;
    }
  };
  return (
    <ScreenWrapper
      enableHeader
      paddingTop
      backAction={backAction}
      headerTitleWithI18n={
        transactionData.isShowDefaults
          ? LanguageKey.transaction_smart_contract_call
          : LanguageKey.transaction_detail_header_title
      }
      headerTextVariant={TextVariantKeys.titleLarge}
      backgroundColor={theme.colors.surface_surface_default}
    >
      <>
        {loading ? (
          <LoadingTransactionDetails />
        ) : (
          <ScrollView style={styles.container}>
            <View style={[appStyles.mt30]}>
              <View style={appStyles.center}>
                {getIcon()}
                <View
                  style={[
                    styles.statusView,
                    {
                      backgroundColor: getStatusTextStyle(),
                    },
                  ]}
                >
                  <AppText
                    titleWithI18n={getStatusText()}
                    textColor={appColors.neutral.white}
                    variant={TextVariantKeys.labelSmall}
                  />
                </View>
              </View>

              {transactionData.isShowDefaults ? (
                <DefaultView
                  amountSend={amountSend}
                  convertTitle={convertTitle}
                  isSendNFT={!!isSendEVMNFT}
                  isSuccess={isSuccess}
                  onViewOnScan={onViewOnScan}
                  theme={theme}
                  transactionData={transactionData}
                  copyAction={copyAction}
                />
              ) : isCommonTransactionSmartContract ? (
                <View style={[styles.detailsContainer]}>
                  <DetailRow
                    titleWithI18n={LanguageKey.transaction_detail_total_amount}
                    value={`${convertTitle({
                      amount:
                        Number(transactionData.amountTonAttachedSmartExc) ?? 0,
                    })}`}
                    totalAmount
                    variantValue={TextVariantKeys.titleMedium}
                    bottomLine
                    valueMaxFontSizeMultiplier={1.3}
                    titleStyles={styles.widthHalf}
                    contentContainerStyles={styles.widthHalf}
                  />
                  <DetailRow
                    titleWithI18n={LanguageKey.transaction_detail_date}
                    value={DateTimeUtils.formatTimeWithTimezone(
                      transactionData?.createdAt ?? "",
                      "YYYY/MM/DD, h:mm A"
                    )}
                  />
                  <DetailRow
                    titleWithI18n={LanguageKey.send_recipient_address_title}
                    value={
                      transactionData.isMultipleTransaction
                        ? AppI18Next.t(LanguageKey.common_multiple_addresses)
                        : WalletUtils.getShortAddress(
                            transactionData?.toAddress
                          )
                    }
                  />
                  <DetailRow
                    titleWithI18n={
                      LanguageKey.transaction_detail_receive_amount
                    }
                    value={convertTitle({
                      amount: transactionData.fee ?? 0,
                    })}
                  />
                  <DetailRow
                    titleWithI18n={LanguageKey.send_network_fee_title}
                    value={convertTitle({
                      amount: networkFeeTon?.fee ?? 0,
                    })}
                  />
                  {transactionData?.txHash && (
                    <DetailRow
                      titleWithI18n={LanguageKey.transaction_tx_has_title}
                      value={WalletUtils.getShortAddress(
                        transactionData?.txHash
                      )}
                      showCopyButton
                      copyAction={copyAction}
                    />
                  )}
                  {isSuccess ? (
                    <TouchableOpacity
                      onPress={onViewOnScan}
                      style={styles.titleWithValueContainer}
                    >
                      <View
                        style={[
                          appStyles.flexRow,
                          appStyles.flex1,
                          appStyles.center,
                        ]}
                      >
                        <AppText
                          titleWithI18n={
                            LanguageKey.transaction_detail_view_on_scan_title
                          }
                          variant={TextVariantKeys.titleSmall}
                          textColor={theme.colors.surface_surface_brand}
                        />
                        <View style={appStyles.ml5}>
                          <ArrowForward2SvgIcon />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : (
                <View style={[styles.detailsContainer]}>
                  <DetailRow
                    titleWithI18n={
                      isReceiveTonNFT || (isEVM && !isSent)
                        ? LanguageKey.transaction_detail_receive_amount
                        : LanguageKey.transaction_detail_total_amount
                    }
                    value={totalAmountDisplay}
                    totalAmount
                    variantValue={TextVariantKeys.titleMedium}
                    bottomLine
                    valueMaxFontSizeMultiplier={1.3}
                    titleStyles={styles.widthHalf}
                    contentContainerStyles={styles.widthHalf}
                  />

                  {isTonNFTTransfer ? (
                    <DetailRow
                      titleWithI18n={LanguageKey.common_collection}
                      value={
                        tonNFTMetadata?.collection?.name
                          ? tonNFTMetadata?.collection?.name
                          : "-"
                      }
                      titleStyles={styles.widthHalf}
                      contentContainerStyles={styles.widthHalf}
                    />
                  ) : null}

                  {!isSendEVMNFT && transactionData?.toAddress ? (
                    <DetailRow
                      titleWithI18n={
                        transactionData.type === TransactionType.Receive
                          ? LanguageKey.common_text_from
                          : LanguageKey.send_recipient_address_title
                      }
                      value={
                        transactionData.isMultipleTransaction
                          ? AppI18Next.t(LanguageKey.common_multiple_addresses)
                          : WalletUtils.getShortAddress(
                              transactionData?.toAddress
                            )
                      }
                    />
                  ) : null}

                  {transactionData?.createdAt ? (
                    <DetailRow
                      titleWithI18n={LanguageKey.transaction_detail_date}
                      value={DateTimeUtils.formatTimeWithTimezone(
                        transactionData?.createdAt,
                        "YYYY/MM/DD, h:mm A"
                      )}
                    />
                  ) : null}
                  {isSendEVMNFT || (isEVM && !isSent) ? null : (
                    <DetailRow
                      titleWithI18n={
                        isSent
                          ? LanguageKey.transaction_detail_amount
                          : LanguageKey.transaction_detail_receive_amount
                      }
                      value={convertTitle({
                        amount: amountSend,
                      })}
                    />
                  )}
                  {transactionData?.from || isTonNFTTransfer ? (
                    <DetailRow
                      titleWithI18n={LanguageKey.common_text_from}
                      value={WalletUtils.getShortAddress(
                        isReceiveTonNFT
                          ? transactionData?.toAddress
                          : currentWallet?.address
                      )}
                    />
                  ) : null}
                  {transactionData?.toAddress && isTonNFTTransfer ? (
                    <DetailRow
                      titleWithI18n={LanguageKey.common_text_to}
                      value={WalletUtils.getShortAddress(
                        isReceiveTonNFT
                          ? currentWallet?.address
                          : transactionData?.toAddress
                      )}
                    />
                  ) : null}
                  {transactionData?.to && !isTonNFTTransfer ? (
                    <DetailRow
                      titleWithI18n={LanguageKey.common_text_to}
                      value={WalletUtils.getShortAddress(transactionData?.to)}
                    />
                  ) : null}

                  {!isTonNFTTransfer && isSendEVMNFT ? (
                    <DetailRow
                      titleWithI18n={LanguageKey.common_text_token_id}
                      value={`#${transactionData?.tokenId}`}
                    />
                  ) : null}
                  {transactionData?.quantity ? (
                    <DetailRow
                      titleWithI18n={LanguageKey.project_detail_quantity}
                      value={transactionData?.quantity}
                    />
                  ) : null}
                  {transactionData?.estimatedGasFee ? (
                    <DetailRow
                      titleWithI18n={LanguageKey.nft_estimated_gas_fee}
                      value={convertTitle({
                        amount: +transactionData?.estimatedGasFee,
                        gasFee: true,
                      })}
                    />
                  ) : null}

                  {(isSent && transactionData?.adminFee !== undefined) ||
                  (!isReceiveTonNFT &&
                    isSendEVMNFT &&
                    transactionData?.adminFee !== undefined) ? (
                    <DetailRow
                      titleWithI18n={LanguageKey.send_service_fee_title}
                      value={convertTitle({
                        amount: adminFee,
                      })}
                    />
                  ) : null}
                  {!isReceiveTonNFT && transactionData?.fee ? (
                    <DetailRow
                      titleWithI18n={LanguageKey.send_network_fee_title}
                      value={convertTitle({
                        amount: isTransactionCallSmartContract
                          ? (networkFeeTon?.fee ?? 0)
                          : fee,
                        gasFee: true,
                        isNetworkFee: true,
                      })}
                      titleStyles={styles.widthHalf}
                      contentContainerStyles={styles.widthHalf}
                    />
                  ) : null}
                  {!isTonNFTTransfer && transactionData?.memo ? (
                    <DetailRow
                      titleWithI18n={LanguageKey.send_memo_title}
                      value={transactionData.memo}
                    />
                  ) : null}
                  {transactionData?.txHash && (
                    <DetailRow
                      titleWithI18n={LanguageKey.transaction_tx_has_title}
                      value={WalletUtils.getShortAddress(
                        transactionData?.txHash
                      )}
                      showCopyButton
                      copyAction={copyAction}
                    />
                  )}
                  {isSuccess ? (
                    <TouchableOpacity
                      onPress={onViewOnScan}
                      style={styles.titleWithValueContainer}
                    >
                      <View
                        style={[
                          appStyles.flexRow,
                          appStyles.flex1,
                          appStyles.center,
                        ]}
                      >
                        <AppText
                          titleWithI18n={
                            LanguageKey.transaction_detail_view_on_scan_title
                          }
                          variant={TextVariantKeys.titleSmall}
                          textColor={theme.colors.surface_surface_brand}
                        />
                        <View style={appStyles.ml5}>
                          <ArrowForward2SvgIcon />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
            </View>
          </ScrollView>
        )}
        <View style={styles.viewButton}>
          <AppButton
            titleWithI18n={LanguageKey.transaction_history_close}
            styles={styles.closeButton}
            textColor={appColors.neutral.white}
            textVariant={TextVariantKeys.bodyMMedium}
            onPress={backAction}
            isLoading={loading}
          />
        </View>
      </>
    </ScreenWrapper>
  );
};

export default TransactionDetails;
