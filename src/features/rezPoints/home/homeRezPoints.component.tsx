import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import AppButton from 'src/components/common/AppButton';
import AppSkeletonLoading from 'src/components/common/AppSkeletonLoading';
import AppText from 'src/components/common/AppText';
import { PointExpiryDateItem } from 'src/components/specific/RezPointExpireDate';
import SeparatorLine from 'src/components/specific/SeparatorLine';
import appColors from 'src/core/constants/AppColors';
import {
    ArrowLeftSvgIcon,
    ArrowRightSvgIcon,
    CoinRezPointSvgIcon,
    CollectSvgIcon,
    MenuDotSvgIcon,
    RezPointEarningSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import { useAppTheme } from 'src/core/hooks/useAppTheme';
import LanguageKey from 'src/core/locales/LanguageKey';
import {
    PointExpirationInfo,
    PointExpiringLatest,
} from 'src/core/redux/slice/rezPoint/rezPoint.type';
import appStyles from 'src/core/styles';
import { AppThemeType } from 'src/core/type/ThemeType';
import { rezPointUtils } from 'src/core/utils/rezPoint';
import { useStyles } from './homeRezPoints.style';
import {
    HeaderSectionProps,
    LoadingView,
    RezPointOptionsProps,
} from './homeRezPoints.type';

export const PointExpiryDateList: React.FC<{
    data: PointExpirationInfo[];
}> = ({ data }) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);
    return (
        <FlatList
            data={data}
            ListHeaderComponent={
                data.length ? (
                    <AppText
                        variant={TextVariantKeys.bodyRSmall}
                        titleWithI18n={
                            LanguageKey.rez_point_main_header_list_point_date
                        }
                        textColor={theme.colors.text_on_surface_text_light}
                        maxFontSizeMultiplier={1.4}
                        styles={styles.pointDateListTitle}
                    />
                ) : null
            }
            renderItem={({ item }) => <PointExpiryDateItem {...item} />}
            keyExtractor={(_, index) => index.toString()}
            scrollEnabled={false}
            ItemSeparatorComponent={SeparatorLine}
            ListEmptyComponent={EmptyPointExpiryDate}
            style={appStyles.mt10}
            contentContainerStyle={appStyles.flexGrow1}
        />
    );
};
export const EmptyPointExpiryDate: React.FC = () => {
    return (
        <View
            style={[
                appStyles.flex1,
                appStyles.alignItemsCenter,
                appStyles.mt60,
            ]}>
            <CollectSvgIcon color={appColors.neutral.n600} />
            <View style={appStyles.mt12}>
                <AppText
                    variant={TextVariantKeys.bodyRMedium}
                    titleWithI18n={LanguageKey.rez_point_no_rez_point_available}
                    textColor={appColors.neutral.n600}
                />
            </View>
            <AppText
                variant={TextVariantKeys.bodyRMedium}
                titleWithI18n={
                    LanguageKey.rez_point_no_rez_point_available_sub_text
                }
                textColor={appColors.neutral.n600}
                styles={appStyles.textAlignCenter}
            />
        </View>
    );
};
export const RezPointOptions: React.FC<RezPointOptionsProps> = ({
    onPress,
    titleWithI18n,
    icon,
    textColor,
    containerStyle,
}) => {
    const theme = useAppTheme();
    const styles = useStyles(theme);
    return (
        <TouchableOpacity
            style={[styles.typeButtonContainer, containerStyle]}
            onPress={onPress}>
            {icon}
            <AppText
                titleWithI18n={titleWithI18n}
                textColor={textColor ?? theme.colors.text_on_surface_text_high}
                variant={TextVariantKeys.bodyMMedium}
                styles={[
                    appStyles.flex1,
                    appStyles.pL10,
                    appStyles.justifyContentCenter,
                    appStyles.alignItemsCenter,
                ]}
            />
        </TouchableOpacity>
    );
};
export const UserInfo: React.FC<{
    userName: string;
    coin: string;
    coinExpire?: PointExpiringLatest;
    theme: AppThemeType;
    onPressPointHistory: () => void;
}> = ({ userName, coin, coinExpire, theme, onPressPointHistory }) => {
    const styles = useStyles(theme);

    return (
        <View
            style={[
                appStyles.flexRow,
                appStyles.justifyContentBetween,
                appStyles.alignItemsCenter,
                appStyles.flex1,
            ]}>
            <View style={appStyles.flex3}>
                <AppText
                    variant={TextVariantKeys.titleSmall}
                    title={userName}
                    textColor={appColors.neutral.white}
                    maxFontSizeMultiplier={1.4}
                    numberOfLines={1}
                />
                <View
                    style={[
                        appStyles.flexRow,
                        appStyles.alignItemsCenter,
                        appStyles.mt10,
                    ]}>
                    <CoinRezPointSvgIcon />
                    <AppText
                        variant={TextVariantKeys.headlineSmall}
                        title={rezPointUtils.formatCurrency(coin)}
                        textColor={appColors.neutral.white}
                        maxFontSizeMultiplier={1.4}
                        styles={appStyles.ml5}
                        numberOfLines={1}
                    />
                </View>
                <View style={appStyles.mt10}>
                    <AppText
                        variant={TextVariantKeys.bodyRSmall}
                        titleWithI18n={
                            coinExpire?.totalPointExpired &&
                            coinExpire?.expiredDate
                                ? LanguageKey.rez_point_main_coin_sub_header
                                : ''
                        }
                        textColor={appColors.neutral.white}
                        maxFontSizeMultiplier={1.4}
                        i18nParam={{
                            coinValue: rezPointUtils.formatCurrency(
                                coinExpire?.totalPointExpired || '',
                            ),
                            expireDate: coinExpire?.expiredDate || '',
                        }}
                        numberOfLines={2}
                    />
                </View>
            </View>
            <View style={[appStyles.flex2]}>
                <View style={[appStyles.justifyContentEnd, appStyles.flexRow]}>
                    <RezPointEarningSvgIcon />
                </View>
                <TouchableOpacity
                    onPress={onPressPointHistory}
                    style={[
                        appStyles.flexRow,
                        appStyles.alignItemsEnd,
                        appStyles.justifyContentEnd,
                        appStyles.mt10,
                    ]}>
                    <View
                        style={[
                            styles.pointHistory,
                            appStyles.alignItemsCenter,
                            appStyles.flexRow,
                        ]}>
                        <AppText
                            variant={TextVariantKeys.bodyRSmall}
                            titleWithI18n={LanguageKey.common_point_history}
                            textColor={appColors.neutral.white}
                        />
                        <ArrowRightSvgIcon color={appColors.neutral.white} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};
export const HeaderSection = ({
    backAction,
    handleOpenOptionModal,
}: HeaderSectionProps) => {
    return (
        <View style={[appStyles.pH25, appStyles.pB10]}>
            <View
                style={[
                    appStyles.justifyContentBetween,
                    appStyles.flexRow,
                    appStyles.alignItemsCenter,
                    appStyles.fullWidth,
                ]}>
                <AppButton
                    onPress={backAction}
                    icon={<ArrowLeftSvgIcon color={appColors.neutral.white} />}
                    styles={appStyles.paddingLeft0}
                />
                <AppText
                    variant={TextVariantKeys.titleLarge}
                    titleWithI18n={LanguageKey.rez_point_main_header}
                    textColor={appColors.neutral.white}
                    maxFontSizeMultiplier={1.4}
                />
                <AppButton
                    onPress={handleOpenOptionModal}
                    icon={
                        <MenuDotSvgIcon
                            width={24}
                            height={24}
                            color={appColors.neutral.white}
                        />
                    }
                    styles={appStyles.paddingRight0}
                />
            </View>
        </View>
    );
};

export const LoadingHeader = ({ children, isLoading }: LoadingView) => {
    if (isLoading) {
        return (
            <View style={[appStyles.flexRow]}>
                <View
                    style={[
                        appStyles.flex3,
                        appStyles.mt20,
                        appStyles.opacity5,
                    ]}>
                    <AppSkeletonLoading width={100} height={20} />
                    <View style={appStyles.mv10}>
                        <AppSkeletonLoading width={'100%'} height={32} />
                    </View>
                    <AppSkeletonLoading width={'70%'} height={16} />
                </View>
                <View>
                    <RezPointEarningSvgIcon />
                </View>
            </View>
        );
    }
    return children;
};
export const LoadingContent = ({
    children,
    isLoading,
    theme,
}: LoadingView & {
    theme: AppThemeType;
    insets: EdgeInsets;
}) => {
    const styles = useStyles(theme);
    if (isLoading) {
        return (
            <View style={[appStyles.pd25]}>
                <FlatList
                    data={[1, 2, 3, 4]}
                    horizontal
                    scrollEnabled={false}
                    renderItem={() => (
                        <View style={[appStyles.center]}>
                            <View
                                style={[
                                    styles.shadow,
                                    appStyles.backgroundWhite,
                                ]}>
                                <AppSkeletonLoading width={36} height={36} />
                            </View>
                            <View style={appStyles.mt5}>
                                <AppSkeletonLoading width={72} height={16} />
                            </View>
                        </View>
                    )}
                    contentContainerStyle={styles.contentListAction}
                />
                <View style={appStyles.mt25}>
                    <AppText
                        variant={TextVariantKeys.bodyRSmall}
                        titleWithI18n={
                            LanguageKey.rez_point_main_header_list_point_date
                        }
                        textColor={appColors.neutral.n500}
                        maxFontSizeMultiplier={1.4}
                        styles={styles.pointDateListTitle}
                    />
                    <FlatList
                        data={[1, 2, 3, 4]}
                        scrollEnabled={false}
                        renderItem={() => (
                            <View
                                style={[
                                    // styles.shadow,
                                    styles.itemLoadingContainer,
                                    appStyles.flexRow,
                                    appStyles.pd15,
                                    appStyles.alignItemsCenter,
                                ]}>
                                <AppSkeletonLoading
                                    width={24}
                                    height={24}
                                    radius={100}
                                />
                                <View
                                    style={[[appStyles.ml10, appStyles.flex1]]}>
                                    <AppSkeletonLoading
                                        width={71}
                                        height={20}
                                    />
                                    <View style={appStyles.mt5}>
                                        <AppSkeletonLoading
                                            width={119}
                                            height={20}
                                        />
                                    </View>
                                </View>
                                <View style={[appStyles.alignItemsEnd]}>
                                    <AppSkeletonLoading
                                        width={46}
                                        height={20}
                                    />
                                    <View style={appStyles.mt5}>
                                        <AppSkeletonLoading
                                            width={57}
                                            height={20}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}
                        ItemSeparatorComponent={SeparatorLine}
                        contentContainerStyle={[
                            styles.shadow,
                            appStyles.backgroundWhite,
                        ]}
                    />
                </View>
            </View>
        );
    }
    return children;
};
