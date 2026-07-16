import React from 'react';
import {RouteProp, useRoute} from '@react-navigation/native'; // Import useRoute để nhận params
import usingStyles from './notificationDetails.style';
import {useAppTheme} from 'src/core/hooks/useAppTheme';
import TextVariantKeys from 'src/core/enum/TextVariantKeys';
import LanguageKey from 'src/core/locales/LanguageKey';
import ScreenWrapper from 'src/components/layout/ScreenWrapper';
import appStyles from 'src/core/styles';
import {View} from 'react-native';
import AppText from 'src/components/common/AppText';
import useNotificationDetail from './notificationDetails.hook';

type NotificationDetailRouteProp = RouteProp<
    {
        params: {
            id: string;
            title: string;
            createdAt: string;
            message: string;
            isRead: boolean;
        };
    },
    'params'
>;

const NotificationDetail: React.FC = () => {
    const theme = useAppTheme();
    const styles = usingStyles(theme);

    const route = useRoute<NotificationDetailRouteProp>();
    const {id, title, createdAt, message, isRead} = route.params;
    const {convertTimestampToISO} = useNotificationDetail(id, isRead);

    return (
        <ScreenWrapper
            paddingTop
            backgroundColor={theme.colors.surface_surface_default}
            enableHeader
            enableDismissKeyboard
            headerTextVariant={TextVariantKeys.titleLarge}
            headerTitleWithI18n={LanguageKey.notification_detail_title}>
            <View style={[appStyles.pV30, appStyles.pH25]}>
                <AppText
                    title={title}
                    variant={TextVariantKeys.titleMedium}
                    textColor={theme.colors.text_on_surface_text_highest}
                />
                <AppText
                    title={convertTimestampToISO(createdAt)}
                    variant={TextVariantKeys.bodyRMedium}
                    textColor={theme.colors.text_on_surface_text_light}
                    styles={styles.content}
                />
                <AppText
                    title={message}
                    variant={TextVariantKeys.bodyRMedium}
                    textColor={theme.colors.text_on_surface_text_highest}
                    numberOfLines={5}
                    ellipsizeMode="tail"
                />
            </View>
        </ScreenWrapper>
    );
};

export default NotificationDetail;
