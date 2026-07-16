import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWrapper } from "src/components";
import AppButton from "src/components/common/AppButton";
import AppImage from "src/components/common/AppImage";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import { CheckSvgIcon, Copy2SvgIcon } from "src/core/constants/AppIconsSvg";
import { appImages } from "src/core/constants/AppImages";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import walletUtils from "src/core/utils/walletUtils";
import { AvatarNFT } from "src/features/home/NFTCollection/components";
import useStyles from "src/features/home/NFTCollection/evm/NFTDetail/NFTDetail.style";
import NFTUnAddedDetailStyles from "../index.style";
import useNFTUnAddedDetailEVM from "./NFTUnAddedDetail.hook";
import { NFTUnAddedDetailEVMViewProps } from "./NFTUnAddedDetail.type";

const NFTUnAddedDetailEVMView: React.FC<NFTUnAddedDetailEVMViewProps> = ({
  navigation,
  detail,
  added,
  archived,
}) => {
  const {
    insets,
    handleAddNFT,
    loadingHandle,
    dataFetching,
    isInitialLoading,
    currentProtocol,
    theme,
    handlePressURL,
    setIsInitialLoading,
    copyAction,
    isTon,
    isEVM,
    isERC721,
    isERC1155,
  } = useNFTUnAddedDetailEVM({
    navigation,
    detail,
  });
  const NFTUnAddedDetailStyle = NFTUnAddedDetailStyles(insets, theme);
  const NFTDetailStyle = useStyles(theme, insets);
  return (
    <ScreenWrapper
      enableHeader
      paddingTop
      mainStyle={[NFTUnAddedDetailStyle.flex1]}
      headerTitleWithI18n={LanguageKey.un_added_nfts_nft_you_own}
      headerTextVariant={TextVariantKeys.titleLarge}
      backgroundColor={theme.colors.surface_surface_default}
    >
      <ScrollView style={NFTUnAddedDetailStyle.containerUnAddedDetail}>
        <View style={NFTUnAddedDetailStyle.boxUnAddedDetail}>
          {isEVM && isERC1155 && (
            <AvatarNFT
              isLoading={isInitialLoading}
              setLoadings={(uri, value) => setIsInitialLoading(value)}
              uri={dataFetching?.resMetadata?.image ?? ""}
              uriNetwork={currentProtocol?.logo ?? ""}
              loadingHeight={250}
            />
          )}
          {isEVM && isERC1155 && added && (
            <View
              style={[
                NFTUnAddedDetailStyle.pV2,
                NFTUnAddedDetailStyle.pH6,
                NFTUnAddedDetailStyle.addedERC1155Container,
                appStyles.flexRow,
                appStyles.alignItemsCenter,
              ]}
            >
              <CheckSvgIcon
                color={appColors.neutral.white}
                width="15"
                height="15"
              />
              <AppText
                titleWithI18n={LanguageKey.common_text_added}
                styles={appStyles.ml5}
                variant={TextVariantKeys.bodyMSmall}
                textColor={appColors.neutral.white}
                numberOfLines={1}
                allowFontScaling={true}
                maxFontSizeMultiplier={1.4}
              />
            </View>
          )}
          <View style={[NFTUnAddedDetailStyle.content]}>
            {isEVM && isERC721 && (
              <AppImage
                isLoading={isInitialLoading}
                uri={dataFetching?.resMetadata?.image ?? ""}
                styleNetworkImage={NFTDetailStyle.network}
                styleImage={NFTUnAddedDetailStyle.nftImage}
                networkImage={currentProtocol?.logo ?? ""}
                setIsLoading={() => setIsInitialLoading}
                defaultImage={appImages.NFTDefault}
              />
            )}

            {isEVM && isERC721 && added && (
              <View
                style={[
                  NFTUnAddedDetailStyle.pV2,
                  NFTUnAddedDetailStyle.pH6,
                  NFTUnAddedDetailStyle.addedContainer,
                  appStyles.flexRow,
                  appStyles.alignItemsCenter,
                ]}
              >
                <CheckSvgIcon
                  color={appColors.neutral.white}
                  width="15"
                  height="15"
                />
                <AppText
                  titleWithI18n={LanguageKey.common_text_added}
                  styles={appStyles.ml5}
                  variant={TextVariantKeys.bodyMSmall}
                  textColor={appColors.neutral.white}
                  numberOfLines={1}
                  allowFontScaling={true}
                  maxFontSizeMultiplier={1.4}
                />
              </View>
            )}
            {isTon && added && (
              <View
                style={[
                  NFTUnAddedDetailStyle.pV2,
                  NFTUnAddedDetailStyle.pH6,
                  NFTUnAddedDetailStyle.addedContainer,
                  appStyles.flexRow,
                  appStyles.alignItemsCenter,
                ]}
              >
                <CheckSvgIcon
                  color={appColors.neutral.white}
                  width="15"
                  height="15"
                />
                <AppText
                  titleWithI18n={LanguageKey.common_text_added}
                  styles={appStyles.ml5}
                  variant={TextVariantKeys.bodyMSmall}
                  textColor={appColors.neutral.white}
                  numberOfLines={1}
                  allowFontScaling={true}
                  maxFontSizeMultiplier={1.4}
                />
              </View>
            )}
            <View style={NFTUnAddedDetailStyle.p16}>
              <View style={NFTUnAddedDetailStyle.nameAndId}>
                <AppText
                  titleWithI18n={`${dataFetching?.resMetadata?.name ?? LanguageKey.un_added_nfts_unnamed_nft}`}
                  variant={TextVariantKeys.titleLarge}
                  textColor={appColors.neutral.n800}
                />
                <AppText
                  title={`#${detail.token_id}`}
                  variant={TextVariantKeys.bodyMMedium}
                  textColor={appColors.main.tokyoRed}
                  styles={NFTUnAddedDetailStyle.mt5}
                />
              </View>
              {isEVM && (
                <View style={NFTUnAddedDetailStyle.information}>
                  <AppText
                    titleWithI18n={LanguageKey.nft_token_standard}
                    variant={TextVariantKeys.bodyRMedium}
                    textColor={appColors.neutral.n800}
                    styles={NFTUnAddedDetailStyle.tokenStandard}
                  />
                  <AppText
                    title={detail.contract_type}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={appColors.neutral.n800}
                  />
                </View>
              )}

              <View style={NFTUnAddedDetailStyle.information}>
                <AppText
                  titleWithI18n={LanguageKey.nft_asset_contract}
                  variant={TextVariantKeys.bodyRMedium}
                  textColor={appColors.neutral.n800}
                  styles={NFTUnAddedDetailStyle.tokenStandard}
                />
                <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
                  <TouchableOpacity onPress={handlePressURL}>
                    <AppText
                      title={walletUtils.getShortAddress(detail?.token_address)}
                      variant={TextVariantKeys.bodyMMedium}
                      textColor={appColors.main.tokyoRed}
                      styles={NFTUnAddedDetailStyle.underline}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={copyAction}
                    style={NFTDetailStyle.ml5}
                  >
                    <Copy2SvgIcon width={20} height={20} />
                  </TouchableOpacity>
                </View>
              </View>
              {isEVM && isERC1155 && (
                <View style={NFTUnAddedDetailStyle.information}>
                  <AppText
                    titleWithI18n={LanguageKey.project_detail_quantity}
                    variant={TextVariantKeys.bodyRMedium}
                    textColor={appColors.neutral.n800}
                    styles={NFTUnAddedDetailStyle.tokenStandard}
                  />
                  <AppText
                    title={detail?.amount ?? 1}
                    variant={TextVariantKeys.bodyMMedium}
                    textColor={appColors.neutral.n800}
                  />
                </View>
              )}
            </View>
          </View>
          <View style={NFTUnAddedDetailStyle.description}>
            <AppText
              titleWithI18n={LanguageKey.common_descriptions}
              variant={TextVariantKeys.bodyRMedium}
              textColor={appColors.neutral.n800}
              styles={NFTUnAddedDetailStyle.tokenStandard}
            />
            <AppText
              title={dataFetching?.resMetadata?.description ?? ""}
              variant={TextVariantKeys.bodyMMedium}
              textColor={appColors.neutral.n800}
              styles={NFTUnAddedDetailStyle.mt8}
            />
          </View>
        </View>
      </ScrollView>

      {!added && !archived && (
        <View style={NFTUnAddedDetailStyle.buttonAddCollection}>
          <AppButton
            titleWithI18n={
              loadingHandle ? "" : LanguageKey.add_nft_to_my_collection
            }
            textVariant={TextVariantKeys.bodyMMedium}
            textColor={appColors.neutral.white}
            styles={NFTUnAddedDetailStyle.button}
            onPress={handleAddNFT}
            isLoading={loadingHandle}
            disabled={loadingHandle}
            icon={
              loadingHandle ? (
                <ActivityIndicator
                  color={appColors.neutral.black}
                  size="small"
                />
              ) : null
            }
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

export default NFTUnAddedDetailEVMView;
