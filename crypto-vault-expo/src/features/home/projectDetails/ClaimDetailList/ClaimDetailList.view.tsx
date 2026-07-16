import React from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { ScreenWrapper } from "src/components";
import AppText from "src/components/common/AppText";
import RNCustomInput from "src/components/layout/SearchInput";
import appColors from "src/core/constants/AppColors";
import {
  DeleteTextSvgIcon,
  EmptyTransactionSvgIcon,
  SearchSvgIcon,
} from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import { renderClaimDetailList } from "./ClaimDetailList.component";
import { useClaimDetailList } from "./ClaimDetailList.hook";
import { useStyles } from "./ClaimDetailList.style";

const ClaimDetailList: React.FC<RootNavigationType> = ({
  navigation,
  route,
}) => {
  const {
    theme,
    commonBackAction,
    loading,
    searchValue,
    handleSearchChange,
    cleanSearch,
    filteredData,
  } = useClaimDetailList({
    navigation,
    route,
  });
  const styles = useStyles(theme);
  return (
    <ScreenWrapper
      enableHeader
      paddingTop
      backAction={commonBackAction}
      headerTitleWithI18n={LanguageKey.NFT_detail_claimed_title}
      headerTextVariant={TextVariantKeys.titleLarge}
      backgroundColor={theme.colors.surface_surface_default}
    >
      <View style={styles.container}>
        <RNCustomInput
          disabled={!loading}
          placeholder={LanguageKey.search_nft_id}
          value={searchValue}
          containerStyle={styles.input}
          setValue={handleSearchChange}
          keyboardType="default"
          leftIcon={<SearchSvgIcon color={theme.colors.outline} />}
          secureTextEntry={false}
          RightIcon={
            searchValue !== "" && (
              <TouchableOpacity onPress={cleanSearch}>
                <DeleteTextSvgIcon />
              </TouchableOpacity>
            )
          }
        />
        <View
          style={[
            styles.projectContainer,
            styles.project,
            {
              backgroundColor:
                filteredData && filteredData?.length > 0
                  ? theme.colors.surface_surface_high
                  : undefined,
            },
          ]}
        >
          <FlatList
            bounces={false}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            data={filteredData}
            renderItem={({ item }) =>
              renderClaimDetailList(item, theme, loading)
            }
            keyExtractor={(item) => item.nftId}
            ListEmptyComponent={
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
            }
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ClaimDetailList;
