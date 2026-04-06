import { Feather } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import LanguageKey from "src/core/locales/LanguageKey";
import { AddressListItemType } from "src/core/redux/slice/account.type";
import { AppThemeType } from "src/core/type/ThemeType";
import BackgroundSvg from "../../../../assets/images/background.svg";
import BalanceCard from "./BalanceBox";

export type HomeHeaderProps = {
  walletData?: AddressListItemType;
  balance: number;
  goToSendScreen: () => void;
  goToReceive: () => void;
  goToDepositOptions: () => void;
  goToMoreActionScreen: () => void;
  onPressAccount?: () => void;
};

const SCREEN_WIDTH = Dimensions.get("window").width;

const HomeHeader: React.FC<HomeHeaderProps> = ({
  balance,
  goToSendScreen,
  goToReceive,
  goToDepositOptions,
  goToMoreActionScreen,
  onPressAccount,
}) => {
  const theme = useAppTheme();
  const styles = useStyles(theme);
  const { t } = useTranslation();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.backgroundWrapper}>
        <BackgroundSvg
          width={SCREEN_WIDTH}
          height="100%"
          preserveAspectRatio="xMidYMid slice"
        />
      </View>

      <View style={styles.contentContainer}>


        <BalanceCard
          balance={balance}
          withoutCurrencyRate={false}
          onPressAccount={onPressAccount}
        />

        <View style={styles.actionRow}>
          <View style={styles.actionItem}>
            <TouchableOpacity style={[styles.actionCircle, { backgroundColor: '#A78BFA' }]} onPress={goToDepositOptions}>
              <Feather name="plus" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{t(LanguageKey.home_action_add_money)}</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity style={styles.actionCircle} onPress={goToSendScreen}>
              <Feather name="arrow-up-right" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{t(LanguageKey.home_send_title)}</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity style={styles.actionCircle} onPress={goToReceive}>
              <Feather name="arrow-down-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{t(LanguageKey.home_receive_title)}</Text>
          </View>

          <View style={styles.actionItem}>
            <TouchableOpacity style={styles.actionCircle} onPress={goToMoreActionScreen}>
              <Feather name="more-horizontal" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{t(LanguageKey.home_action_more)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const useStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    headerContainer: {
      width: '100%',
      paddingTop: 100,
      paddingBottom: 40,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
      overflow: 'hidden',
    },
    backgroundWrapper: {
      ...StyleSheet.absoluteFillObject,
      zIndex: -1,
    },
    contentContainer: {
      paddingHorizontal: 24,
      paddingTop: 20
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 25,
      marginTop: 20
    },
    logoBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoImage: {
      width: 24,
      height: 24,
      resizeMode: 'contain'
    },
    searchBar: {
      flex: 1,
      height: 40,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      marginHorizontal: 10,
    },
    searchInput: {
      flex: 1,
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      paddingLeft: 8,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 10,
    },
    aiIcon: {
      backgroundColor: '#4CC9F0',
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    aiText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 30,
    },
    actionItem: {
      alignItems: 'center',
    },
    actionCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    actionLabel: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
  });

export default HomeHeader;
