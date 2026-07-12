import React from 'react';
import {ScrollView, View} from 'react-native';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import appStyles from 'src/core/styles';
import {AppThemeType} from 'src/core/type/ThemeType';
import useStyles from './SkeletonLoadingTransactionHistoryBottomTab.style';

type LoadingItemTypeType = {
    index: number;
    theme: AppThemeType;
};

const DARK_SKELETON_COLORS = ['#181A45', '#242766', '#181A45'];

const SkeletonLoadingTransactionHistoryBottomTab = () => {
    const theme = useAppTheme();

    return (
        <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false} style={{ backgroundColor: '#07051A' }}>
            {/* Section 1: 2 items */}
            <View
                style={[
                    appStyles.flexRow,
                    appStyles.justifyContentBetween,
                    appStyles.alignItemsCenter,
                    { paddingHorizontal: 16 }
                ]}>
                <TitleLoading />
            </View>
            <View style={{ paddingHorizontal: 16 }}>
                {[...Array(2)].map((_, index) => (
                    <LoadingItem
                        key={`section-1-item-${index.toString()}`}
                        theme={theme}
                        index={index}
                    />
                ))}
            </View>

            {/* Section 2: 4 items */}
            <View style={{ paddingHorizontal: 16 }}>
                <TitleLoading />
                <View>
                    {[...Array(4)].map((_, index) => (
                        <LoadingItem
                            key={`section-2-item-${index.toString()}`}
                            theme={theme}
                            index={index}
                        />
                    ))}
                </View>
            </View>

            {/* Section 3: 2 items */}
            <View style={{ paddingHorizontal: 16 }}>
                <TitleLoading />
                <View>
                    {[...Array(2)].map((_, index) => (
                        <LoadingItem
                            key={`section-3-item-${index.toString()}`}
                            theme={theme}
                            index={index}
                        />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const TitleLoading = () => {
    return (
        <View style={[appStyles.mbt10, appStyles.mt15]}>
            <AppSkeletonLoading width={82} height={24} colors={DARK_SKELETON_COLORS} />
        </View>
    );
};
const LoadingItem = ({index, theme}: LoadingItemTypeType) => {
    const style = useStyles(theme);

    const SwapAvatar = () => {
        return (
            <View>
                <AppSkeletonLoading width={18} height={18} radius={100} colors={DARK_SKELETON_COLORS} />
                <View style={style.swap}>
                    <View>
                        <AppSkeletonLoading
                            width={18}
                            height={18}
                            radius={100}
                            colors={DARK_SKELETON_COLORS}
                        />
                        <View style={style.dotSwap}>
                            <AppSkeletonLoading
                                width={12}
                                height={12}
                                radius={100}
                                colors={DARK_SKELETON_COLORS}
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
                { borderRadius: 12, marginBottom: 8 } // Premium rounded cards
            ]}>
            <View style={appStyles.iconCircleSize32}>
                {index === 1 ? (
                    <SwapAvatar />
                ) : (
                    <AppSkeletonLoading width={28} height={28} radius={14} colors={DARK_SKELETON_COLORS} />
                )}
            </View>
            <View style={[appStyles.flex1, appStyles.ml10]}>
                <View style={[appStyles.flexRow, appStyles.mbt5]}>
                    <AppSkeletonLoading width={32} height={20} colors={DARK_SKELETON_COLORS} />
                    <View style={appStyles.ml10}>
                        <AppSkeletonLoading width={60} height={20} colors={DARK_SKELETON_COLORS} />
                    </View>
                </View>
                <AppSkeletonLoading width={120} height={20} colors={DARK_SKELETON_COLORS} />
            </View>
            <View style={appStyles.alignItemsEnd}>
                <View style={[appStyles.flexRow, appStyles.mbt5]}>
                    <AppSkeletonLoading width={70} height={20} colors={DARK_SKELETON_COLORS} />
                    <View style={appStyles.ml5}>
                        <AppSkeletonLoading width={32} height={20} colors={DARK_SKELETON_COLORS} />
                    </View>
                </View>
                <AppSkeletonLoading width={70} height={20} colors={DARK_SKELETON_COLORS} />
            </View>
        </View>
    );
};
export default SkeletonLoadingTransactionHistoryBottomTab;
