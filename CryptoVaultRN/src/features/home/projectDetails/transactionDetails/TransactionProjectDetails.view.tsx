import React from "react";
import { View } from "react-native";
import { ScreenWrapper } from "src/components";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import DateTimeUtils from "src/core/utils/dateTimeUtils";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { NFTTransactionDetailsLoading } from "../details/projectDetails.component";
import {
  ProjectInformationTransaction,
  TransactionDetailProjectChild,
  WarningTransactionStatus,
} from "./transactionDetails.component";
import { useTransactionDetailsStyle } from "./transactionDetails.style";
import { useTransactionProjectClaimDetails } from "./transactionProjectDetails.hook";

const TransactionProjectDetails: React.FC<RootNavigationType> = ({
  navigation,
  route,
}) => {
  const { data } = route.params;
  const {
    theme,
    dataClaimable,
    backAction,
    handleCopy,
    onViewOnScan,
    totalClaimWithAllProject,
    dataTransactionDetail,
    statusLoading,
    insets,
    navigateToClaimNFTList,
  } = useTransactionProjectClaimDetails({
    navigation,
    data,
  });
  const styles = useTransactionDetailsStyle(theme, insets);
  return (
    <ScreenWrapper
      enableHeader
      paddingTop
      backAction={backAction}
      headerTitleWithI18n={LanguageKey.project_details_claim_details}
      headerTextVariant={TextVariantKeys.titleLarge}
      backgroundColor={theme.colors.surface_surface_default}
    >
      <View style={styles.container}>
        <View style={[styles.projectContainer]}>
          {!dataTransactionDetail?.history?.transactionHash && (
            <WarningTransactionStatus
              theme={theme}
              text={LanguageKey.transaction_claim_warning}
            />
          )}
          <ProjectInformationTransaction
            projectName={dataClaimable?.project?.projectName}
            recipientAddress={data.tokenReceiverWalletAddress}
            theme={theme}
            protocolName={
              data?.project?.protocolName ??
              dataClaimable?.projectNftProtocol?.name
            }
            protocolImage={
              data?.project?.protocolLogo ??
              dataClaimable?.projectNftProtocol?.logo
            }
            transactionHash={dataTransactionDetail?.history?.transactionHash}
            dateTransaction={DateTimeUtils.formatTimeWithTimezone(
              data?.createdAt,
              "YYYY/MM/DD, h:mm A"
            )}
            handleCopy={handleCopy}
            handleViewOnScan={onViewOnScan}
            loading={statusLoading}
          />
          {dataTransactionDetail?.history?.nfts ? (
            <TransactionDetailProjectChild
              theme={theme}
              dataClaimable={dataClaimable}
              dataGetOwned={dataTransactionDetail?.history?.nfts}
              loading={statusLoading}
              totalClaim={`${dataTransactionDetail?.history?.amount}`}
              totalInAllTransaction={totalClaimWithAllProject}
              enableToken={
                dataClaimable?.projectToken?.symbol !== null
                  ? dataClaimable?.projectToken?.symbol
                  : undefined
              }
              actionNavigatingSeeMoreScreen={navigateToClaimNFTList}
              insets={insets}
            />
          ) : (
            <View style={styles.projectDetailHistory}>
              <NFTTransactionDetailsLoading loading={statusLoading} />
            </View>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default TransactionProjectDetails;
