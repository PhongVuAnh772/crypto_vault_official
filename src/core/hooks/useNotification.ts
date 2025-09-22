import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import messaging, {
    FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'src/core/redux/hooks';
import {
    getLanguageType,
    setIsPressActionNoti,
} from 'src/core/redux/slice/app.slice';
import {
    AccountDataType,
    sendPostDataAccount,
} from 'src/features/notifications/notification.slice';
import { rootNavigate } from 'src/navigation/stacks/type/RootParamListType';
import { getAllAccount } from '../redux/slice/account.slice';
import Utils from '../utils/commonUtils';

const useNotification = () => {
    const dispatch = useAppDispatch();
    const dataWallet = useAppSelector(getAllAccount);
    const languageType = useAppSelector(getLanguageType) ?? '';

    const requestUserPermission = async () => {
        // const settings = await notifee.requestPermission();
        const authStatus = await messaging().requestPermission();

        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
            // console.log('Authorization status:', authStatus);
        }
    };
    const createNotificationChannel = async () => {
        if (Utils.isAndroid) {
            await notifee.createChannel({
                id: 'default',
                name: 'Default Channel',
                importance: AndroidImportance.HIGH,
            });
        }
    };
    const onDisplayNotification = async (
        remoteMessage: FirebaseMessagingTypes.RemoteMessage,
    ) => {
        await notifee.displayNotification({
            title: remoteMessage.notification?.title,
            body: remoteMessage.notification?.body,
            android: {
                channelId: 'default',
            },
            ios: {
                categoryId: 'default',
            },
            data: remoteMessage.data,
        });
    };

    useEffect(() => {
        const notificationListeners = messaging().onMessage(
            async remoteMessage => {
                await onDisplayNotification(remoteMessage);
            },
        );
        requestUserPermission();
        createNotificationChannel();
        return notificationListeners;
    }, []);
    useEffect(() => {
        return notifee.onForegroundEvent(({type, detail}) => {
            if (type === EventType.PRESS) {
                const redirect = detail.notification?.data?.redirect as string;
                const key =
                    (detail.notification?.data?.key as string) || undefined;
                dispatch(setIsPressActionNoti(false));
                rootNavigate(redirect, {prop: key});
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        const sendDataWallet = async () => {
            if (dataWallet) {
                const extractedData = dataWallet.map(item => {
                    return {
                        accountID: item.id,
                        addresses: item.protocolData.flatMap(itemProtocol =>
                            itemProtocol.addressList.map(i => {
                                return {
                                    protocolID: itemProtocol._id,
                                    address: [i.address],
                                };
                            }),
                        ),
                    };
                });
                const fcm = await messaging().getToken();
                const accountData: AccountDataType = {
                    deviceToken: fcm,
                    account: extractedData,
                    lang: languageType,
                };
                dispatch(sendPostDataAccount(accountData));
            }
        };
        sendDataWallet();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataWallet]);
};

export default useNotification;
