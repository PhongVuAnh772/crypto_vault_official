// notificationSlice.ts
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
    sendDelete,
    sendGet,
    sendPatch,
    sendPost,
} from 'src/core/network/requests';
import {RootState} from 'src/core/redux/store';

export interface Notifications {
    _id: string;
    walletAddress: string;
    title: string;
    message: string;
    notificationType: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}
export interface NotificationType {
    items: Notifications[];
}

interface NotificationDataResType {
    items: NotificationType[];
}

interface NotificationState {
    dataNotification?: NotificationDataResType[];
    loading: boolean;
    error?: string;
    page: number;
    perPage: number;
}

const initialState: NotificationState = {
    loading: false,
    error: undefined,
    dataNotification: [],
    page: 1,
    perPage: 10,
};
export interface AccountDataType {
    deviceToken: string;
    account: AccountType[];
    lang: string;
}
export interface AccountType {
    accountID: string;
    addresses: ProtocolType[];
}
export interface ProtocolType {
    protocolID: string;
    address: string[];
}
export const handleGetNotificationListData = createAsyncThunk(
    'notifications/getNotificationListData',
    async (
        {
            walletAddress,
            type,
            page,
            perPage,
            protocolId,
        }: {
            walletAddress: string;
            type: string;
            page: number;
            perPage: number;
            protocolId: string;
        },
        {rejectWithValue},
    ) => {
        try {
            const response = await sendGet<NotificationDataResType>({
                endPoint: '/mobile/notification-wallets',
                params: {
                    walletAddress: walletAddress,
                    type: type,
                    page: page,
                    perPage: perPage,
                    protocolId: protocolId,
                },
            });

            return response?.data?.items;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleDeleteNotificationListData = createAsyncThunk(
    'notifications/deleteNotificationListData',
    async (id: string, {rejectWithValue}) => {
        try {
            const response = await sendDelete<NotificationDataResType>({
                endPoint: `/mobile/notification-wallets/${id}`,
            });

            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleGetFirstNotificationListData = createAsyncThunk(
    'notifications/getFirstNotificationListData',
    async (
        {
            walletAddress,
            type,
            page,
            perPage,
            protocolId,
        }: {
            walletAddress: string;
            type: string;
            page: number;
            perPage: number;
            protocolId: string;
        },
        {rejectWithValue},
    ) => {
        try {
            const response = await sendGet<NotificationDataResType>({
                endPoint: '/mobile/notification-wallets',
                params: {
                    walletAddress: walletAddress,
                    type: type,
                    page: page,
                    perPage: perPage,
                    protocolId: protocolId,
                },
            });
            return response?.data?.items;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);

export const handleReadNotificationListData = createAsyncThunk(
    'notifications/readNotificationListData',
    async (id: string, {rejectWithValue}) => {
        try {
            const response = await sendPatch<NotificationDataResType>({
                endPoint: `/mobile/notification-wallets/${id}`,
            });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);
export const sendPostDataAccount = createAsyncThunk(
    'notifications/sendPostDataAccount',
    async (accountData: AccountDataType, {rejectWithValue}) => {
        try {
            const response = await sendPost<any>({
                endPoint: `/mobile/device-token`,
                body: accountData,
            });
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    },
);
const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        COUNTING_PAGE_NOTIFICATIONS: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(handleReadNotificationListData.pending, state => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(
                handleReadNotificationListData.fulfilled,
                (state: any, action) => {
                    state.loading = false;
                    const id = action.meta.arg;
                    state.dataNotification = state.dataNotification.map(
                        (notification: any) => {
                            if (notification._id === id) {
                                return {
                                    ...notification,
                                    isRead: true,
                                };
                            }
                            return notification;
                        },
                    );
                },
            )
            .addCase(
                handleReadNotificationListData.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload as string;
                },
            )
            .addCase(handleGetNotificationListData.pending, state => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(
                handleGetNotificationListData.fulfilled,
                (state: any, action) => {
                    state.loading = false;
                    if (action.payload) {
                        state.dataNotification = [
                            ...(state.dataNotification || []),
                            ...action.payload,
                        ];
                        state.page = state.page + 1;
                    }
                },
            )
            .addCase(
                handleGetFirstNotificationListData.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload as string;
                },
            )
            .addCase(handleGetFirstNotificationListData.pending, state => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(
                handleGetFirstNotificationListData.fulfilled,
                (state: any, action) => {
                    state.loading = false;
                    state.dataNotification = action.payload;
                    state.page = state.page + 1;
                },
            )
            .addCase(
                handleGetNotificationListData.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload as string;
                },
            )
            .addCase(handleDeleteNotificationListData.pending, state => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(
                handleDeleteNotificationListData.fulfilled,
                (state: any, action) => {
                    state.loading = false;
                    const id = action.meta.arg;
                    state.dataNotification = state.dataNotification.filter(
                        (notification: any) => notification._id !== id,
                    );
                },
            )
            .addCase(
                handleDeleteNotificationListData.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload as string;
                },
            )
            .addCase(sendPostDataAccount.pending, state => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(sendPostDataAccount.fulfilled, (state: any, action) => {
                state.loading = false;
            })
            .addCase(sendPostDataAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const getNotificationState = (state: RootState) => state?.notifications;

export const {COUNTING_PAGE_NOTIFICATIONS} = notificationSlice.actions;

export default notificationSlice.reducer;
