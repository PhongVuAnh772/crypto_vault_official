import { t, TFunction } from "i18next";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FastImage from "react-native-fast-image";
import { TextInput } from "react-native-paper";
import { EdgeInsets } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { Route } from "react-native-tab-view";
import { WebView } from "react-native-webview";
import AppButton from "src/components/common/AppButton";
import AppModal from "src/components/common/AppModal";
import AppText from "src/components/common/AppText";
import BottomSheetModalGorhom from "src/components/specific/BottomSheetModalGorhom/BottomSheetModalGorhom.view";
import appColors from "src/core/constants/AppColors";
import {
  ArrowForward2SvgIcon,
  Close2SvgIcon,
  DeleteTextSvgIcon,
  EmptyTransactionSvgIcon,
  InfoSvgIcon,
  LinkingWalletSvgIcon,
  ScanSvgIcon,
} from "src/core/constants/AppIconsSvg";
import { appImages } from "src/core/constants/AppImages";
import InputMode from "src/core/enum/InputMode";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import AppI18Next from "src/core/locales";
import LanguageKey from "src/core/locales/LanguageKey";
import { useAppDispatch, useAppSelector } from "src/core/redux/hooks";
import { RootState } from "src/core/redux/store";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";
import WalletUtils from "src/core/utils/walletUtils";
import { setTabIndex } from "../../bottomTab/explore/explore.slice";
import {
  ClaimableType,
  ClaimHistory,
  DataPriceFeed,
  NFTHistoryType,
  OwnedNFTType,
} from "../../bottomTab/explore/explore.type";
import { LoadingWrapper } from "../../bottomTab/NFTCollection/NFTCollectionTab/components/NFTCollection.components";
import { ProtocolNFTView } from "../confirm/confirmClaimToken.component";
import { DataClaimableType } from "../confirm/confirmClaimToken.type";
import { useTabStyles } from "../index.style";
import { containerStyles, slideStyles } from "./projectDetails.style";
import {
  BottomSheetInstructionLinkingWalletProps,
  ClaimDetail,
  ClaimTokenHeaderProps,
  CollectionModalProps,
  ExpandableTextProps,
  JETTONDetailsAndPickingChartProps,
  JettonPriceChartProps,
  LinkedTonAddressComponentProps,
  LinkingTonAddressComponentProps,
  ModalLinkingWalletProps,
  NFTTransactionDetailsLoadingProps,
  ProjectDescriptionProps,
  RenderNFTCollectionTabBarProps,
  SwiperComponentProps,
  ToggleSeeMoreViewProps,
  TokenWhatYouGotHeaderProps,
  ViewMorePriceFeedProps,
} from "./projectDetails.type";

export const ModalLinkingWallet = ({
  showModalImportWallet,
  isScanning,
  handleCancel,
  handleStart,
  closeModalImport,
  theme,
  insets,
  walletAddressError,
  isFocus,
  onChangeText,
  walletAddress,
  onBlur,
  onFoCus,
  handleCopyToClipboard,
  loadingLinking,
  onShowScanQr,
}: ModalLinkingWalletProps) => {
  const styles = containerStyles(theme, insets);

  return (
    <View style={styles.modalLinkingContainer}>
      <View style={[styles.modalContainer]}>
        <AppText
          titleWithI18n={LanguageKey.claim_token_link_ton_address}
          variant={TextVariantKeys.titleLarge}
          textColor={theme.colors.text_on_surface_text_highest}
        />

        <View
          style={[
            styles.view_inputAddress,
            walletAddressError ? styles.walletError : null,
          ]}
        >
          <View style={appStyles.flex1}>
            <TextInput
              disabled={isScanning}
              autoCorrect={false}
              autoCapitalize="none"
              autoComplete="off"
              importantForAutofill="no"
              keyboardType={Utils.isAndroid ? "visible-password" : "default"}
              spellCheck={false}
              autoFocus={true}
              multiline={false}
              numberOfLines={1}
              value={walletAddress}
              onChangeText={onChangeText}
              placeholder={t(LanguageKey.enter_wallet_address_title)}
              placeholderTextColor={appColors.neutral.n500}
              mode={InputMode.outlined}
              outlineColor={theme.colors.surface_surface_high}
              activeOutlineColor={theme.colors.surface_surface_high}
              selectionColor={theme.colors.text_on_surface_text_light}
              cursorColor={appColors.neutral.black}
              textColor={theme.colors.text_on_surface_text_high}
              style={[styles.editInputStyle, theme.fonts.bodyMMedium]}
              onBlur={onBlur}
              onFocus={onFoCus}
              contentStyle={[styles.editInputStyle2]}
            />
          </View>
          <View style={[appStyles.flexRow, appStyles.center]}>
            {walletAddress.length > 0 && !isScanning && (
              <TouchableOpacity onPress={() => onChangeText("")}>
                <DeleteTextSvgIcon />
              </TouchableOpacity>
            )}
            <AppButton
              onPress={handleCopyToClipboard}
              disabled={isScanning}
              disabledBackgroundColor={"transparent"}
              disabledTextColor={theme.colors.label_surface_disable}
              titleWithI18n={LanguageKey.common_text_paste}
              textVariant={TextVariantKeys.bodyMMedium}
              textColor={appColors.main.tokyoRed}
            />
            {/* <TouchableOpacity
                            style={styles.scanIcon}
                            onPress={onShowScanQr}>
                            <ScanSvgIcon />
                        </TouchableOpacity> */}
          </View>
        </View>
        {walletAddressError ? (
          <View style={[appStyles.flexRow, styles.errorText]}>
            <AppText
              titleWithI18n={LanguageKey.invalid_wallet_address}
              textColor={theme.colors.surface_surface_brand}
              styles={appStyles.textAlignLeft}
            />
          </View>
        ) : null}
        <View style={[appStyles.flexRow, appStyles.pT30]}>
          <AppButton
            onPress={handleCancel}
            titleWithI18n={LanguageKey.common_text_cancel}
            styles={[styles.button]}
            textVariant={TextVariantKeys.titleSmall}
            textColor={appColors.main.tokyoRed}
          />

          <View style={appStyles.mh6} />

          <AppButton
            onPress={handleStart}
            titleWithI18n={LanguageKey.common_text_ok}
            styles={styles.button2}
            textVariant={TextVariantKeys.titleSmall}
            textColor={theme.colors.text_on_surface_text_invert}
            isLoading={loadingLinking}
          />
        </View>
      </View>
    </View>
  );
};

export const SwiperComponent = ({ data }: SwiperComponentProps) => {
  const styles = slideStyles();
  return (
    <Swiper
      style={[styles.wrapper]}
      showsButtons={false}
      paginationStyle={styles.pagination}
      horizontal={true}
      scrollEnabled={true}
      activeDotColor={appColors.main.tokyoRed}
      autoplay
    >
      {data.map((item: string, index: number) => (
        <FastImage
          key={`${item} + ${index}`}
          source={{
            uri: item,
            priority: FastImage.priority.normal,
          }}
          style={styles.imageBanner}
          resizeMode="stretch"
          defaultSource={appImages.NFTDefault}
        />
      ))}
    </Swiper>
  );
};

export const LinkingTonAddressComponent = ({
  handleCopyToClipboard,
  setContractAddress,
  contractAddress,
  onScanQR,
  insets,
  handleShowInstruction,
  setErrorValidAddress,
}: LinkingTonAddressComponentProps) => {
  const theme = useAppTheme();
  const { t } = useTranslation();
  const styles = containerStyles(theme, insets);

  return (
    <View style={appStyles.flex1}>
      <View>
        <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
          <AppText
            titleWithI18n={t(LanguageKey.claim_token_link_ton_address)}
            variant={TextVariantKeys.bodyRSmall}
            textColor={theme.colors.text_on_surface_text_medium}
            styles={appStyles.pR5}
          />
          <Pressable onPress={handleShowInstruction}>
            <InfoSvgIcon
              width={16}
              height={16}
              color={theme.colors.text_on_surface_text_medium}
            />
          </Pressable>
        </View>
        <View
          style={[
            appStyles.flexRow,
            appStyles.alignItemsCenter,
            appStyles.justifyContentBetween,
            appStyles.pT10,
          ]}
        >
          <View style={[appStyles.flex1]}>
            <TextInput
              numberOfLines={1}
              onChangeText={setContractAddress}
              value={contractAddress}
              mode={InputMode.outlined}
              outlineColor={theme.colors.surface_surface_default}
              activeOutlineColor={theme.colors.surface_surface_default}
              placeholder={t(LanguageKey.nft_contract_address)}
              selectionColor={theme.colors.text_on_surface_text_highest}
              style={[
                styles.inputAddressContainer,
                {
                  backgroundColor: theme.colors.surface_surface_default,
                },
              ]}
              contentStyle={[styles.inputAddressContent]}
              right={
                contractAddress.length > 0 ? (
                  <TextInput.Icon
                    icon={"close"}
                    onPress={() => {
                      setContractAddress("");
                      setErrorValidAddress(false);
                    }}
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
          <TouchableOpacity style={styles.scanIcon} onPress={onScanQR}>
            <ScanSvgIcon />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const LinkedTonAddressComponent = ({
  contractAddress,
  insets,
  handleShowInstruction,
}: LinkedTonAddressComponentProps) => {
  const theme = useAppTheme();
  const { t } = useTranslation();

  return (
    <View style={appStyles.flex1}>
      <View>
        <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
          <AppText
            titleWithI18n={t(LanguageKey.claim_token_linked_ton_address)}
            variant={TextVariantKeys.bodyRSmall}
            textColor={theme.colors.text_on_surface_text_medium}
            styles={appStyles.pR5}
          />
          <Pressable onPress={handleShowInstruction}>
            <InfoSvgIcon
              width={16}
              height={16}
              color={theme.colors.text_on_surface_text_medium}
            />
          </Pressable>
        </View>
        <AppText
          titleWithI18n={contractAddress}
          variant={TextVariantKeys.bodyRSmall}
          textColor={theme.colors.text_on_surface_text_highest}
          styles={[appStyles.pR5, appStyles.pT10]}
        />
      </View>
    </View>
  );
};

function ProjectDescriptionComponent({
  description,
  textShown,
  onTextLayout,
  toggleNumberOfLines,
  theme,
  insets,
}: ProjectDescriptionProps) {
  const styles = containerStyles(theme, insets);

  return (
    <AppText
      title={description}
      variant={TextVariantKeys.bodyRMedium}
      textColor={theme.colors.text_on_surface_text_high}
      styles={[styles.readLess]}
      onTextLayout={onTextLayout}
      numberOfLines={textShown ? undefined : 4}
      buttonInline={
        description?.length > 250 ? (
          <ToggleSeeMoreView
            textShown={textShown}
            toggleNumberOfLines={toggleNumberOfLines}
          />
        ) : null
      }
    />
  );
}
export const ProjectDescription = React.memo(ProjectDescriptionComponent);

export const renderClaimDetailsModal = (
  item: ClaimDetail,
  theme: AppThemeType,
  onShowCollectionModal: () => void,
  setItemCollectionCheck: React.Dispatch<React.SetStateAction<null>>,
  dataClaimable: ClaimableType | null,
  inModal = false
) => {
  return (
    <View style={[appStyles.flexRow, appStyles.mv10]}>
      <View
        style={[
          appStyles.justifyContentBetween,
          appStyles.alignItemsCenter,
          appStyles.flex1,
          appStyles.flexRow,
        ]}
      >
        <View style={appStyles.flex5}>
          <AppText
            title={
              item?.response?.name
                ? item?.response?.name
                : dataClaimable?.projectNFT?.name
            }
            variant={TextVariantKeys.bodyMLarge}
            textColor={
              !inModal
                ? appColors.main.tokyoRed
                : theme.colors.text_on_surface_text_high
            }
          />
        </View>
        <View style={[appStyles.flex2, appStyles.alignItemsEnd]}>
          <AppText
            title={`${item?.amount?.toLocaleString()}`}
            variant={TextVariantKeys.bodyMLarge}
            textColor={theme.colors.text_on_surface_text_high}
          />
        </View>
      </View>
    </View>
  );
};

export const BottomSheetInstructionLinkingWallet: React.FC<
  BottomSheetInstructionLinkingWalletProps
> = ({
  isVisible,
  closeModalCreateNewWallet,
  onDismiss,
  continueAction,
  insets,
  bottomSheetRef,
}) => {
  const theme = useAppTheme();

  const styles = containerStyles(theme, insets);
  return (
    <BottomSheetModalGorhom
      onDismiss={onDismiss}
      refModal={bottomSheetRef}
      snapPoints={["55"]}
    >
      <View style={[appStyles.flex1]}>
        <View style={[appStyles.pH25, appStyles.pT15, appStyles.flex1]}>
          <View style={appStyles.flex1}>
            <View style={appStyles.center}>
              <LinkingWalletSvgIcon />
              <View style={appStyles.mv25}>
                <AppText
                  titleWithI18n={
                    LanguageKey.claim_token_linked_ton_address_sheet_title
                  }
                  variant={TextVariantKeys.titleLarge}
                  textColor={theme.colors.text_on_surface_text_high}
                  styles={appStyles.textAlignCenter}
                />
                <AppText
                  titleWithI18n={
                    LanguageKey.claim_token_linked_ton_address_sheet_description
                  }
                  variant={TextVariantKeys.bodyRMedium}
                  textColor={theme.colors.text_on_surface_text_high}
                  styles={[appStyles.textAlignCenter, appStyles.mt20]}
                />
              </View>
            </View>
          </View>

          <AppButton
            onPress={continueAction}
            titleWithI18n={LanguageKey.common_text_continue}
            styles={styles.buttonSheet}
            textVariant={TextVariantKeys.titleSmall}
            textColor={theme.colors.text_on_surface_text_invert}
          />
        </View>
      </View>
    </BottomSheetModalGorhom>
  );
};

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  children,
  descriptionLength,
}) => {
  const fullText = String(children); // Convert children to string
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleText = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View>
      <Text>
        {isExpanded ? fullText : `${fullText.slice(0, descriptionLength)}...`}
      </Text>
      <TouchableOpacity onPress={toggleText}>
        <Text style={{ color: "blue" }}>
          {isExpanded ? "Show less" : "Show more"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const NFTTransactionDetailsLoading: React.FC<
  NFTTransactionDetailsLoadingProps
> = ({ loading }) => {
  const theme = useAppTheme();
  if (!loading) {
    return (
      <View style={[appStyles.center]}>
        <View style={[appStyles.mt30, appStyles.mbt10]}>
          <EmptyTransactionSvgIcon color={appColors.neutral.n600} />
        </View>
        <AppText
          titleWithI18n={LanguageKey.claim_token_detail_empty_title}
          textColor={theme.colors.text_on_surface_text_medium}
          variant={TextVariantKeys.bodyRMedium}
        />
      </View>
    );
  }
  const renderItem = () => {
    return (
      <View style={[appStyles.flexRow, appStyles.mv10]}>
        <View
          style={[
            appStyles.justifyContentBetween,
            appStyles.alignItemsCenter,
            appStyles.flex1,
            appStyles.flexRow,
          ]}
        >
          <View
            style={[
              appStyles.flex1,
              appStyles.flexRow,
              appStyles.justifyContentBetween,
              appStyles.alignItemsCenter,
            ]}
          >
            <View>
              <LoadingWrapper
                loading={loading}
                skeletonWidth={80}
                containerSkeleton={appStyles.ml10}
                skeletonHeight={25}
              >
                <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                  <View />
                </View>
              </LoadingWrapper>
            </View>

            <LoadingWrapper
              loading={loading}
              skeletonWidth={50}
              skeletonHeight={15}
            >
              <View />
            </LoadingWrapper>
          </View>
        </View>
      </View>
    );
  };
  return (
    <FlatList
      data={[1, 2, 3]}
      renderItem={renderItem}
      scrollEnabled={false}
      ListFooterComponent={
        <>
          <LoadingWrapper
            loading={loading}
            skeletonWidth={80}
            containerSkeleton={[appStyles.center, appStyles.mt20]}
            skeletonHeight={20}
          >
            <View />
          </LoadingWrapper>
          <View style={[appStyles.flexRow, appStyles.mv10]}>
            <View
              style={[
                appStyles.justifyContentBetween,
                appStyles.alignItemsCenter,
                appStyles.flex1,
                appStyles.flexRow,
              ]}
            >
              <View
                style={[
                  appStyles.flex1,
                  appStyles.flexRow,
                  appStyles.justifyContentBetween,
                  appStyles.alignItemsCenter,
                ]}
              >
                <View>
                  <LoadingWrapper
                    loading={loading}
                    skeletonWidth={50}
                    containerSkeleton={appStyles.ml10}
                    skeletonHeight={15}
                  >
                    <View
                      style={[appStyles.flexRow, appStyles.alignItemsCenter]}
                    >
                      <View />
                    </View>
                  </LoadingWrapper>
                  <LoadingWrapper
                    loading={loading}
                    skeletonWidth={80}
                    containerSkeleton={[appStyles.ml10, appStyles.pV15]}
                    skeletonHeight={10}
                  >
                    <View
                      style={[appStyles.flexRow, appStyles.alignItemsCenter]}
                    >
                      <View />
                    </View>
                  </LoadingWrapper>
                </View>

                <LoadingWrapper
                  loading={loading}
                  skeletonWidth={20}
                  skeletonHeight={15}
                >
                  <View />
                </LoadingWrapper>
              </View>
            </View>
          </View>
        </>
      }
    />
  );
};

export const renderNFTTransactionDetails = (
  item: ClaimHistory | OwnedNFTType | NFTHistoryType,
  theme: AppThemeType,
  dataClaimable: ClaimableType | null,
  loading = false,
  inModal = false
) => {
  const t = AppI18Next.t;
  return (
    <View style={[appStyles.flexRow, appStyles.mv10]}>
      <View
        style={[
          appStyles.justifyContentBetween,
          appStyles.alignItemsCenter,
          appStyles.flex1,
          appStyles.flexRow,
        ]}
      >
        <View
          style={[
            appStyles.flex1,
            appStyles.flexRow,
            appStyles.justifyContentBetween,
            appStyles.alignItemsCenter,
          ]}
        >
          <View>
            <LoadingWrapper
              loading={loading}
              skeletonWidth={80}
              containerSkeleton={appStyles.ml10}
              skeletonHeight={25}
            >
              <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                <AppText
                  title={`${t(LanguageKey.nft_id)} #${item?.nftId}`}
                  variant={TextVariantKeys.bodyMMedium}
                  textColor={theme.colors.text_on_surface_text_light}
                />
              </View>
            </LoadingWrapper>
          </View>

          <LoadingWrapper
            loading={loading}
            skeletonWidth={50}
            skeletonHeight={15}
          >
            <AppText
              titleWithI18n={Utils.formattedAmountClaim(
                item?.amount
              ).toString()}
              variant={TextVariantKeys.bodyMLarge}
              textColor={theme.colors.text_on_surface_text_highest}
            />
          </LoadingWrapper>
        </View>
      </View>
    </View>
  );
};

export const renderPriceFeed = (
  item: OwnedNFTType | DataPriceFeed,
  theme: AppThemeType,
  dataClaimable: ClaimableType | null,
  insets: EdgeInsets,
  t: TFunction<"translation", undefined>,
  loading = true,
  inHome = false
) => {
  const styles = containerStyles(theme, insets);
  return (
    <View style={[appStyles.flexRow, appStyles.mv10]}>
      <View
        style={[
          appStyles.justifyContentBetween,
          appStyles.alignItemsCenter,
          appStyles.flex1,
          appStyles.flexRow,
        ]}
      >
        <View style={[appStyles.justifyContentBetween, appStyles.flex1]}>
          <LoadingWrapper
            loading={loading}
            skeletonWidth={150}
            skeletonHeight={15}
          >
            <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
              <AppText
                title={`#${item?.nftId}`}
                variant={TextVariantKeys.bodyMLarge}
                textColor={
                  !inHome
                    ? appColors.main.tokyoRed
                    : theme.colors.text_on_surface_text_high
                }
                maxFontSizeMultiplier={1.2}
                numberOfLines={1}
              />
              {dataClaimable?.projectNftProtocol?.name && (
                <View
                  style={[
                    appStyles.ml5,
                    dataClaimable?.projectNftProtocol?.name?.length > 16
                      ? styles.protocolNFTViewContainer
                      : undefined,
                  ]}
                >
                  <ProtocolNFTView
                    loading={loading}
                    theme={theme}
                    protocol_name={dataClaimable?.projectNftProtocol?.name}
                    project_image={
                      dataClaimable?.projectNftProtocol?.logo as string
                    }
                  />
                </View>
              )}
            </View>
          </LoadingWrapper>

          <LoadingWrapper
            loading={loading}
            skeletonWidth={100}
            skeletonHeight={15}
          >
            <AppText
              title={dataClaimable?.projectNFT?.name}
              variant={TextVariantKeys.bodyMSmall}
              textColor={theme.colors.text_on_surface_text_light}
              styles={appStyles.mt5}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            />
          </LoadingWrapper>
        </View>
        <LoadingWrapper
          loading={loading}
          skeletonWidth={50}
          containerSkeleton={appStyles.ml10}
          skeletonHeight={15}
        >
          <View>
            <AppText
              title={`${Utils.formattedAmountClaim(item?.amount)}`}
              variant={TextVariantKeys.bodyMLarge}
              textColor={appColors.main.tokyoRed}
              styles={[appStyles.textAlignRight]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            />
            <AppText
              title={dataClaimable?.projectToken?.symbol}
              variant={TextVariantKeys.bodyMLarge}
              textColor={theme.colors.text_on_surface_text_high}
              styles={[appStyles.textAlignRight]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
            />
          </View>
        </LoadingWrapper>
      </View>
    </View>
  );
};

export const renderNFTYouOwnList = (
  item: OwnedNFTType,
  theme: AppThemeType,
  dataClaimable: DataClaimableType,
  t: TFunction<"translation", undefined>,
  loading: boolean,
  inModal = false
) => {
  return (
    <View style={[appStyles.flexRow, appStyles.mv10]}>
      <View
        style={[
          appStyles.justifyContentBetween,
          appStyles.alignItemsCenter,
          appStyles.flex1,
          appStyles.flexRow,
        ]}
      >
        <View style={[appStyles.flex1]}>
          <View
            style={[
              appStyles.flex5,
              appStyles.pL10,
              appStyles.flexRow,
              appStyles.justifyContentBetween,
              appStyles.alignItemsCenter,
            ]}
          >
            <LoadingWrapper
              loading={loading}
              skeletonWidth={150}
              skeletonHeight={15}
            >
              <AppText
                title={`${t(LanguageKey.nft_id)} #${item?.nftId}`}
                variant={TextVariantKeys.bodyMLarge}
                textColor={
                  !inModal
                    ? appColors.main.tokyoRed
                    : theme.colors.text_on_surface_text_high
                }
              />
            </LoadingWrapper>

            <LoadingWrapper
              loading={loading}
              skeletonWidth={50}
              containerSkeleton={appStyles.ml10}
              skeletonHeight={15}
            >
              <AppText
                title={`${item?.amount?.toLocaleString()}`}
                variant={TextVariantKeys.bodyMLarge}
                textColor={appColors.main.tokyoRed}
                styles={appStyles.mbt5}
              />
            </LoadingWrapper>
          </View>
          <View
            style={[
              appStyles.flex5,
              appStyles.pL10,
              appStyles.flexRow,
              appStyles.justifyContentBetween,
              appStyles.alignItemsCenter,
            ]}
          >
            <LoadingWrapper
              loading={loading}
              skeletonWidth={100}
              skeletonHeight={15}
            >
              <AppText
                title={dataClaimable?.projectNFT?.name}
                variant={TextVariantKeys.bodyMSmall}
                textColor={
                  !inModal
                    ? appColors.main.tokyoRed
                    : theme.colors.text_on_surface_text_light
                }
              />
            </LoadingWrapper>

            <LoadingWrapper
              loading={loading}
              skeletonWidth={50}
              skeletonHeight={30}
            >
              <Pressable
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 12,
                  backgroundColor: theme.colors.label_surface_button_light,
                  borderRadius: 4,
                }}
              >
                <AppText
                  titleWithI18n={LanguageKey.NFT_you_own_action_add}
                  variant={TextVariantKeys.bodyMLarge}
                  textColor={theme.colors.text_on_surface_text_high}
                />
              </Pressable>
            </LoadingWrapper>
          </View>
        </View>
      </View>
    </View>
  );
};

export const JettonPriceChart: React.FC<JettonPriceChartProps> = ({
  gottingModal,
  onCloseGottingModal,
  itemGotting,
  _handleShowChartAsync,
}) => {
  const theme = useAppTheme();
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const styles = containerStyles(theme, insets);
  return (
    <AppModal
      keepBottomButton={false}
      visible={gottingModal}
      onTouchOutside={onCloseGottingModal}
      footerView={
        <View style={styles.webviewContainer}>
          <View style={styles.headerChart}>
            <Pressable onPress={onCloseGottingModal}>
              <AppText
                titleWithI18n={LanguageKey.common_text_done}
                variant={TextVariantKeys.bodyMTiny}
                textColor={appColors.main.darkGreen}
              />
            </Pressable>
            <View>
              <Pressable
                onPress={onCloseGottingModal}
                style={styles.closeButton}
              ></Pressable>
              <Pressable
                onPress={onCloseGottingModal}
                style={styles.closeButton}
              ></Pressable>
            </View>
          </View>
          <WebView
            source={{
              uri: "https://www.geckoterminal.com/ton/pools/EQATnq6W2xv10C19LNlC26xFtTV1fbzMkXmXQCWHqtv6Okf7",
            }}
            originWhitelist={["*"]}
            automaticallyAdjustContentInsets={false}
            style={[appStyles.flex1]}
            startInLoadingState={true}
          />
        </View>
      }
    />
  );
};

export const JETTONDetailsAndPickingChart: React.FC<
  JETTONDetailsAndPickingChartProps
> = ({
  theme,
  dataClaimable,
  t,
  enableViewChart,
  JETTON_name,
  JETTON_symbol,
  JETTON_contract_address,
  _handleShowChartAsync,
  loading,
}) => {
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const styles = containerStyles(theme, insets);
  return (
    <>
      <View
        style={[
          appStyles.flexRow,
          appStyles.justifyContentBetween,
          appStyles.pT15,
          appStyles.alignItemsCenter,
        ]}
      >
        <LoadingWrapper
          loading={loading}
          skeletonWidth={100}
          skeletonHeight={15}
        >
          <AppText
            titleWithI18n={t(LanguageKey.claim_about_JETTON, {
              symbol: dataClaimable?.projectToken?.symbol,
            })}
            variant={TextVariantKeys.labelCap}
            textColor={theme.colors.text_on_surface_text_light}
            maxFontSizeMultiplier={1.2}
          />
        </LoadingWrapper>
        <LoadingWrapper
          loading={loading}
          skeletonWidth={170}
          skeletonHeight={15}
        >
          {dataClaimable &&
            dataClaimable.project &&
            dataClaimable.project.tokenPriceChart && (
              <Pressable onPress={enableViewChart}>
                <AppText
                  titleWithI18n={t(LanguageKey.claim_view_JETTON_price_chart, {
                    symbol: dataClaimable?.projectToken?.symbol,
                  })}
                  variant={TextVariantKeys.bodyMLarge}
                  textColor={appColors.main.tokyoRed}
                  styles={[styles.decoration]}
                  maxFontSizeMultiplier={1.2}
                />
              </Pressable>
            )}
        </LoadingWrapper>
      </View>
      <View style={styles.cartWrapper}>
        <View
          style={[
            appStyles.justifyContentBetween,
            appStyles.alignItemsCenter,
            appStyles.flexRow,
          ]}
        >
          <LoadingWrapper
            loading={loading}
            skeletonWidth={80}
            skeletonHeight={15}
          >
            <AppText
              titleWithI18n={LanguageKey.claim_token_name}
              variant={TextVariantKeys.bodyMMedium}
              textColor={theme.colors.text_on_surface_text_light}
            />
          </LoadingWrapper>
          <LoadingWrapper
            loading={loading}
            skeletonWidth={110}
            skeletonHeight={15}
          >
            <AppText
              title={JETTON_name}
              variant={TextVariantKeys.bodyMLarge}
              textColor={theme.colors.text_on_surface_text_high}
              styles={[appStyles.flex1, appStyles.textAlignRight]}
            />
          </LoadingWrapper>
        </View>
        <View
          style={[
            appStyles.justifyContentBetween,
            appStyles.alignItemsCenter,
            appStyles.flexRow,
            appStyles.pV15,
          ]}
        >
          <LoadingWrapper
            loading={loading}
            skeletonWidth={70}
            skeletonHeight={15}
          >
            <AppText
              titleWithI18n={LanguageKey.claim_symbol_tag}
              variant={TextVariantKeys.bodyMMedium}
              textColor={theme.colors.text_on_surface_text_light}
            />
          </LoadingWrapper>
          <LoadingWrapper
            loading={loading}
            skeletonWidth={100}
            skeletonHeight={15}
          >
            <AppText
              title={JETTON_symbol}
              variant={TextVariantKeys.bodyMLarge}
              textColor={theme.colors.text_on_surface_text_high}
              styles={[appStyles.flex1, appStyles.textAlignRight]}
            />
          </LoadingWrapper>
        </View>
        <View
          style={[
            appStyles.justifyContentBetween,
            appStyles.alignItemsCenter,
            appStyles.flexRow,
          ]}
        >
          <LoadingWrapper
            loading={loading}
            skeletonWidth={100}
            skeletonHeight={15}
          >
            <AppText
              titleWithI18n={LanguageKey.claim_contract_address}
              variant={TextVariantKeys.bodyMMedium}
              textColor={theme.colors.text_on_surface_text_light}
              styles={appStyles.flex6}
            />
          </LoadingWrapper>
          <LoadingWrapper
            loading={loading}
            skeletonWidth={150}
            skeletonHeight={15}
          >
            <AppText
              title={WalletUtils.getShortMoreAddress(JETTON_contract_address)}
              variant={TextVariantKeys.bodyMLarge}
              textColor={theme.colors.text_on_surface_text_high}
              numberOfLines={1}
              styles={[appStyles.flex4, appStyles.textAlignRight]}
            />
          </LoadingWrapper>
        </View>
      </View>
    </>
  );
};

export const ViewMorePriceFeedComponent: React.FC<ViewMorePriceFeedProps> = ({
  action,
  theme,
  loading,
}) => {
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const styles = containerStyles(theme, insets);

  return (
    <Pressable
      onPress={action}
      style={[
        appStyles.justifyContentCenter,
        appStyles.alignItemsCenter,
        appStyles.pT15,
        appStyles.pB10,
      ]}
    >
      <LoadingWrapper
        loading={loading}
        skeletonWidth={100}
        containerSkeleton={appStyles.mbt5}
        skeletonHeight={20}
      >
        <TouchableOpacity
          style={[appStyles.flexRow, appStyles.alignItemsCenter]}
          onPress={action}
        >
          <View style={appStyles.mr5}>
            <AppText
              titleWithI18n={LanguageKey.project_details_see_more}
              variant={TextVariantKeys.titleSmall}
              textColor={theme.colors.surface_surface_brand}
            />
          </View>
          {<ArrowForward2SvgIcon />}
        </TouchableOpacity>
      </LoadingWrapper>
    </Pressable>
  );
};

const RenderTabBarComponent = <T extends Route>({
  navigationState,
  jumpTo,
}: RenderNFTCollectionTabBarProps<T>): JSX.Element => {
  const theme = useAppTheme();
  const styles = useTabStyles(theme);
  const dispatch = useAppDispatch();
  const currentIndex = useAppSelector(
    (state: RootState) => state.explore.tabContainer.index
  );

  const handleTabPress = (key: string, index: number) => {
    jumpTo(key);
    dispatch(setTabIndex(index));
  };

  return (
    <View style={styles.tabBarContainer}>
      {navigationState.routes.map((route, i) => (
        <Pressable
          key={route.key}
          onPress={() => handleTabPress(route.key, i)}
          style={[
            styles.tabBarStyle,
            {
              borderBottomColor:
                currentIndex === i
                  ? appColors.main.tokyoRed
                  : appStyles.backgroundTransparent.backgroundColor,
            },
          ]}
        >
          <AppText
            titleWithI18n={route.title}
            variant={TextVariantKeys.titleSmall}
            styles={[appStyles.textAlignCenter]}
            textColor={
              currentIndex === i
                ? theme.colors.text_on_surface_text_high
                : theme.colors.text_on_surface_text_light
            }
          />
        </Pressable>
      ))}
    </View>
  );
};

export const RenderTabBar = React.memo(
  RenderTabBarComponent,
  (prevProps, nextProps) =>
    prevProps.navigationState.index === nextProps.navigationState.index
);
export const ClaimTokenSheetHeader: React.FC<ClaimTokenHeaderProps> = ({
  closeModal,
}) => {
  const theme = useAppTheme();
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const styles = containerStyles(theme, insets);
  return (
    <View style={[appStyles.mh25, appStyles.flex1]}>
      <View style={[appStyles.flexRow, appStyles.pB15]}>
        <View style={[appStyles.center, appStyles.flex1, appStyles.pL15]}>
          <AppText
            titleWithI18n={LanguageKey.claim_token_title}
            variant={TextVariantKeys.titleLarge}
          />
        </View>
        <View style={[styles.closeContainer]}>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Close2SvgIcon />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const TokenWhatYouGotHeader: React.FC<TokenWhatYouGotHeaderProps> = ({
  closeModal,
  theme,
}) => {
  return (
    <View style={[appStyles.mh25, appStyles.pB15]}>
      <View style={[appStyles.flexRow]}>
        <View style={[appStyles.center, appStyles.flex1]}>
          <AppText
            titleWithI18n={LanguageKey.NFT_you_own}
            variant={TextVariantKeys.titleLarge}
          />
        </View>
      </View>
    </View>
  );
};

export const CollectionModal: React.FC<CollectionModalProps> = ({
  collectionModal,
  handleWithCollection,
  onCloseCollectionModal,
  itemCollectionCheck,
}) => {
  const theme = useAppTheme();
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const styles = containerStyles(theme, insets);

  return (
    <AppModal
      visible={collectionModal}
      onTouchOutside={onCloseCollectionModal}
      titleWithI18n={itemCollectionCheck?.name}
      onPress={handleWithCollection}
      buttonTitleWithI18n={LanguageKey.add_nft_to_my_collection}
      footerView={
        <View style={styles.modalCollectionContainer}>
          {itemCollectionCheck.image ? (
            <Image
              source={{
                uri: itemCollectionCheck.image
                  ? itemCollectionCheck.image
                  : appImages.NFTDefault,
              }}
              style={styles.imageInsideModal}
            />
          ) : (
            <Image
              source={appImages.NFTDefault}
              style={styles.imageInsideModal}
            />
          )}
        </View>
      }
    />
  );
};

export const ToggleSeeMoreView: React.FC<ToggleSeeMoreViewProps> = ({
  textShown,
  toggleNumberOfLines,
}) => {
  const { t } = useTranslation();
  const insets: EdgeInsets = useAppSafeAreaInsets();
  const theme: AppThemeType = useAppTheme();
  const styles = containerStyles(theme, insets);
  return (
    <>
      {!textShown ? (
        <AppText
          onPress={toggleNumberOfLines}
          styles={styles.toggleLineText}
          title={
            textShown
              ? `${t(LanguageKey.project_details_read_less)}`
              : `${t(LanguageKey.project_details_see_more)}`
          }
        />
      ) : (
        <AppText
          onPress={toggleNumberOfLines}
          styles={styles.toggleLineText}
          title={`${t(LanguageKey.project_details_read_less)}`}
        />
      )}
    </>
  );
};
