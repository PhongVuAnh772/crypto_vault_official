/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from 'src/components/common/AppText';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';

const RevolutBanner = () => {
    return (
        <View style={styles.bannerContainer}>
            <View style={styles.banner}>
                <View style={appStyles.flex1}>
                    <AppText title="Invite friends, earn €50" variant={TextVariantKeys.bodyMMedium} textColor="#000000" styles={{ fontWeight: '700' }} />
                    <AppText title="Earn €50 for each friend you invite by 26 March. T&C apply" variant={TextVariantKeys.bodyRTiny} textColor="#666666" styles={{ marginTop: 4 }} />
                </View>
                <View style={styles.bannerImgArea} />
            </View>
            <View style={styles.bannerDots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bannerContainer: {
        marginTop: 0,
    },
    banner: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 24,
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    bannerImgArea: {
        width: 80,
        height: 80,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        marginLeft: 15,
    },
    bannerDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#DDDDDD',
        marginHorizontal: 3,
    },
    dotActive: {
        backgroundColor: '#999999',
    },
});

export default RevolutBanner;
