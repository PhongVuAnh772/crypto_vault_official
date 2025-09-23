import { TFunction } from "i18next";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import AppImage from "src/components/common/AppImage";
import AppSkeletonLoading from "src/components/common/AppSkeletonLoading";
import AppText from "src/components/common/AppText";
import appColors from "src/core/constants/AppColors";
import {
  CalendarClaimSvgIcon,
  EmptyClaimListSvgIcon,
} from "src/core/constants/AppIconsSvg";
import AppToastType from "src/core/enum/AppToastType";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";
import DateTimeUtils from "src/core/utils/dateTimeUtils";
import { ProtocolNFTView } from "../../projectDetails/confirm/confirmClaimToken.component";
import { LoadingWrapperProps } from "../NFTCollection/NFTCollectionTab/evm/NFTCollection.type";
import useStyles from "./explore.style";
import {
  EndReachedFooterProps,
  LoadingExploreWrapperProps,
  LoadingListViewType,
  ProjectListItem,
} from "./explore.type";

export const RenderProjectClaimList: React.FC<{
  item: ProjectListItem;
  theme: AppThemeType;
  navigateToProjectDetail: (props: ProjectListItem) => void;
  formatDateToDDMM: (props: string) => void;
  formatDateToCustomFormat: (props: string) => void;
  isOngoing: (date: string) => boolean;
  isUpComing: (date: string) => boolean;
  t: TFunction<"translation", undefined>;
  firstLoading: boolean;
}> = ({
  item,
  theme,
  navigateToProjectDetail,
  formatDateToDDMM,
  formatDateToCustomFormat,
  isOngoing,
  isUpComing,
  t,
  firstLoading,
}) => {
  const styles = useStyles(theme);
  const projectStatus = (() => {
    const ongoing = isOngoing(item.endDate);
    const upcoming = isUpComing(item.startDate);
    if (upcoming) return t(LanguageKey.common_text_upcoming);
    if (ongoing) return t(LanguageKey.common_text_ongoing);
    return t(LanguageKey.common_text_expired);
  })();
  let statusBackgroundColor: string;
  if (projectStatus === t(LanguageKey.common_text_ongoing)) {
    statusBackgroundColor = theme.colors.success_container;
  } else if (projectStatus === t(LanguageKey.common_text_upcoming)) {
    statusBackgroundColor = appColors.functional.upcoming;
  } else {
    statusBackgroundColor = theme.colors.surface_surface_default;
  }

  let statusTextColor: string;
  if (projectStatus === t(LanguageKey.common_text_ongoing)) {
    statusTextColor = appColors.functional.green;
  } else if (projectStatus === t(LanguageKey.common_text_upcoming)) {
    statusTextColor = appColors.neutral.white;
  } else {
    statusTextColor = theme.colors.text_on_surface_text_medium;
  }

  return (
    <Pressable
      onPress={() => navigateToProjectDetail(item)}
      key={item._id}
      style={[appStyles.mv10]}
    >
      <LoadingWrapper
        loading={firstLoading}
        skeletonWidth={"100%"}
        skeletonHeight={160}
      >
        <AppImage
          uri={item.projectBanner}
          styleImage={styles.image}
          onPress={() => navigateToProjectDetail(item)}
          resizeMode="cover"
        />
      </LoadingWrapper>

      <View style={styles.itemContainer}>
        <View style={[appStyles.mt5]}>
          <View>
            <LoadingWrapper
              loading={firstLoading}
              skeletonWidth={160}
              skeletonHeight={30}
            >
              <AppText
                title={item.projectName}
                variant={TextVariantKeys.titleSmall}
                textColor={theme.colors.text_on_surface_text_high}
              />
            </LoadingWrapper>
          </View>
          <View
            style={[
              appStyles.flexRow,
              appStyles.justifyContentBetween,
              appStyles.alignItemsCenter,
              appStyles.mt5,
            ]}
          >
            <LoadingWrapper
              loading={firstLoading}
              skeletonWidth={170}
              skeletonHeight={15}
            >
              <View
                style={[
                  appStyles.flexRow,
                  appStyles.alignItemsCenter,
                  styles.endDateContainer,
                ]}
              >
                <CalendarClaimSvgIcon />
                <AppText
                  title={`${t(LanguageKey.common_text_ends_at)} ${DateTimeUtils.formatTimeWithTimezone(
                    item.endDate,
                    "YYYY/MM/DD hh:mm A"
                  )}`}
                  maxFontSizeMultiplier={1.2}
                  variant={TextVariantKeys.bodyRSmall}
                  textColor={theme.colors.text_on_surface_text_medium}
                  styles={styles.endDate}
                />
              </View>
            </LoadingWrapper>
            <ProtocolNFTView
              theme={theme}
              protocol_name={item.projectProtocolSymbol}
              project_image={item.projectProtocolLogo}
              loading={firstLoading}
              enableDivider={false}
              usingWithExplore
            />
          </View>
        </View>
      </View>
      <LoadingWrapper loading={firstLoading} containerSkeleton={styles.status}>
        <View
          style={[
            styles.status,
            {
              backgroundColor: statusBackgroundColor,
            },
          ]}
        >
          <AppText
            title={projectStatus}
            variant={TextVariantKeys.bodyMSmall}
            textColor={statusTextColor}
          />
        </View>
      </LoadingWrapper>
    </Pressable>
  );
};

export const LoadingListView: React.FC<LoadingListViewType> = ({
  isLoading,
  refreshing,
  onRefresh,
}) => {
  const theme = useAppTheme();
  const getView = () => {
    if (!isLoading) {
      return <NotFoundProject />;
    }
    return (
      <ScrollView
        style={appStyles.flex1}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.backdrop}
          />
        }
      >
        <LoadingExploreWrapper firstLoading={true} theme={theme} />
        <View style={appStyles.mt15}>
          <LoadingExploreWrapper firstLoading={true} theme={theme} />
        </View>
        <View style={appStyles.mt15}>
          <LoadingExploreWrapper firstLoading={true} theme={theme} />
        </View>
      </ScrollView>
    );
  };

  return getView();
};

export const handlingErrorFlow = (t: TFunction<"translation", undefined>) => {
  Utils.showToast({
    msg: t(LanguageKey.claim_data_error_status),
    type: AppToastType.error,
  });
};

export const LoadingExploreWrapper: React.FC<LoadingExploreWrapperProps> = ({
  firstLoading,
  theme,
}) => {
  const styles = useStyles(theme);
  return (
    <React.Fragment>
      <LoadingWrapper
        loading={true}
        skeletonWidth={"100%"}
        skeletonHeight={160}
      >
        <View />
      </LoadingWrapper>
      <View style={styles.itemContainer}>
        <View style={[appStyles.mt5]}>
          <View>
            <LoadingWrapper
              loading={true}
              skeletonWidth={160}
              skeletonHeight={30}
            >
              <View />
            </LoadingWrapper>
          </View>
          <View
            style={[
              appStyles.flexRow,
              appStyles.justifyContentBetween,
              appStyles.alignItemsCenter,
              appStyles.mt5,
            ]}
          >
            <LoadingWrapper
              loading={true}
              skeletonWidth={170}
              skeletonHeight={15}
            >
              <View />
            </LoadingWrapper>
            <ProtocolNFTView
              theme={theme}
              protocol_name={""}
              project_image={""}
              loading={true}
              enableDivider={false}
            />
          </View>
        </View>
      </View>
      <LoadingWrapper loading={firstLoading} containerSkeleton={styles.status}>
        <View />
      </LoadingWrapper>
    </React.Fragment>
  );
};

export const NotFoundProject = () => {
  const theme = useAppTheme();
  const styles = useStyles(theme);
  return (
    <View style={styles.notFoundContainer}>
      <EmptyClaimListSvgIcon style={styles.noAssetFoundIcon} />
      <AppText
        titleWithI18n={LanguageKey.claim_list_empty_title}
        variant={TextVariantKeys.titleLarge}
        styles={styles.titleNoAssetFound}
      />
      <AppText
        titleWithI18n={LanguageKey.claim_list_empty_description}
        variant={TextVariantKeys.bodyRMedium}
        styles={styles.titleNoAssetFound}
      />
    </View>
  );
};

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading,
  children,
  skeletonHeight = 20,
  skeletonWidth = 100,
  containerSkeleton,
}) => {
  if (loading) {
    return (
      <View style={containerSkeleton}>
        <AppSkeletonLoading width={skeletonWidth} height={skeletonHeight} />
      </View>
    );
  }
  return <>{children}</>;
};

export const EndReachedFooter: React.FC<EndReachedFooterProps> = ({
  loadMore,
  theme,
}) => {
  return (
    <>
      {loadMore && (
        <View style={appStyles.pV30}>
          <ActivityIndicator color={theme.colors.backdrop} size="large" />
        </View>
      )}
    </>
  );
};
