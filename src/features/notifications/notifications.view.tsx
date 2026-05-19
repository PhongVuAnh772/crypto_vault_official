import React from 'react';
import {FlatList, Pressable, RefreshControl, View} from 'react-native';
import AppText from 'src/components/common/AppText';
import ScreenWrapper from 'src/components/layout/ScreenWrapper';
import {ArrowDownSvgIcon} from 'src/core/constants/AppIconsSvg';
import {NotificationTypeArray} from 'src/core/enum/NotificationType';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import {useAppSelector} from 'src/core/redux/hooks';
import {RootState} from 'src/core/redux/store';
import appStyles from 'src/core/styles';
import RootNavigationType from 'src/navigation/stacks/type/NavigationType';
import {
    EmptyNotification,
    EndReachedFooter,
    renderItemNotification,
    renderItemNotificationType,
} from './notifications.components';
import {useNotificationList} from './notifications.hook';
import usingStyles from './notifications.style';

const NotificationList: React.FC<RootNavigationType> = ({navigation}) => {
    const {
        theme,
        showTypeNotificationView,
        setShowTypeNotificationView,
        setTypeNotificationSelect,
        typeNotificationSelect,
        handleDeleteNotificationWithId,
        handleRefresh,
        refreshing,
        getTitleTypeNotification,
        handleLoadMore,
        setLoadMore,
        loadMore,
        flatListRef,
    } = useNotificationList(navigation);
    const {dataNotification} = useAppSelector(
        (state: RootState) => state.notifications,
    );

    const styles = usingStyles(theme);
    return (
        <ScreenWrapper
            paddingTop
            backgroundColor={theme.colors.surface_surface_default}
            enableHeader
            enableDismissKeyboard
            onDismissKeyboard={() => {
                setShowTypeNotificationView(false);
            }}
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTitleWithI18n={LanguageKey.notification_list_title}>
            {dataNotification && dataNotification?.length > 0 && (
                <View style={styles.fillter}>
                    <View
                        style={[
                            appStyles.flexRow,
                            appStyles.justifyContentBetween,
                            appStyles.alignItemsCenter,
                            appStyles.pT10,
                        ]}>
                        <Pressable
                            style={[styles.filterContainer]}
                            onPress={() => {
                                setShowTypeNotificationView(
                                    !showTypeNotificationView,
                                );
                            }}>
                            <AppText
                                titleWithI18n={getTitleTypeNotification(
                                    typeNotificationSelect,
                                )}
                                textColor={
                                    theme.colors.text_on_surface_text_high
                                }
                                variant={TextVariantKeys.labelMedium}
                            />
                            <View style={[appStyles.center, appStyles.ml10]}>
                                <ArrowDownSvgIcon
                                    color={
                                        theme.colors
                                            .text_on_surface_text_medium_high
                                    }
                                />
                            </View>
                        </Pressable>
                    </View>
                    <View>
                        {showTypeNotificationView && (
                            <View style={styles.notificationTypeView}>
                                <FlatList
                                    data={NotificationTypeArray}
                                    renderItem={item =>
                                        renderItemNotificationType(
                                            item as any,
                                            setTypeNotificationSelect,
                                            setShowTypeNotificationView,
                                            typeNotificationSelect,
                                            theme,
                                        )
                                    }
                                    style={[appStyles.pd5]}
                                />
                            </View>
                        )}
                    </View>
                </View>
            )}

            <View style={[styles.renderItemNotification]}>
                {dataNotification && dataNotification.length > 0 ? (
                    <FlatList
                        ref={flatListRef}
                        renderItem={item =>
                            renderItemNotification(
                                item as any,
                                handleDeleteNotificationWithId,
                                theme,
                                navigation,
                            )
                        }
                        data={dataNotification}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                tintColor={
                                    theme.colors.text_on_surface_text_high
                                }
                                colors={[
                                    theme.colors.text_on_surface_text_high,
                                ]}
                            />
                        }
                        onScrollEndDrag={handleLoadMore}
                        contentContainerStyle={[appStyles.pB50]}
                        showsVerticalScrollIndicator={false}
                        ListFooterComponent={
                            <EndReachedFooter
                                loadMore={loadMore}
                                theme={theme}
                            />
                        }
                        onScrollBeginDrag={() => setLoadMore(true)}
                    />
                ) : (
                    <EmptyNotification theme={theme} />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default NotificationList;
