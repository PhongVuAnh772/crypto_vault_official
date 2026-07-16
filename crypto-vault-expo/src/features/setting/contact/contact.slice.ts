import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AppToastType from 'src/core/enum/AppToastType';
import { sendPost } from 'src/core/network/requests';
import { RootState } from 'src/core/redux/store';
import Utils from 'src/core/utils/commonUtils';
import {
    ContactParams,
    ContactResponse,
    ContactSlice,
    ErrorContact,
} from './contact.type';

const initialState: ContactSlice = {
    loading: false,
};

export const contactSupportReducer = createSlice({
    name: 'contactSupport',
    initialState: initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(sendContact.pending, state => {
                state.loading = true;
            })
            .addCase(sendContact.fulfilled, state => {
                state.loading = false;
            });
    },
});

export const sendContact = createAsyncThunk(
    '/setting/sendContact',
    async (params: ContactParams, { rejectWithValue }) => {
        try {
            const deviceName = await DeviceInfo.getDeviceName();
            const OS = await DeviceInfo.getBaseOs();
            const appVersion = DeviceInfo.getVersion();
            const buildNumber = DeviceInfo.getBuildNumber();

            const contactRes = await sendPost<ContactResponse | ErrorContact>({
                endPoint: '/mobile/contact-support/create',
                body: {
                    platform: Platform.OS,
                    deviceName: deviceName,
                    OS: OS,
                    appVersion: appVersion,
                    buildNumber: buildNumber,
                    ...params,
                },
            });
            if (contactRes.status === 201) {
                return true;
            } else {
                Utils.showToast({
                    msg: 'Error',
                    type: AppToastType.error,
                });
                return rejectWithValue(contactRes.data);
            }
        } catch (error: any) {
            Utils.showToast({
                msg: 'Error',
                type: AppToastType.error,
            });
            return rejectWithValue(error?.response);
        }
    },
);

export const getContactSupportState = (state: RootState) =>
    state.contactSupport;

const contactSupportReducerExport = contactSupportReducer.reducer;

export default contactSupportReducerExport;
