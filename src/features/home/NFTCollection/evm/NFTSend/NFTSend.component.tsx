import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppButton from "src/components/common/AppButton";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import { NFTTokenStandard } from "src/core/services/Web3/type";
import useStyles from "./NFTSend.style";
import { NFTGivePermissionTypeView } from "./NFTSend.type";

const NFTGivePermission: React.FC<NFTGivePermissionTypeView> = ({
  handleConfirm,
  feeFollowCurrency,
  isLoading,
  gasEstimate,
  nftData,
}) => {
  const { t } = useTranslation();
  const isERC1155 = nftData.detail.tokenStandard === NFTTokenStandard.ERC1155;
  const title = isERC1155
    ? t(LanguageKey.nft_request_permission_sub_title_1155)
    : t(LanguageKey.nft_request_permission_sub_title, {
        name: `#${nftData.detail.nftId}`,
      });
  const insets = useSafeAreaInsets();
  const NFTSendStyle = useStyles(insets);
  return (
    <>
      <View style={[NFTSendStyle.pd25, NFTSendStyle.flex1]}>
        <AppText
          titleWithI18n={LanguageKey.nft_request_permission_title}
          variant={TextVariantKeys.titleLarge}
          styles={NFTSendStyle.textAlignCenter}
          textColor={appColors.neutral.black}
        />
        <View style={NFTSendStyle.mt15}>
          <AppText
            titleWithI18n={title}
            variant={TextVariantKeys.bodyRMedium}
            styles={NFTSendStyle.textAlignCenter}
            textColor={appColors.neutral.n600}
          />
        </View>
        <View style={NFTSendStyle.boxFee}>
          <View
            style={[
              NFTSendStyle.flexRow,
              NFTSendStyle.justifyContentBetween,
              NFTSendStyle.mt15,
            ]}
          >
            <AppText
              titleWithI18n={LanguageKey.nft_id}
              variant={TextVariantKeys.bodyMMedium}
              styles={NFTSendStyle.textAlignCenter}
              textColor={appColors.neutral.n500}
            />
            <AppText
              title={`#${nftData.detail.nftId}`}
              variant={TextVariantKeys.bodyMMedium}
              styles={NFTSendStyle.textAlignCenter}
              textColor={appColors.neutral.n800}
            />
          </View>
          <View
            style={[
              NFTSendStyle.flexRow,
              NFTSendStyle.justifyContentBetween,
              NFTSendStyle.mt20,
            ]}
          >
            <AppText
              titleWithI18n={LanguageKey.nft_name}
              variant={TextVariantKeys.bodyMMedium}
              styles={NFTSendStyle.textAlignCenter}
              textColor={appColors.neutral.n500}
            />
            <AppText
              title={nftData.detail.name}
              variant={TextVariantKeys.bodyMMedium}
              styles={NFTSendStyle.textAlignCenter}
              textColor={appColors.neutral.n800}
            />
          </View>

          <View
            style={[
              NFTSendStyle.flexRow,
              NFTSendStyle.justifyContentBetween,
              NFTSendStyle.mt20,
              NFTSendStyle.alignItemsCenter,
            ]}
          >
            <AppText
              titleWithI18n={LanguageKey.nft_estimate_gas_fee}
              variant={TextVariantKeys.bodyMMedium}
              styles={NFTSendStyle.textAlignCenter}
              textColor={appColors.neutral.n500}
            />

            <View>
              <AppText
                title={gasEstimate}
                variant={TextVariantKeys.bodyMMedium}
                styles={NFTSendStyle.textAlignCenter}
                textColor={appColors.neutral.n800}
              />
              {feeFollowCurrency && (
                <AppText
                  title={feeFollowCurrency ?? ""}
                  variant={TextVariantKeys.bodyMMedium}
                  styles={NFTSendStyle.textAlignRight}
                  textColor={appColors.neutral.n800}
                />
              )}
            </View>
          </View>
        </View>
      </View>
      <View style={[NFTSendStyle.pH25, NFTSendStyle.pB15]}>
        <AppButton
          onPress={handleConfirm}
          titleWithI18n={LanguageKey.common_text_confirm}
          textVariant={TextVariantKeys.bodyMMedium}
          textColor={appColors.neutral.white}
          styles={NFTSendStyle.button}
          isLoading={isLoading}
        />
      </View>
    </>
  );
};

export { NFTGivePermission };
