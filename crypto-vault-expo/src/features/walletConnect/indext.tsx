import React from 'react';
import { StyleSheet, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import Utils from 'src/core/utils/commonUtils';
import useWallet from './useWallet';
const WalletConnectModal = () => {
    const { componentView, isShowModalConnect, insets } = useWallet();
    const styles = useStyles(insets);
    return isShowModalConnect ? (
        <View style={styles.container}>{componentView}</View>
    ) : null;
};
export default WalletConnectModal;

const useStyles = (insets: EdgeInsets) =>
    StyleSheet.create({
        container: {
            position: 'absolute',
            backgroundColor: 'transparent',
            width: Utils.screenWidth,
            height: Utils.screenHeight,
        },
    });
