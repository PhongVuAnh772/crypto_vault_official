import React from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWrapper } from "src/components";
import RNCustomInput from "src/components/layout/SearchInput";
import {
  DeleteTextSvgIcon,
  SearchSvgIcon,
} from "src/core/constants/AppIconsSvg";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import RootNavigationType from "src/navigation/stacks/type/NavigationType";
import {
  LoadingListPriceFeedView,
  RenderPriceFeedNew,
} from "./PriceFeedList.component";
import { useConfirmClaimToken } from "./PriceFeedList.hook";
import { useStyles } from "./PriceFeedList.style";

const PriceFeedList: React.FC<RootNavigationType> = ({ navigation, route }) => {
  const {
    theme,
    dataClaimable,
    commonBackAction,
    loading,
    searchValue,
    handleSearchChange,
    cleanSearch,
    dataPriceFeed,
    handleOnEndReached,
    enableScrollLoadMore,
    insets,
  } = useConfirmClaimToken({
    navigation,
    route,
  });

  const styles = useStyles(theme);
  return (
    <ScreenWrapper
      enableHeader
      paddingTop
      backAction={commonBackAction}
      headerTitleWithI18n={LanguageKey.project_details_price_feed}
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

        {!loading && dataPriceFeed && dataPriceFeed?.length > 0 ? (
          <View
            style={[
              styles.projectContainer,
              styles.project,
              styles.shadowContainer,
              {
                backgroundColor:
                  dataPriceFeed && dataPriceFeed?.length > 0
                    ? theme.colors.surface_surface_high
                    : undefined,
              },
            ]}
          >
            <FlatList
              bounces={true}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              data={dataPriceFeed}
              renderItem={({ item }) => (
                <RenderPriceFeedNew
                  item={item}
                  theme={theme}
                  dataClaimable={dataClaimable}
                  insets={insets}
                  loading={loading}
                  inHome={true}
                />
              )}
              onEndReached={searchValue !== "" ? undefined : handleOnEndReached}
              onEndReachedThreshold={0.2}
              ListFooterComponent={
                enableScrollLoadMore ? (
                  <View style={appStyles.pT15}>
                    <ActivityIndicator />
                  </View>
                ) : null
              }
            />
          </View>
        ) : (
          <LoadingListPriceFeedView isLoading={loading} />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default PriceFeedList;
