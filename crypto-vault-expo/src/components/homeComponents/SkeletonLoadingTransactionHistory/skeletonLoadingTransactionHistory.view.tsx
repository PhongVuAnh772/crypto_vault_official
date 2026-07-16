import {View, ScrollView} from 'react-native';
import React from 'react';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import appStyles from 'src/core/styles';
import useStyles from './skeletonLoadingTransactionHistory.style';
import {AppThemeType} from 'src/core/type/ThemeType';

type LoadingItemTypeType = {
    index: number;
    theme: AppThemeType;
};
const SkeletonLoadingTransactionHistory = () => {
    const theme = useAppTheme();
    const style = useStyles(theme);

    return (
        <ScrollView
            contentContainerStyle={appStyles.pH15}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}>
            {/* Section 1: 2 items */}
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                ]}>
                <TitleLoading />
                <View style={style.typeContainer} />
            </View>
            <View>
                {[...Array(2)].map((_, index) => (
                    <LoadingItem
                        key={`section-1-item-${index.toString()}`}
                        theme={theme}
                        index={index}
                    />
                ))}
            </View>

            {/* Section 2: 4 items */}
            <TitleLoading />
            <View>
                {[...Array(4)].map((_, index) => (
                    <LoadingItem
                        key={`section-1-item-${index.toString()}`}
                        theme={theme}
                        index={index}
                    />
                ))}
            </View>

            {/* Section 3: 2 items */}
            <TitleLoading />
            <View>
                {[...Array(2)].map((_, index) => (
                    <LoadingItem
                        key={`section-1-item-${index.toString()}`}
                        theme={theme}
                        index={index}
                    />
                ))}
            </View>
        </ScrollView>
    );
};

const TitleLoading = () => {
    return (
        <View style={[appStyles.mbt10, appStyles.mt15]}>
            <AppSkeletonLoading width={82} height={24} />
        </View>
    );
};
const LoadingItem = ({index, theme}: LoadingItemTypeType) => {
    const style = useStyles(theme);

    const SwapAvatar = () => {
        return (
            <View>
                <AppSkeletonLoading width={18} height={18} radius={100} />
                <View style={style.swap}>
                    <View>
                        <AppSkeletonLoading
                            width={18}
                            height={18}
                            radius={100}
                        />
                        <View style={style.dotSwap}>
                            <AppSkeletonLoading
                                width={12}
                                height={12}
                                radius={100}
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.alignItemsCenter,
                appStyles.justifyContentBetween,
                style.loadingItem,
            ]}>
            <View style={appStyles.iconCircleSize32}>
                {index === 1 ? (
                    <SwapAvatar />
                ) : (
                    <AppSkeletonLoading width={28} height={28} />
                )}
            </View>
            <View style={[appStyles.flex1, appStyles.ml10]}>
                <View style={[appStyles.flexRow, appStyles.mbt5]}>
                    <AppSkeletonLoading width={32} height={20} />
                    <View style={appStyles.ml10}>
                        <AppSkeletonLoading width={60} height={20} />
                    </View>
                </View>
                <AppSkeletonLoading width={120} height={20} />
            </View>
            <View style={appStyles.alignItemsEnd}>
                <View style={[appStyles.flexRow, appStyles.mbt5]}>
                    <AppSkeletonLoading width={70} height={20} />
                    <View style={appStyles.ml5}>
                        <AppSkeletonLoading width={32} height={20} />
                    </View>
                </View>
                <AppSkeletonLoading width={70} height={20} />
            </View>
        </View>
    );
};
export default SkeletonLoadingTransactionHistory;
