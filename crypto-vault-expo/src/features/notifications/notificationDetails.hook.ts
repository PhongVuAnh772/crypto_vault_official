import {useAppDispatch} from 'src/core/redux/hooks';
import {handleReadNotificationListData} from './notification.slice';
import {useLayoutEffect} from 'react';

const useNotificationDetail = (id: string, isRead: boolean) => {
    const dispatch = useAppDispatch();

    const convertTimestampToISO = (dateStr: string) => {
        const date = new Date(dateStr);
        const formattedDate = date
            .toLocaleString('en-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            })
            .replace(', ', ' ')
            .replaceAll('-', '/');
        return formattedDate;
    };
    useLayoutEffect(() => {
        const handleReadNotification = async () => {
            if (isRead) {
                return;
            } else {
                await dispatch(handleReadNotificationListData(id));
            }
        };
        handleReadNotification();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        convertTimestampToISO,
    };
};

export default useNotificationDetail;
