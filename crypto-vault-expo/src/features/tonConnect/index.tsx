import React from 'react';
import { StyleSheet, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { AppThemeType } from 'src/core/type/ThemeType';
import Utils from 'src/core/utils/commonUtils';
import useTonConnect from './useTonConnect';

const TonConnectLayout = () => {
    const { componentView, theme, isShowModalConnect, insets } =
        useTonConnect();
    const styles = useStyles(theme, insets);
    return isShowModalConnect ? (
        <View style={styles.container}>{componentView}</View>
    ) : null;
};
export default TonConnectLayout;

const useStyles = (theme: AppThemeType, insets: EdgeInsets) =>
    StyleSheet.create({
        container: {
            paddingBottom: insets.bottom,
            position: 'absolute',
            backgroundColor: 'transparent',
            width: Utils.screenWidth,
            height: Utils.screenHeight,
        },
    });
