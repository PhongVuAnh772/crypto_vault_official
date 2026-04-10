import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import AppButton from "src/components/common/AppButton";
import AppSkeletonLoading from "src/components/common/AppSkeletonLoading";
import AppText from "src/components/common/AppText";
import ViewModeButton from "src/components/common/ViewModeButton/ViewModeButton";
import SkeletonLoadingTransactionHistory from "src/components/homeComponents/SkeletonLoadingTransactionHistory/skeletonLoadingTransactionHistory.view";
import styles from "src/components/layout/ForceUpdateModal/styles";
import ParallaxScrollView from "src/components/layout/ParallaxScrollView";
import SvgView from "src/components/SvgBox";
import appColors from "src/core/constants/AppColors";
import {
  ArrowLeftSvgIcon,
  EmptySvgIcon,
  ReceiveSvgIcon,
  SendSvgIcon,
} from "src/core/constants/AppIconsSvg";
import { appImages } from "src/core/constants/AppImages";
import TextVariantKeys from "src/core/enum/TextVariantKeys";
import useAppSafeAreaInsets from "src/core/hooks/useAppSafeAreaInsets";
import LanguageKey from "src/core/locales/LanguageKey";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";
import { LoadingSkeletonItemAction } from "src/features/home/components/HomeSkeletonLoading";
import useStyles from "./CoinDetails.styles";
import {
  CoinHeaderType,
  ListButtonTokenTrackingProps,
  LoadingViewType,
  TokenBalanceCardProps,
} from "./CoinDetails.type";

export const EmptyView: React.FC<LoadingViewType> = ({ viewMoreHistory }) => {
  return (
    <View style={[appStyles.center, appStyles.flex1, appStyles.mt60]}>
      <View style={appStyles.pd10}>
        <EmptySvgIcon
          color={
            appColors.neutral.n600
          }
        />
      </View>
      <AppText
        titleWithI18n={LanguageKey.transaction_detail_empty_title}
        textColor={
          appColors.neutral.n600
        }
        variant={TextVariantKeys.bodyRMedium}
      />
      <ViewModeButton viewMoreHistory={viewMoreHistory} />
    </View>
  );
};

export const CoinDetailComponent: React.FC<CoinHeaderType> = ({
  balanceCurrencyTitle,
  balanceTitle,
  headerTitle,
  logo,
  onReceivePress,
  onSendPress,
  onBackPress,
  theme,
  data,
  renderItem,
  renderSectionHeader,
  ItemSeparatorComponent,
  ListFooterComponent,
  onLoadMore,
  refreshing,
  onRefresh,
  isLoading,
  ButtonActionView,
  handleScroll,
  viewMoreHistory,
  hideSendAction,
}) => {
  const styles = useStyles(theme);
  const inset = useAppSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const { fontScale } = useWindowDimensions();

  const getMoreHeightWhenFontScale = fontScale > 1.1 ? 25 : 0;
  const headerMaxHeight = inset.top + 280 + getMoreHeightWhenFontScale;
  const inputRange = [
    130 + getMoreHeightWhenFontScale,
    167 + getMoreHeightWhenFontScale,
  ];

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const featureAnimationReceiveHeader = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY.value, inputRange, [75, 0], "clamp"),
      },
    ],
    opacity: interpolate(scrollY.value, inputRange, [0, 1], "clamp"),
  }));

  const featureBoxAction = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, inputRange, [1, 0], "clamp"),
  }));
  const coinAction = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [1, 0], "clamp"),
  }));
  const [widthHeader, setWidthHeader] = useState<number>(Utils.screenWidth);
  const [heightHeader, setHeightHeader] = useState<number>(230);
  const [loading, setLoading] = useState(false);
  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setHeightHeader(height);
    setWidthHeader(width);
    setLoading(false);
  };

  return (
    <ImageBackground
      source={appImages.background1}
      style={StyleSheet.absoluteFillObject}
      resizeMode="cover"
    >
      <ParallaxScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            style={appStyles.z999}
            progressViewOffset={inset.top}
          />
        }
        customTranslateY={[-200, 0, 20]}
        onScroll={scrollHandler}
        headerHeightImage={headerMaxHeight}
        containerStyle={appStyles.backgroundTransparent}
        headerImage={
          <ImageBackground
            source={appImages.coinDetailBackground}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        }
        contentStyle={appStyles.flex1}
        headerAbsolute={
          <View
            style={[
              appStyles.justifyContentBetween,
              appStyles.flexRow,
              appStyles.alignItemsCenter,
              appStyles.fullWidth,
              appStyles.pH25,
              appStyles.pB10,
              appStyles.overflowHidden,
            ]}
          >
            <AppButton
              onPress={onBackPress}
              icon={<ArrowLeftSvgIcon color={appColors.neutral.white} />}
              styles={styles.buttonHeader}
            />
            <AppText
              variant={TextVariantKeys.titleLarge}
              textColor={appColors.neutral.white}
              title={headerTitle}
              titleWithI18n={headerTitle}
            />
            <Animated.View
              style={[
                styles.actionButtonHeader,
                featureAnimationReceiveHeader,
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                appStyles.alignContentEnd,
              ]}
            >
              <TouchableOpacity onPress={onSendPress}>
                <SendSvgIcon color={appColors.neutral.white} />
              </TouchableOpacity>
              <View style={styles.w20} />
              <TouchableOpacity onPress={onReceivePress}>
                <ReceiveSvgIcon color={appColors.neutral.white} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        }
        contentInsideHeader={
          <View style={styles.containerContentInsideHeader}>
            <ContentInsideHeaderLoading isLoading={loading} theme={theme} />

            <View
              onLayout={handleLayout}
              style={[undefined, { opacity: loading ? 0 : 1 }]}
            >
              <Animated.View
                style={[appStyles.alignItemsCenter, appStyles.pd10, coinAction]}
              >
                {logo}
                <View style={appStyles.mt10}>
                  <AppText
                    title={balanceTitle}
                    variant={TextVariantKeys.titleLarge}
                    textColor={appColors.neutral.white}
                  />
                </View>
                <View style={appStyles.mt5}>
                  <AppText
                    title={balanceCurrencyTitle}
                    variant={TextVariantKeys.bodyRMedium}
                    textColor={appColors.neutral.white}
                    styles={appStyles.textAlignCenter}
                  />
                </View>
              </Animated.View>
              <Animated.View style={[styles.lowerHeader, featureBoxAction]}>
                {hideSendAction ? null : (
                  <>
                    <Animated.View style={[appStyles.alignItemsCenter]}>
                      <TouchableOpacity onPress={onSendPress}>
                        <View style={[styles.featureIcon]}>
                          <SendSvgIcon color={appColors.neutral.n700} />
                        </View>
                      </TouchableOpacity>

                      <AppText
                        titleWithI18n={LanguageKey.home_send_title}
                        variant={TextVariantKeys.labelTiny}
                        textColor={appColors.neutral.black}
                        styles={appStyles.textAlignCenter}
                      />
                    </Animated.View>
                    <View style={styles.borderBox} />
                  </>
                )}
                <View style={[appStyles.alignItemsCenter]}>
                  <View style={[styles.featureIcon]}>
                    <TouchableOpacity onPress={onReceivePress}>
                      <ReceiveSvgIcon color={appColors.neutral.n700} />
                    </TouchableOpacity>
                  </View>

                  <AppText
                    titleWithI18n={LanguageKey.home_receive_title}
                    variant={TextVariantKeys.labelTiny}
                    textColor={appColors.neutral.black}
                    styles={appStyles.textAlignCenter}
                  />
                </View>
              </Animated.View>
            </View>
            {undefined}
          </View>
        }
      >
        {!data.length && isLoading ? (
          <View style={appStyles.mt10}>
            <SkeletonLoadingTransactionHistory />
          </View>
        ) : (
          <SectionList
            sections={data}
            style={styles.sectionList}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item, index) => item.txHash || index.toString()}
            contentContainerStyle={[styles.listShadow, appStyles.flexGrow1]}
            ListHeaderComponent={data.length ? ButtonActionView : null}
            showsVerticalScrollIndicator={true}
            stickySectionHeadersEnabled={false}
            onEndReached={onLoadMore}
            scrollEnabled={false}
            onEndReachedThreshold={0.4}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListFooterComponent={data.length ? ListFooterComponent : null}
            ListEmptyComponent={
              !data.length ? (
                <EmptyView viewMoreHistory={viewMoreHistory} />
              ) : null
            }
            ListHeaderComponentStyle={styles.headerSectionList}
          />
        )}
      </ParallaxScrollView>
    </ImageBackground>
  );
};
type ContentInsideHeaderLoadingType = {
  isLoading: boolean;
  theme: AppThemeType;
};
export const ContentInsideHeaderLoading: React.FC<
  ContentInsideHeaderLoadingType
> = ({ isLoading, theme }) => {
  const newUIColors = [
    appColors.neutral.n300,
    appColors.other.outline_lightest,
    appColors.other.outline_lightest,
    appColors.other.outline_lightest,
    appColors.neutral.n300,
    appColors.other.outline_lightest,
    appColors.neutral.n300,
  ];
  const styles = useStyles(theme);
  return (
    isLoading && (
      <View>
        {SvgView.viewHome({
          width: 385,
          height: 240,
          backgroundColor: "white",
        })}
        <View style={styles.viewBox}>
          <AppSkeletonLoading
            width={50}
            height={50}
            radius={50}
            colors={newUIColors}
          />
          <View style={appStyles.mt10} />
          <AppSkeletonLoading width={220} height={26} colors={newUIColors} />
          <View style={appStyles.mbt5} />
          <AppSkeletonLoading width={160} height={20} colors={newUIColors} />
          <View
            style={[
              appStyles.mt15,
              appStyles.flexRow,
              styles.boxActionLoading,
              appStyles.justifyContentBetween,
            ]}
          >
            <LoadingSkeletonItemAction
              width={45}
              height={47}
              colors={newUIColors}
            />
            <View style={styles.lineActionBox} />
            <LoadingSkeletonItemAction
              width={45}
              height={47}
              colors={newUIColors}
            />
          </View>
        </View>
      </View>
    )
  );
};

export const ListButtonTokenTracking: React.FC<
  ListButtonTokenTrackingProps
> = ({ onSendPress, onReceivePress, onSwapPress, onBuyPress, onFaucetPress }) => {
  return (
    <View style={styles.btnTrackingContainer}>
      {/* Send */}
      <TouchableOpacity style={styles.button} onPress={onSendPress}>
        <AntDesign name="upload" size={14} color={appColors.neutral.n700} />
        <AppText
          titleWithI18n={LanguageKey.home_send_title}
          variant={TextVariantKeys.labelTiny}
          textColor={appColors.neutral.black}
          styles={styles.text}
        />
      </TouchableOpacity>

      {/* Receive */}
      <TouchableOpacity style={styles.button} onPress={onReceivePress}>
        <AntDesign name="download" size={14} color={appColors.neutral.n700} />
        <AppText
          titleWithI18n={LanguageKey.home_receive_title}
          variant={TextVariantKeys.labelTiny}
          textColor={appColors.neutral.black}
          styles={styles.text}
        />
      </TouchableOpacity>

      {/* Faucet */}
      {onFaucetPress && (
        <TouchableOpacity style={styles.button} onPress={onFaucetPress}>
          <AntDesign name="gift" size={14} color={appColors.neutral.n700} />
          <AppText
            title={"Faucet"}
            variant={TextVariantKeys.labelTiny}
            textColor={appColors.neutral.black}
            styles={styles.text}
          />
        </TouchableOpacity>
      )}

      {/* Swap */}
      <TouchableOpacity style={styles.button} onPress={onSwapPress}>
        <AntDesign name="swap" size={14} color={appColors.neutral.n700} />
        <AppText
          titleWithI18n={LanguageKey.home_swap_title}
          variant={TextVariantKeys.labelTiny}
          textColor={appColors.neutral.black}
          styles={styles.text}
        />
      </TouchableOpacity>

      {/* Buy */}
      <TouchableOpacity style={styles.button} onPress={onBuyPress}>
        <AntDesign
          name="shoppingcart"
          size={14}
          color={appColors.neutral.n700}
        />
        <AppText
          titleWithI18n={"Buy"}
          variant={TextVariantKeys.labelTiny}
          textColor={appColors.neutral.black}
          styles={styles.text}
        />
      </TouchableOpacity>
    </View>
  );
};

export const TokenInfoTracking: React.FC<{ marketData?: any }> = ({ marketData }) => {
  if (!marketData) return null;
  
  const {
    market_cap,
    total_volume,
    circulating_supply,
    ath,
    atl,
  } = marketData;

  const volumeToCap = total_volume?.usd && market_cap?.usd 
    ? ((total_volume.usd / market_cap.usd) * 100).toFixed(2) + "%"
    : "-";

  return (
    <View style={styles.marketInfoContainer}>
      <AppText
        titleWithI18n={LanguageKey.market_detail_title}
        variant={TextVariantKeys.labelLarge}
        textColor={appColors.neutral.black}
        styles={styles.marketInfoSectionTitle}
      />

      <View style={styles.marketInfoRow}>
        <AppText
          titleWithI18n={LanguageKey.market_cap}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.n600}
          styles={styles.marketInfoLabelText}
        />
        <AppText
          title={market_cap?.usd ? `$${Utils.fiatFormat(market_cap.usd)}` : "-"}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.black}
          styles={styles.marketInfoValueText}
        />
      </View>

      <View style={styles.marketInfoRow}>
        <AppText
          titleWithI18n={LanguageKey.volume_24h}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.n600}
          styles={styles.marketInfoLabelText}
        />
        <AppText
          title={total_volume?.usd ? `$${Utils.fiatFormat(total_volume.usd)}` : "-"}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.black}
          styles={styles.marketInfoValueText}
        />
      </View>

      <View style={styles.marketInfoRow}>
        <AppText
          titleWithI18n={LanguageKey.volume_to_marketcap}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.n600}
          styles={styles.marketInfoLabelText}
        />
        <AppText
          title={volumeToCap}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.black}
          styles={styles.marketInfoValueText}
        />
      </View>

      <View style={styles.marketInfoRow}>
        <AppText
          titleWithI18n={LanguageKey.circulating_supply}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.n600}
          styles={styles.marketInfoLabelText}
        />
        <AppText
          title={circulating_supply ? Utils.formattedBalanceCurrency(circulating_supply) : "-"}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.black}
          styles={styles.marketInfoValueText}
        />
      </View>

      <View style={styles.marketInfoRow}>
        <AppText
          titleWithI18n={LanguageKey.all_time_high}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.n600}
          styles={styles.marketInfoLabelText}
        />
        <AppText
          title={ath?.usd ? `$${ath.usd}` : "-"}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.black}
          styles={styles.marketInfoValueText}
        />
      </View>

      <View style={styles.marketInfoRow}>
        <AppText
          titleWithI18n={LanguageKey.all_time_low}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.n600}
          styles={styles.marketInfoLabelText}
        />
        <AppText
          title={atl?.usd ? `$${atl.usd}` : "-"}
          variant={TextVariantKeys.labelSmall}
          textColor={appColors.neutral.black}
          styles={styles.marketInfoValueText}
        />
      </View>
    </View>
  );
};

export const TokenBalanceCard = ({
  logo,
  name,
  change,
  usdValue,
  balance,
}: TokenBalanceCardProps) => {
  return (
    <View style={styles.cardContainer}>
      {/* Logo */}
      {typeof logo === 'string' ? (
        <Image source={{ uri: logo }} style={styles.logo} />
      ) : (
        <Image source={logo} style={styles.logo} />
      )}

      {/* Info */}
      <View style={styles.infoContainer}>
        <AppText
          title={name}
          variant={TextVariantKeys.bodyMMedium}
          textColor={appColors.neutral.black}
        />
        <AppText
          title={`${change > 0 ? "+" : ""}${change.toFixed(2)}%`}
          variant={TextVariantKeys.labelTiny}
          textColor={
            change >= 0 ? appColors.functional.green : appColors.main.tokyoRed
          }
        />
      </View>

      {/* Value */}
      <View style={styles.valueContainer}>
        <AppText
          title={usdValue}
          variant={TextVariantKeys.bodyMMedium}
          textColor={appColors.neutral.black}
          styles={styles.textAlignRight}
        />
        <AppText
          title={balance}
          variant={TextVariantKeys.labelTiny}
          textColor={appColors.neutral.black}
          styles={styles.textAlignRight}
        />
      </View>
    </View>
  );
};
