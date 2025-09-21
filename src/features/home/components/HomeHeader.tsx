import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ActionComponent from 'src/components/homeComponents/ActionComponents';
import SvgView from 'src/components/SvgBox';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import { AddressListItemType } from 'src/core/redux/slice/account.type';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import GlobalUtils from 'src/core/utils/globalUtils';
import BalanceRedX from './BalanceBox';
import WalletActions from './WalletActions';
import WalletInfo from './WalletInfo';

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
    hiddenScan?:boolean
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
    hiddenScan
}) => {
    const theme = useAppTheme();

    const styles = useStyles(theme);
    const [widthHeader, setWidthHeader] = useState<number>(Utils.screenWidth);
    const [heightHeader, setHeightHeader] = useState<number>(
        Utils.screenHeight,
    );
    const newUI = GlobalUtils.getEnableRedXNewTheme();
    const handleLayout = (event: any) => {
        const { width, height } = event.nativeEvent.layout;
        setHeightHeader(height);
        setWidthHeader(width);
    };

    return (
        <View style={[styles.walletView]}>
            <View
                onLayout={handleLayout}
                style={
                    newUI ? styles.newHeaderContainer : styles.headerContainer
                }>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.justifyContentBetween,
                        appStyles.fullWidth,
                        appStyles.pV15,
                        newUI ? appStyles.pH25 : undefined,
                        appStyles.alignItemsCenter,
                    ]}>
                    <WalletInfo
                        walletData={walletData}
                        onPress={onPressWallet}
                        newUI={newUI}
                        theme={theme}
                    />
                    <WalletActions
                        address={walletData?.address}
                        newUI={newUI}
                        goToScan={gotoScan}
                        hiddenScan={hiddenScan}
                    />
                </View>

                <View style={[appStyles.flex1, appStyles.flexRow]}>
                    <BalanceRedX
                        balance={balance}
                        withoutCurrencyRate={withoutCurrencyRate}
                    />
                    {/* <View style={styles.separator} />
                    <RezPointBalance navigation={navigation} /> */}
                </View>
                <ActionComponent
                    sendAction={goToSendScreen}
                    receiveAction={goToReceive}
                    style={[styles.containerAction]}
                    stakeAction={goToStakeScreen}
                    isHome={true}
                />
            </View>
            {newUI
                ? SvgView.viewHeaderHome({
                      width: widthHeader,
                      height: heightHeader,
                      backgroundColor: 'white',
                  })
                : undefined}
        </View>
    );
};

const useStyles = (theme: AppThemeType) =>
    StyleSheet.create({
        walletView: {
            minHeight: 185,
            marginBottom: GlobalUtils.getEnableRedXNewTheme() ? 10 : 0,
        },
        separator: {
            marginRight: 8,
        },
        newHeaderContainer: {
            ...appStyles.center,
            ...appStyles.justifyContentBetween,
            position: 'absolute',
            zIndex: 2,
            paddingHorizontal: 12,
        },
        headerContainer: {
            ...appStyles.center,
            ...appStyles.justifyContentBetween,
        },
        containerAction: {
            backgroundColor: GlobalUtils.getEnableRedXNewTheme()
                ? 'transparent'
                : theme.colors.surface_surface_high,
            marginVertical: GlobalUtils.getEnableRedXNewTheme() ? 0 : 15,
        },
    });

export default HomeHeader;
