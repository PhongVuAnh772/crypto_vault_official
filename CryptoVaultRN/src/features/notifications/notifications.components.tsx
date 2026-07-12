import {
    ListRenderItemInfo,
    Pressable,
    RefreshControl,
    TouchableOpacity,
    View,
} from 'react-native';
import React from 'react';

import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import appStyles from 'src/core/styles';
import AppText from 'src/components/common/AppText';
import {
    CheckSvgIcon2,
    NotificationInListSvgIcon,
    EmptyNotificationSvgIcon,
    DeleteNotificationSvgIcon,
} from 'src/core/constants/AppIconsSvg';
import {AppThemeType} from 'src/core/type/ThemeType';
import usingStyles from './notifications.style';
import LanguageKey from 'src/core/locales/LanguageKey';
import {
    NavigationProp,
    ParamListBase,
    StackActions,
} from '@react-navigation/native';
import {Notifications} from './notification.slice';
import {HomeStackScreenKey} from 'src/navigation/enum/NavigationKey';
import {ActivityIndicator} from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface EmptyNotificationProps {
    theme: AppThemeType;
}

interface RestartRefeshControlProps {
    refreshing: boolean;
}

interface EndReachedFooterProps {
    loadMore: boolean;
    theme: AppThemeType;
}

export const renderItemNotificationType = (
    {item}: {item: string; index?: number},
    setTypeNotificationSelect: React.Dispatch<React.SetStateAction<string>>,
    setShowTypeNotificationView: React.Dispatch<React.SetStateAction<boolean>>,
    typeNotificationSelect: string,
    theme: AppThemeType,
) => {
    const styles = usingStyles(theme);

    return (
        <TouchableOpacity
            onPress={() => {
                setTypeNotificationSelect(item[0]);
                setShowTypeNotificationView(false);
            }}
            style={styles.itemNotificationTypeContainer}>
            <View style={appStyles.ml10}>
                <AppText
                    title={item}
                    textColor={theme.colors.text_on_surface_text_highest}
                    variant={TextVariantKeys.titleMedium}
                />
            </View>
            {typeNotificationSelect === item[0] && (
                <View
                    style={[
                        appStyles.flex1,
                        appStyles.alignItemsEnd,
                        appStyles.mr10,
                    ]}>
                    <CheckSvgIcon2 />
                </View>
            )}
        </TouchableOpacity>
    );
};
const rightSwipe = (
    isRead: boolean,
    id: string,
    handleDeleteNotificationWithId: (id: string) => Promise<void>,
    theme: AppThemeType,
) => {
    const styles = usingStyles(theme);

    return (
        <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
                handleDeleteNotificationWithId(id);
            }}>
            <View style={styles.deleteBox}>
                <DeleteNotificationSvgIcon />
                <AppText
                    titleWithI18n={LanguageKey.common_text_delete}
                    textColor={theme.colors.text_on_surface_text_invert}
                    variant={TextVariantKeys.bodyMMedium}
                    styles={styles.deleteText}
                />
            </View>
        </TouchableOpacity>
    );
};

export const renderItemNotification = (
    item: ListRenderItemInfo<Notifications>,
    handleDeleteNotificationWithId: (id: string) => Promise<void>,
    theme: AppThemeType,
    navigation: NavigationProp<ParamListBase>,
) => {
    const styles = usingStyles(theme);
    let rowRefs = new Map();

    return (
        <Swipeable
            overshootRight={false}
            key={item.item._id}
            ref={ref => {
                if (ref && !rowRefs.get(item.item._id)) {
                    rowRefs.set(item.item._id, ref);
                }
            }}
            onSwipeableWillOpen={() => {
                [...rowRefs.entries()].forEach(([key, ref]) => {
                    if (key !== item.item._id && ref) {
                        ref.current.close();
                    }
                });
            }}
            renderRightActions={() =>
                rightSwipe(
                    item.item.isRead,
                    item.item._id,
                    handleDeleteNotificationWithId,
                    theme,
                )
            }>
            <Pressable
                onPress={() => {
                    navigation.dispatch(
                        StackActions.push(
                            HomeStackScreenKey.NotificationDetail,
                            {
                                id: item.item._id,
                                title: item.item.title,
                                createdAt: item.item.createdAt,
                                message: item.item.message,
                                isRead: item.item.isRead,
                            },
                        ),
                    );
                }}
                style={[
                    styles.itemNotificationContainer,
                    {
                        backgroundColor: !item.item.isRead
                            ? theme.colors.surface_surface_brand_lightest
                            : theme.colors.surface_surface_high,
                    },
                ]}>
                <View style={[appStyles.flexRow, appStyles.center]}>
                    <View style={[styles.notificationIconContainer]}>
                        <NotificationInListSvgIcon />
                    </View>
                    <View style={[appStyles.pL15]}>
                        <AppText
                            title={item.item.title}
                            textColor={
                                theme.colors.text_on_surface_text_highest
                            }
                            variant={TextVariantKeys.titleSmall}
                        />
                        <AppText
                            title={item.item.message}
                            textColor={theme.colors.text_on_surface_text_high}
                            variant={TextVariantKeys.bodyRMedium}
                            styles={styles.content}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        />
                        <AppText
                            title={item.item.createdAt}
                            textColor={theme.colors.text_on_surface_text_light}
                            variant={TextVariantKeys.bodyRSmall}
                        />
                    </View>
                </View>

                {!item.item.isRead && <View style={styles.unread} />}
            </Pressable>
        </Swipeable>
    );
};
export const EndReachedFooter: React.FC<EndReachedFooterProps> = ({
    loadMore,
    theme,
}) => {
    const styles = usingStyles(theme);

    return loadMore ? (
        <View style={[styles.loadMoreContainer, appStyles.mt30]}>
            <ActivityIndicator
                color={theme.colors.text_on_surface_text_high}
                size="small"
            />
        </View>
    ) : null;
};

export const RestartRefeshControl: React.FC<RestartRefeshControlProps> = ({
    refreshing,
}) => <RefreshControl refreshing={!refreshing} tintColor="transparent" />;

export const EmptyNotification: React.FC<EmptyNotificationProps> = ({
    theme,
}) => {
    const styles = usingStyles(theme);
    return (
        <View style={styles.emptyContainer}>
            <EmptyNotificationSvgIcon />
            <AppText
                titleWithI18n={LanguageKey.empty_notification_title}
                textColor={theme.colors.text_on_surface_text_medium}
                variant={TextVariantKeys.titleLarge}
                styles={styles.emptyTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
            />
            <AppText
                titleWithI18n={LanguageKey.empty_notification_description}
                textColor={theme.colors.text_on_surface_text_medium}
                variant={TextVariantKeys.bodyRMedium}
            />
        </View>
    );
};
