import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import { EmptyTransactionSvgIcon } from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { LoadingWrapper } from "../../bottomTab/NFTCollection/NFTCollectionTab/components/NFTCollection.components";
import {
  ContactSupportModal,
  ProjectDetailChild,
  ProjectInformation,
} from "./confirmClaimToken.component";
import { useConfirmClaimToken } from "./confirmClaimToken.hook";
import { useStyles } from "./confirmClaimToken.style";

const ConfirmClaimToken: React.FC<RootNavigationType> = ({ navigation }) => {
  const {
    theme,
    handleClaimToken,
    dataClaimable,
    commonBackAction,
    loading,
    dataGetOwned,
    firstLoading,
    nameContact,
    setNameContact,
    emailContact,
    setEmailContact,
    inquiryContact,
    setInquiryContact,
    contactSupportModal,
    onShowContactSupportModal,
    onHideContactSupportModal,
    validate,
    onSubmit,
    contactLoading,
    insets,
    linkingTonAddressData,
    currentTonAccount,
  } = useConfirmClaimToken({
    navigation,
  });
  const styles = useStyles(theme);

  return (
    <ScreenWrapper
      enableHeader
      paddingTop
      backAction={commonBackAction}
      headerTitleWithI18n={LanguageKey.common_text_confirmation}
      headerTextVariant={TextVariantKeys.titleLarge}
      backgroundColor={appColors.neutral.n100}
    >
      {!firstLoading && dataGetOwned && dataGetOwned?.nfts?.length === 0 ? (
        <View style={styles.containerEmpty}>
          <View style={[appStyles.mbt10, appStyles.alignItemsCenter]}>
            <EmptyTransactionSvgIcon
              color={theme.colors.text_on_surface_text_light}
            />
          </View>
          <AppText
            titleWithI18n={LanguageKey.claim_confirm_empty_NFT_title}
            textColor={theme.colors.text_on_surface_text_medium}
            variant={TextVariantKeys.titleLarge}
            styles={[appStyles.textAlignCenter, appStyles.mt10]}
          />
          <AppText
            titleWithI18n={LanguageKey.claim_confirm_empty_NFT_description}
            textColor={theme.colors.text_on_surface_text_medium}
            variant={TextVariantKeys.bodyRMedium}
            styles={[appStyles.textAlignCenter, appStyles.mt10]}
          />
        </View>
      ) : (
        <>
          <View style={styles.container}>
            <View style={[appStyles.flex1, styles.projectContainer]}>
              <ProjectInformation
                project_name={dataClaimable?.project?.projectName}
                wallet_1={dataClaimable?.project?.projectName}
                recipient_address={
                  linkingTonAddressData &&
                  linkingTonAddressData.tokenReceiverWalletAddress
                    ? linkingTonAddressData.tokenReceiverWalletAddress
                    : currentTonAccount?.address
                }
                theme={theme}
                loading={firstLoading}
              />
              <View style={[appStyles.pT15]}>
                <View
                  style={[
                    appStyles.flexRow,
                    appStyles.alignItemsCenter,
                    appStyles.justifyContentBetween,
                  ]}
                >
                  <LoadingWrapper
                    loading={firstLoading}
                    skeletonWidth={100}
                    containerSkeleton={appStyles.mbt5}
                    skeletonHeight={15}
                  >
                    <AppText
                      titleWithI18n={LanguageKey.project_details_claim_details}
                      variant={TextVariantKeys.labelCap}
                      textColor={theme.colors.text_on_surface_text_light}
                    />
                  </LoadingWrapper>
                  <LoadingWrapper
                    loading={firstLoading}
                    skeletonWidth={100}
                    containerSkeleton={appStyles.mbt5}
                    skeletonHeight={15}
                  >
                    <Pressable onPress={onShowContactSupportModal}>
                      <AppText
                        titleWithI18n={LanguageKey.claim_detail_need_help}
                        variant={TextVariantKeys.bodyMLarge}
                        textColor={appColors.main.tokyoRed}
                        styles={[styles.decoration]}
                      />
                    </Pressable>
                  </LoadingWrapper>
                </View>
                <ProjectDetailChild
                  theme={theme}
                  dataClaimable={dataClaimable}
                  dataGetOwned={dataGetOwned?.nfts}
                  loading={firstLoading}
                  totalClaim={dataGetOwned?.totalAmount ?? ""}
                  insets={insets}
                  enableToken={dataClaimable?.projectToken?.symbol}
                />
              </View>
            </View>
            {!firstLoading && (
              <AppButton
                titleWithI18n={loading ? "" : LanguageKey.common_text_confirm}
                styles={styles.closeButton}
                textColor={appColors.neutral.white}
                textVariant={TextVariantKeys.bodyMMedium}
                onPress={handleClaimToken}
                disabled={loading}
                icon={
                  loading ? (
                    <ActivityIndicator
                      animating
                      size="small"
                      color={appColors.neutral.white}
                    />
                  ) : null
                }
              />
            )}
          </View>
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
      )}
    </ScreenWrapper>
  );
};

export default ConfirmClaimToken;
