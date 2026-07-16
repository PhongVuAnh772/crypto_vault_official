import {View} from 'react-native';
import React from 'react';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import appStyles from 'src/core/styles';
import sendLoadingStyle from './style';

const SendLoading = () => {
    return (
        <View>
            <View
                style={[
                    appStyles.flexRow,
                    sendLoadingStyle.container,
                    appStyles.alignItemsCenter,
                ]}>
                <AppSkeletonLoading height={28} width={28} radius={100} />
                <View style={appStyles.ml12}>
                    <View style={appStyles.mbt5}>
                        <AppSkeletonLoading width={70} />
                    </View>
                    <AppSkeletonLoading width={200} />
                </View>
            </View>
            <View style={appStyles.mt40}>
                <AppSkeletonLoading />
            </View>
            <View style={[appStyles.mt40]}>
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.justifyContentBetween,
                    ]}>
                    <AppSkeletonLoading width={70} />
                    <AppSkeletonLoading width={200} />
                </View>
            </View>
            <View style={[appStyles.mt10]}>
                <AppSkeletonLoading height={48} />
            </View>
        </View>
    );
};

export default SendLoading;
