import React, { useEffect, useRef } from "react";
import { Animated, FlatList, StyleSheet, View } from "react-native";
import AppSkeletonLoading from "src/components/common/AppSkeletonLoading";
import appColors from "src/core/constants/AppColors";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";

type HomeSkeletonLoadingType = {
  isLoading: boolean;
  children: React.ReactNode;
};
const getSizePercent = (percent: number) => {
  return (Utils.screenWidth * percent) / 100;
};
const HomeSkeletonLoading: React.FC<HomeSkeletonLoadingType> = ({
  isLoading,
  children,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isLoading ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const childrenOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(childrenOpacity, {
      toValue: isLoading ? 0 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (!isLoading) {
    return (
      <Animated.View style={{ opacity: childrenOpacity }}>
        {children}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ opacity }, appStyles.flex1, appStyles.mt15]}>
      <WalletInfoLoading />
      <View style={appStyles.mt15}>
        <SkeletonLoadingList />
      </View>
    </Animated.View>
  );
};

export const LoadingSkeletonItemAction: React.FC<{
  width: number;
  height: number;
  colors?: string[];
}> = ({ width, height, colors }) => (
  <View
    style={[
      appStyles.flex1,
      appStyles.justifyContentCenter,
      appStyles.alignItemsCenter,
    ]}
  >
    <AppSkeletonLoading width={width} height={height} colors={colors} />
    <View style={appStyles.mt5}>
      <AppSkeletonLoading width={width * 0.69} height={16} colors={colors} />
    </View>
  </View>
);

const SkeletonLoadingList: React.FC<{ colors?: string[] }> = ({ colors }) => {
  const theme: AppThemeType = useAppTheme();
  const styles = useStyles(theme);

  return (
    <FlatList
      data={[1, 2, 3]}
      renderItem={() => <TokenItemSkeletonLoading colors={colors} />}
      keyExtractor={(_, index) => index.toString()}
      ListFooterComponent={
        <View style={[appStyles.alignItemsCenter, appStyles.mt20]}>
          <AppSkeletonLoading width={getSizePercent(35)} colors={colors} />
        </View>
      }
      scrollEnabled={false}
      contentContainerStyle={styles.skeletonListContainer}
    />
  );
};

const TokenItemSkeletonLoading: React.FC<{ colors?: string[] }> = ({
  colors,
}) => {
  return (
    <View style={appStyles.pd16}>
      <View style={[appStyles.flexRow, appStyles.justifyContentBetween]}>
        <View style={[appStyles.flexRow, appStyles.alignItemsCenter]}>
          <AppSkeletonLoading
            height={28}
            width={28}
            radius={100}
            colors={colors}
          />
          <View style={[appStyles.pL10]}>
            <View style={[appStyles.flexRow]}>
              <AppSkeletonLoading width={getSizePercent(12)} colors={colors} />
              <View style={appStyles.ml5} />
              <AppSkeletonLoading width={getSizePercent(13)} colors={colors} />
            </View>
            <View style={appStyles.mt5} />
            <AppSkeletonLoading width={getSizePercent(30)} colors={colors} />
          </View>
        </View>
        <View style={[appStyles.alignItemsEnd]}>
          <AppSkeletonLoading width={getSizePercent(33)} colors={colors} />
          <View style={appStyles.mt5} />
          <AppSkeletonLoading width={getSizePercent(25)} colors={colors} />
        </View>
      </View>
    </View>
  );
};

type WalletInfoLoadingType = {
  colors?: string[];
};

const WalletInfoLoading: React.FC<WalletInfoLoadingType> = ({ colors }) => {
  const theme: AppThemeType = useAppTheme();
  const styles = useStyles(theme);
  return (
    <>
      <View
        style={[
          appStyles.flexRow,
          appStyles.justifyContentBetween,
          appStyles.alignItemsCenter,
        ]}
      >
        <View>
          <AppSkeletonLoading
            width={getSizePercent(30)}
            height={20}
            colors={colors}
          />
          <View style={appStyles.mt5}>
            <AppSkeletonLoading
              width={getSizePercent(35)}
              height={16}
              colors={colors}
            />
          </View>
        </View>
        <View style={[appStyles.flexRow, appStyles.mr5]}>
          <View style={appStyles.mr10}>
            <View style={styles.boxOptionLoading} />
          </View>
          <View style={styles.boxOptionLoading} />
        </View>
      </View>

      <View
        style={[
          appStyles.mt15,
          appStyles.flexRow,
          appStyles.justifyContentBetween,
        ]}
      >
        <AppSkeletonLoading
          width={getSizePercent(87)}
          height={76}
          colors={colors}
        />
        <AppSkeletonLoading
          width={getSizePercent(30)}
          height={76}
          colors={colors}
        />
      </View>
      <View
        style={[
          appStyles.mt15,
          appStyles.flexRow,
          styles.boxActionLoading,
          appStyles.justifyContentBetween,
        ]}
      >
        <LoadingSkeletonItemAction width={45} height={47} colors={colors} />
        <View style={styles.lineActionBox} />
        <LoadingSkeletonItemAction width={45} height={47} colors={colors} />
        <View style={styles.lineActionBox} />
        <LoadingSkeletonItemAction width={45} height={47} colors={colors} />
      </View>
    </>
  );
};

const shadow = {
  shadowColor: appColors.neutral.n300,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.5,
  shadowRadius: 4,
  elevation: 10,
};

const useStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    boxOptionLoading: {
      width: 28,
      height: 28,
      backgroundColor: theme.colors.surface_surface_high,
      borderRadius: 4,
      ...shadow,
    },
    boxActionLoading: {
      height: 80,
      backgroundColor: theme.colors.surface_surface_high,
      borderRadius: 4,
      padding: 12,
    },
    skeletonListContainer: {
      backgroundColor:  appColors.neutral.white,
      paddingBottom: 20,
    },
    lineActionBox: {
      backgroundColor: appColors.neutral.n200,
      height: "100%",
      width: 0.5,
    },
  });

export default HomeSkeletonLoading;
