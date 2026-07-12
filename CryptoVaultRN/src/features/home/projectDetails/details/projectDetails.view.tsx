import React, { memo } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { EdgeInsets } from "react-native-safe-area-context";
import AppButton from "src/components/common/AppButton";
import AppImage from "src/components/common/AppImage";
import AppText from "src/components/common/AppText";
import { SwitchProtocolWarningModal } from "src/components/homeComponents/SwitchProtocol";
import ScreenWrapper from "src/components/layout/ScreenWrapper";
import appColors from "src/core/constants/AppColors";
import { EmptyTransactionSvgIcon } from "src/core/constants/AppIconsSvg";
import { CoinType } from "src/core/enum/CoinType";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import DateTimeUtils from "src/core/utils/dateTimeUtils";
import { LoadingWrapper } from "../../bottomTab/NFTCollection/NFTCollectionTab/components/NFTCollection.components";
import { WarningTransactionStatus } from "../transactionDetails/transactionDetails.component";
import {
  CollectionModal,
  JETTONDetailsAndPickingChart,
  JettonPriceChart,
  LinkedTonAddressComponent,
  ProjectDescription,
  renderPriceFeed,
  ViewMorePriceFeedComponent,
} from "./projectDetails.component";
import { useProjectDetail } from "./projectDetails.hook";
import { containerStyles } from "./projectDetails.style";
import { ProjectDetailPropsType } from "./projectDetails.type";

const ProjectDetail: React.FC<ProjectDetailPropsType> = ({
  props,
  navigation,
  setContractTonAddress,
  contractTonAddress,
  showRequirePinCode,
  loadingLinking,
  handleShowInstruction,
  handleShowPinCodeInstruction,
  showImportLinking,
  setShowImportLinking,
}) => {
  const {
    theme,
    collectionModal,
    handleWithCollection,
    onCloseCollectionModal,
    t,
    toggleNumberOfLines,
    onTextLayout,
    textShown,
    itemCollectionCheck,
    dataClaimable,
    loading,
    isOngoing,
    enableViewChart,
    onHideViewChart,
    onShowViewChart,
    pickingActionWhatYouGot,
    _handleShowChartAsync,
    navigateToConfirmScreen,
    navigateToPriceList,
    modalSwitchingProtocol,
    onHideModalSwitchingProtocol,
    protocolBaseData,
    handleActionSwitching,
    dataPriceFeedInDetail,
    isUpComing,
    loadingSwitch,
    linkingTonAddressData,
  } = useProjectDetail({
    data: props,
    navigation: navigation,
    showRequirePinCode,
    setContractTonAddress,
    handleShowInstruction,
    handleShowPinCodeInstruction,
    contractTonAddress,
    showImportLinking,
    setShowImportLinking,
  });

  const insets: EdgeInsets = useAppSafeAreaInsets();
  const styles = containerStyles(theme, insets);
  return (
    <>
      <ScreenWrapper
        scrollEnabled
        bounces={true}
        paddingBottom
        backgroundColor={appColors.neutral.n100}
      >
        <View style={[appStyles.flex1, appStyles.pB70]}>
          <LoadingWrapper
            loading={loading}
            skeletonWidth={"100%"}
            skeletonHeight={200}
          >
            <AppImage
              uri={props?.projectBanner}
              styleImage={styles.imageDetailBanner}
              resizeMode="cover"
              NotUsingRadius
            />
          </LoadingWrapper>

          <View style={appStyles.mh25}>
            <View style={appStyles.mt5}>
              {!isOngoing(props?.endDate) && (
                <WarningTransactionStatus
                  theme={theme}
                  text={LanguageKey.warning_expired_project_claim}
                />
              )}
              {isUpComing(props?.startDate) && (
                <WarningTransactionStatus
                  theme={theme}
                  text={t(LanguageKey.claim_token_message_upcoming, {
                    startDate: DateTimeUtils.formatTimeWithTimezone(
                      props?.startDate,
                      "YYYY/MM/DD"
                    ),
                  })}
                />
              )}
            </View>
            <View
              style={[
                appStyles.justifyContentBetween,
                appStyles.alignItemsCenter,
                appStyles.flexRow,
                appStyles.pT10,
              ]}
            >
              <LoadingWrapper
                loading={loading}
                skeletonWidth={100}
                skeletonHeight={15}
              >
                <AppText
                  titleWithI18n={LanguageKey.project_details_overview_title}
                  variant={TextVariantKeys.labelCap}
                  textColor={theme.colors.text_on_surface_text_light}
                  styles={styles.transform}
                />
              </LoadingWrapper>

              <LoadingWrapper
                loading={loading}
                skeletonWidth={100}
                skeletonHeight={15}
              >
                {dataClaimable && dataClaimable?.project ? (
                  <AppText
                    title={`${DateTimeUtils.formatTimeWithTimezone(
                      dataClaimable?.project?.startDate,
                      "YYYY/MM/DD"
                    )} - ${DateTimeUtils.formatTimeWithTimezone(
                      dataClaimable?.project?.endDate,
                      "YYYY/MM/DD"
                    )}`}
                    variant={TextVariantKeys.bodyRSmall}
                    textColor={theme.colors.text_on_surface_text_medium}
                  />
                ) : null}
              </LoadingWrapper>
            </View>
            <View style={styles.cartWrapper}>
              <LoadingWrapper
                loading={loading}
                skeletonWidth={"100%"}
                skeletonHeight={150}
              >
                <View style={styles.projectDescriptionContainer}>
                  <ProjectDescription
                    description={
                      dataClaimable?.project?.projectDescription || ""
                    }
                    textShown={textShown}
                    onTextLayout={onTextLayout}
                    toggleNumberOfLines={toggleNumberOfLines}
                    theme={theme}
                    insets={insets}
                  />
                </View>
              </LoadingWrapper>
            </View>
            {dataClaimable?.projectNftProtocol &&
              dataClaimable?.projectNftProtocol.name &&
              dataClaimable?.projectNftProtocol.name.toLowerCase() !==
                CoinType.Ton.toLowerCase() &&
              linkingTonAddressData?.tokenReceiverWalletAddress && (
                <View style={[styles.linkedWrapper, appStyles.pT15]}>
                  <LoadingWrapper
                    loading={loading}
                    skeletonWidth={"100%"}
                    skeletonHeight={150}
                  >
                    <LinkedTonAddressComponent
                      contractAddress={
                        linkingTonAddressData.tokenReceiverWalletAddress
                      }
                      insets={insets}
                      handleShowInstruction={handleShowInstruction}
                    />
                  </LoadingWrapper>
                </View>
              )}
            <View
              style={[
                appStyles.alignItemsCenter,
                appStyles.justifyContentBetween,
                appStyles.flexRow,
                appStyles.pT15,
              ]}
            >
              <LoadingWrapper
                loading={loading}
                skeletonWidth={100}
                containerSkeleton={appStyles.mbt5}
                skeletonHeight={15}
              >
                <AppText
                  titleWithI18n={LanguageKey.project_details_price_feed}
                  variant={TextVariantKeys.labelCap}
                  textColor={theme.colors.text_on_surface_text_light}
                  styles={[
                    styles.transform,
                    appStyles.flex1,
                    appStyles.textAlignLeft,
                  ]}
                />
              </LoadingWrapper>
              <LoadingWrapper
                loading={loading}
                skeletonWidth={150}
                containerSkeleton={appStyles.mbt5}
                skeletonHeight={15}
              >
                <Pressable
                  onPress={pickingActionWhatYouGot}
                  style={appStyles.flex2}
                >
                  <AppText
                    titleWithI18n={LanguageKey.claim_check_what_you_forgot}
                    variant={TextVariantKeys.titleSmall}
                    textColor={appColors.main.tokyoRed}
                    styles={[styles.decoration, appStyles.textAlignRight]}
                    maxFontSizeMultiplier={1.4}
                    numberOfLines={2}
                  />
                </Pressable>
              </LoadingWrapper>
            </View>

            <View style={styles.cartPriceFeedWrapper}>
              <View style={[appStyles.flex1]}>
                <FlatList
                  nestedScrollEnabled
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  data={dataPriceFeedInDetail?.slice(0, 3)}
                  renderItem={({ item }) =>
                    renderPriceFeed(
                      item,
                      theme,
                      dataClaimable,
                      insets,
                      t,
                      loading,
                      true
                    )
                  }
                  keyExtractor={(item, index) => item._id}
                  ListEmptyComponent={
                    <View style={[appStyles.center]}>
                      <View style={[appStyles.mt30, appStyles.mbt10]}>
                        <EmptyTransactionSvgIcon
                          color={appColors.neutral.n600}
                        />
                      </View>
                      <AppText
                        titleWithI18n={
                          LanguageKey.claim_token_detail_empty_title
                        }
                        textColor={theme.colors.text_on_surface_text_medium}
                        variant={TextVariantKeys.bodyRMedium}
                      />
                    </View>
                  }
                  ListFooterComponent={
                    <ViewMorePriceFeedComponent
                      action={navigateToPriceList}
                      theme={theme}
                      loading={loading}
                    />
                  }
                />
              </View>
            </View>
            <JETTONDetailsAndPickingChart
              theme={theme}
              JETTON_name={dataClaimable?.projectToken?.name}
              JETTON_symbol={dataClaimable?.projectToken?.symbol}
              JETTON_contract_address={
                dataClaimable?.projectToken?.contractAddress
              }
              enableViewChart={onShowViewChart}
              _handleShowChartAsync={_handleShowChartAsync}
              loading={loading}
              dataClaimable={dataClaimable}
              t={t}
            />
          </View>

          {itemCollectionCheck && (
            <CollectionModal
              collectionModal={collectionModal}
              handleWithCollection={handleWithCollection}
              onCloseCollectionModal={onCloseCollectionModal}
              itemCollectionCheck={itemCollectionCheck}
            />
          )}
          <JettonPriceChart
            gottingModal={enableViewChart}
            onCloseGottingModal={onHideViewChart}
            itemGotting={dataClaimable?.projectToken?.priceChartScanURL}
            _handleShowChartAsync={_handleShowChartAsync}
          />

          {protocolBaseData && dataClaimable && (
            <SwitchProtocolWarningModal
              theme={theme}
              visibleModal={modalSwitchingProtocol}
              disableAction={onHideModalSwitchingProtocol}
              acceptAction={() =>
                handleActionSwitching(
                  dataClaimable && dataClaimable.projectNftProtocol
                    ? dataClaimable.projectNftProtocol.name
                    : ""
                )
              }
              insets={insets}
              currentFalsingProtocol={protocolBaseData?.name}
              promisingProtocol={
                dataClaimable && dataClaimable.projectNftProtocol
                  ? dataClaimable.projectNftProtocol.name
                  : ""
              }
              projectName={
                dataClaimable && dataClaimable?.project
                  ? dataClaimable?.project?.projectName
                  : ""
              }
              isLoading={loadingSwitch}
              expectIcon={
                <AppImage
                  uri={
                    dataClaimable && dataClaimable.projectNftProtocol
                      ? dataClaimable.projectNftProtocol.logo
                      : ""
                  }
                  styleImage={appStyles.iconCircleSize13}
                  containerStyle={appStyles.ml5}
                />
              }
              currentIcon={
                <AppImage
                  uri={protocolBaseData?.logo}
                  styleImage={appStyles.iconCircleSize13}
                  containerStyle={appStyles.ml5}
                />
              }
            />
          )}
        </View>
      </ScreenWrapper>
      {isUpComing(props?.startDate) ? null : (
        <View style={styles.claimTokenButtonContainer}>
          <AppButton
            onPress={navigateToConfirmScreen}
            titleWithI18n={
              loading
                ? undefined
                : t(LanguageKey.common_text_claim, {
                    symbol: dataClaimable?.projectToken?.symbol,
                  })
            }
            textVariant={TextVariantKeys.bodyMMedium}
            textColor={appColors.neutral.white}
            disabled={!isOngoing(props?.endDate) || loading}
            styles={styles.claimTokenButton}
            textStyles={styles.indexButton}
            icon={
              loading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.text_on_surface_text_highest}
                />
              ) : null
            }
          />
        </View>
      )}
    </>
  );
};

export default memo(ProjectDetail);
