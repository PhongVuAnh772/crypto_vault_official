import React from 'react';
import { StyleSheet, View } from 'react-native';
import Flex1View from 'src/components/layout/Flex1View';
import appColors from 'src/core/constants/AppColors';
import appStyles from 'src/core/styles';
import Utils from 'src/core/utils/commonUtils';

const ScanArena = () => {
    return (
        <View style={styles.scanContainer}>
            <View style={styles.scanArea}>
                <View style={[appStyles.flex1, appStyles.flexRow]}>
                    <View style={appStyles.flex1}>
                        <View style={[appStyles.flex1, appStyles.flexRow]}>
                            <View
                                style={[
                                    appStyles.flex1,
                                    styles.topLeftScanArea,
                                ]}
                            />
                            <Flex1View />
                        </View>
                        <View style={[appStyles.flex1, appStyles.flexRow]}>
                            <Flex1View />
                            <Flex1View />
                        </View>
                    </View>
                    <View style={appStyles.flex1}>
                        <View style={[appStyles.flex1, appStyles.flexRow]}>
                            <Flex1View />
                            <View
                                style={[
                                    appStyles.flex1,
                                    styles.topRightScanArea,
                                ]}
                            />
                        </View>
                        <View style={[appStyles.flex1, appStyles.flexRow]}>
                            <Flex1View />
                            <Flex1View />
                        </View>
                    </View>
                </View>
                <View style={[appStyles.flex1, appStyles.flexRow]}>
                    <View style={appStyles.flex1}>
                        <View style={[appStyles.flex1, appStyles.flexRow]}>
                            <Flex1View />
                            <Flex1View />
                        </View>
                        <View style={[appStyles.flex1, appStyles.flexRow]}>
                            <View
                                style={[
                                    appStyles.flex1,
                                    styles.bottomLeftScanArea,
                                ]}
                            />
                            <Flex1View />
                        </View>
                    </View>
                    <View style={appStyles.flex1}>
                        <View style={[appStyles.flex1, appStyles.flexRow]}>
                            <Flex1View />
                            <Flex1View />
                        </View>
                        <View style={[appStyles.flex1, appStyles.flexRow]}>
                            <Flex1View />
                            <View
                                style={[
                                    appStyles.flex1,
                                    styles.bottomRightScanArea,
                                ]}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    scanContainer: {
        ...appStyles.center,
        position: 'absolute',
        height: Utils.screenHeight * 0.7,
        width: Utils.screenWidth,
        padding: 40,
    },
    scanArea: {
        width: 300,
        height: 300,
        borderRadius: 30,
    },
    topLeftScanArea: {
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderTopLeftRadius: 30,
        borderColor: appColors.neutral.white,
    },
    topRightScanArea: {
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderTopRightRadius: 30,
        borderColor: appColors.neutral.white,
    },
    bottomLeftScanArea: {
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderBottomLeftRadius: 30,
        borderColor: appColors.neutral.white,
    },
    bottomRightScanArea: {
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderBottomRightRadius: 30,
        borderColor: appColors.neutral.white,
    },
});
export default ScanArena;
