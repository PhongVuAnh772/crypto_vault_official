import { Feather } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View, TextInput as RNTextInput, Image, Pressable } from "react-native";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { AddressListItemType } from "src/core/redux/slice/account.type";
import { AppThemeType } from "src/core/type/ThemeType";
import BalanceCard from "./BalanceBox";
import { LinearGradient } from "expo-linear-gradient";
import AppImage from "src/components/common/AppImage";
import { appImages } from "src/core/constants/AppImages";
import { PlusSvgIcon, EthereumSvgIcon, ScanSvgIcon, SearchSvgIcon } from "src/core/constants/AppIconsSvg";
import { mPlus1 } from "src/core/constants/FontFamily";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";

export type HomeHeaderProps = {
  walletData?: AddressListItemType;
  balance: number;
  goToSendScreen: () => void;
  goToReceive: () => void;
  goToDepositOptions: () => void;
  goToMoreActionScreen: () => void;
  onPressAccount?: () => void;
  onPressScan?: () => void;
  onPressAI?: () => void;
  isLoading?: boolean;
};

const SCREEN_WIDTH = Dimensions.get("window").width;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PressScaleButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
}> = ({ onPress, children }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 12, stiffness: 250 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      {children}
    </AnimatedPressable>
  );
};

const HomeHeader: React.FC<HomeHeaderProps> = ({
  balance,
  goToSendScreen,
  goToReceive,
  goToDepositOptions,
  goToMoreActionScreen,
  onPressAccount,
  onPressScan,
  onPressAI,
  isLoading,
}) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  // Floating animation for the space balance card pedestal
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const floatingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <View style={styles.headerContainer}>
      {/* Main Balance Card with space pedestal background */}
      <Animated.View style={[styles.balanceCardWrapper, floatingStyle]}>
        <View style={styles.backgroundWrapper}>
          <Image
            source={appImages.balanceBg}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.cardContentContainer}>
          {/* Balance details on the left */}
          <BalanceCard
            balance={balance}
            withoutCurrencyRate={false}
            onPressAccount={onPressAccount}
            isLoading={isLoading}
          />

          {/* Action buttons at the bottom of the card */}
          <View style={styles.actionRow}>
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.actionItem}>
              <PressScaleButton onPress={goToDepositOptions}>
                <LinearGradient
                  colors={['#5B63E4', '#9E86FF']}
                  style={styles.actionCircle}
                >
                  <PlusSvgIcon width={22} height={22} color="#FFFFFF" />
                </LinearGradient>
              </PressScaleButton>
              <Text style={styles.actionLabel}>Thêm tiền</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.actionItem}>
              <PressScaleButton onPress={goToSendScreen}>
                <LinearGradient
                  colors={['#5B63E4', '#9E86FF']}
                  style={styles.actionCircle}
                >
                  <Feather name="arrow-up-right" size={22} color="#FFFFFF" />
                </LinearGradient>
              </PressScaleButton>
              <Text style={styles.actionLabel}>Gửi</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.actionItem}>
              <PressScaleButton onPress={goToReceive}>
                <LinearGradient
                  colors={['#5B63E4', '#9E86FF']}
                  style={styles.actionCircle}
                >
                  <Feather name="arrow-down-left" size={22} color="#FFFFFF" />
                </LinearGradient>
              </PressScaleButton>
              <Text style={styles.actionLabel}>Nhận</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actionItem}>
              <PressScaleButton onPress={goToMoreActionScreen}>
                <LinearGradient
                  colors={['#5B63E4', '#9E86FF']}
                  style={styles.actionCircle}
                >
                  <Feather name="more-horizontal" size={22} color="#FFFFFF" />
                </LinearGradient>
              </PressScaleButton>
              <Text style={styles.actionLabel}>Thêm</Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const useStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    headerContainer: {
      width: '100%',
      paddingTop: 120,
      paddingBottom: 10,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 16,
      marginTop: 20,
    },
    profileContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileBorder: {
      width: 44,
      height: 44,
      borderRadius: 22,
      padding: 2,
      backgroundColor: '#1E298E', // Gradient-like dark ring
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#9E86FF',
    },
    profileInner: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
      backgroundColor: '#13112E',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#9E86FF',
      fontFamily: mPlus1.bold,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#13112E', // very dark purple input
      borderRadius: 20,
      height: 38,
      paddingHorizontal: 12,
      marginHorizontal: 12,
      borderWidth: 1,
      borderColor: '#1D1B4E',
    },
    searchInput: {
      flex: 1,
      marginLeft: 6,
      fontSize: 13,
      color: '#FFFFFF',
      fontFamily: mPlus1.medium,
      padding: 0,
    },
    rightIconsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ethereumBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#1C1A4A',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      borderWidth: 1,
      borderColor: '#2E2B7A',
    },
    scanBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: '#13112E',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
      borderWidth: 1,
      borderColor: '#1D1B4E',
    },
    aiBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    aiIconImage: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    balanceCardWrapper: {
      marginHorizontal: 16,
      borderRadius: 24,
      overflow: 'hidden',
      height: 290,
      borderWidth: 1,
      borderColor: 'rgba(158, 134, 255, 0.25)', // Glow outline
      backgroundColor: '#0E0D26', // Fallback color
    },
    backgroundWrapper: {
      ...StyleSheet.absoluteFillObject,
      zIndex: -1,
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
    },
    cardContentContainer: {
      flex: 1,
      justifyContent: 'space-between',
      paddingVertical: 20,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 10,
    },
    actionItem: {
      alignItems: 'center',
    },
    actionCircle: {
      width: 54,
      height: 54,
      borderRadius: 27,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      shadowColor: '#5B63E4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    actionLabel: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '600',
      fontFamily: mPlus1.medium,
    },
  });

export default HomeHeader;
