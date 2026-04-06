import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import ActionComponent from "src/components/homeComponents/ActionComponents";
import { useAppTheme } from "src/core/hooks/useAppTheme";
import { AddressListItemType } from "src/core/redux/slice/account.type";
import appStyles from "src/core/styles";
import { AppThemeType } from "src/core/type/ThemeType";
import Utils from "src/core/utils/commonUtils";
import BalanceRedX from "./BalanceBox";

type HomeHeaderType = {
  walletData?: AddressListItemType;
  onPressWallet?: () => void;
  balance: number;
  goToSendScreen: () => void;
  goToReceive: () => void;
  goToStakeScreen: () => void;
  goToSwap: () => void;
  gotoScan: () => void;
  withoutCurrencyRate?: boolean;
  hiddenScan?: boolean;
  goToMoreActionScreen: () => void;
};

const HomeHeader: React.FC<HomeHeaderType> = ({
  walletData,
  onPressWallet,
  balance,
  goToSendScreen,
  goToReceive,
  goToStakeScreen,
  goToSwap,
  gotoScan,
  withoutCurrencyRate = false,
  hiddenScan,
  goToMoreActionScreen,
}) => {
  const theme = useAppTheme();

  const styles = useStyles(theme);
  const [widthHeader, setWidthHeader] = useState<number>(Utils.screenWidth);
  const [heightHeader, setHeightHeader] = useState<number>(Utils.screenHeight);
  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setHeightHeader(height);
    setWidthHeader(width);
  };

  return (
    <View style={[styles.walletView]}>
      <View onLayout={handleLayout} style={styles.headerContainer}>
        {/* <View
          style={[
            appStyles.flexRow,
            appStyles.justifyContentBetween,
            appStyles.fullWidth,
            appStyles.pV15,
            undefined,
            appStyles.alignItemsCenter,
          ]}
        >
          <WalletInfo
            walletData={walletData}
            onPress={onPressWallet}
            theme={theme}
          />
          <WalletActions
            address={walletData?.address}
            goToScan={gotoScan}
            hiddenScan={hiddenScan}
          />
        </View> */}

        <View style={[appStyles.flex1, appStyles.flexRow]}>
          <BalanceRedX
            balance={balance}
            withoutCurrencyRate={withoutCurrencyRate}
          />
        </View>
        <ActionComponent
          sendAction={goToSendScreen}
          receiveAction={goToReceive}
          style={[styles.containerAction]}
          stakeAction={goToStakeScreen}
          isHome={true}
          moreAction={goToMoreActionScreen}
        />
      </View>
    </View>
  );
};

const useStyles = (theme: AppThemeType) =>
  StyleSheet.create({
    walletView: {
      minHeight: 185,
      marginBottom:  0,
    },
    separator: {
      marginRight: 8,
    },
    newHeaderContainer: {
      ...appStyles.center,
      ...appStyles.justifyContentBetween,
      position: "absolute",
      zIndex: 2,
      paddingHorizontal: 12,
    },
    headerContainer: {
      ...appStyles.center,
      ...appStyles.justifyContentBetween,
    },
    containerAction: {
      backgroundColor: theme.colors.surface_surface_high,
      marginVertical: 15,
    },
  });

export default HomeHeader;
