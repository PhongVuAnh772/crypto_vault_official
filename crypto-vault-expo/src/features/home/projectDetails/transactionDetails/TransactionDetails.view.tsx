import React from "react";
import { Pressable, View } from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import DateTimeUtils from "src/core/utils/dateTimeUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { ContactSupportModal } from "../confirm/confirmClaimToken.component";
import {
  ProjectInformationTransactionProcessing,
  TransactionDetailChild,
  WarningTransactionStatus,
} from "./transactionDetails.component";
import { useTransactionClaimDetails } from "./transactionDetails.hook";
import { useTransactionDetailsStyle } from "./transactionDetails.style";

const TransactionClaimDetail: React.FC<RootNavigationType> = ({
  navigation,
  route,
}) => {
  const { data } = route.params;
  const {
    theme,
    dataClaimable,
    backAction,
    handleCopy,
    dataGetOwned,
    onViewOnScan,
    insets,
    onShowContactSupportModal,
    contactSupportModal,
    onHideContactSupportModal,
    onSubmit,
    nameContact,
    setNameContact,
    emailContact,
    setEmailContact,
    inquiryContact,
    setInquiryContact,
    validate,
    contactLoading,
  } = useTransactionClaimDetails({
    navigation,
    data,
  });
  const styles = useTransactionDetailsStyle(theme, insets);
  return (
    <>
      <ScreenWrapper
        enableHeader
        paddingTop
        backAction={backAction}
        headerTextVariant={TextVariantKeys.titleLarge}
        headerTitleWithI18n={LanguageKey.project_details_claim_details}
        backgroundColor={theme.colors.surface_surface_default}
      >
        <View
          style={[
            appStyles.pH25,
            appStyles.justifyContentBetween,
            appStyles.flex1,
            appStyles.alignItemsCenter,
            styles.bgDefault,
            appStyles.pT15,
          ]}
        >
          <View style={[styles.projectContainer]}>
            <Pressable
              onPress={onShowContactSupportModal}
              style={styles.helpButton}
            >
              <AppText
                titleWithI18n={LanguageKey.claim_detail_need_help}
                variant={TextVariantKeys.bodyMLarge}
                textColor={appColors.main.tokyoRed}
                styles={[styles.decoration]}
              />
            </Pressable>
            <WarningTransactionStatus
              theme={theme}
              text={LanguageKey.transaction_claim_warning}
            />
            <ProjectInformationTransactionProcessing
              projectName={dataClaimable?.project?.projectName}
              recipientAddress={
                data.claimHistory.tokenReceiverWalletAddress ?? ""
              }
              theme={theme}
              protocolName={data.project.protocolName ?? ""}
              protocolImage={
                data?.project?.protocolLogo ??
                dataClaimable?.projectNftProtocol?.logo
              }
              transactionHash={data?.transactionHash}
              dateTransaction={DateTimeUtils.formatTimeWithTimezone(
                data.claimHistory.createdAt,
                "YYYY/MM/DD, h:mm A"
              )}
              handleCopy={handleCopy}
              handleViewOnScan={onViewOnScan}
              loading={false}
            />
            <TransactionDetailChild
              theme={theme}
              dataClaimable={dataClaimable}
              dataGetOwned={dataGetOwned?.nfts}
              loading={false}
              totalClaim={data?.claimHistory?.amount ?? ""}
              insets={insets}
            />
          </View>

          <AppButton
            onPress={backAction}
            titleWithI18n={LanguageKey.transaction_history_close}
            styles={styles.closeButton}
            textColor={appColors.neutral.white}
            textVariant={TextVariantKeys.bodyMMedium}
          />
        </View>
      </ScreenWrapper>
      <ContactSupportModal
        theme={theme}
        visibleModal={contactSupportModal}
        disableAction={onHideContactSupportModal}
        acceptAction={onSubmit}
        nameContact={nameContact}
        setNameContact={setNameContact}
        emailContact={emailContact}
        setEmailContact={setEmailContact}
        inquiryContact={inquiryContact}
        setInquiryContact={setInquiryContact}
        disabled={!validate()}
        loading={contactLoading}
      />
    </>
  );
};

export default TransactionClaimDetail;
