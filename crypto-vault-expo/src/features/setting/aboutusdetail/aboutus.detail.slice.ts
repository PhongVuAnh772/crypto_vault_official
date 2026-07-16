import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {AboutUsType, ErrorAboutUs, PolicyType} from './aboutus.detail.type';
import {sendGet} from 'src/core/network/requests';
import Utils from 'src/core/utils/commonUtils';
import AppToastType from 'src/core/enum/AppToastType';
import {RootState} from 'src/core/redux/store';

const initialState: AboutUsType = {
    loading: false,
    policyContent: undefined,
};

export const aboutUsDetail = createSlice({
    name: 'aboutUsDetail',
    initialState: initialState,
    reducers: {
        resetAboutUsDetailSlice: () => initialState,
    },
    extraReducers: builder => {
        builder
            .addCase(fetchAboutUs.pending, state => {
                state.loading = true;
            })
            .addCase(fetchAboutUs.fulfilled, (state, action) => {
                state.policyContent = action.payload;
                state.loading = false;
            });
    },
});

export const fetchAboutUs = createAsyncThunk(
    '/aboutUs/fetchAboutUs',
    async (_, {rejectWithValue}) => {
        try {
            const policyRes = await sendGet<PolicyType[] | ErrorAboutUs>({
                endPoint: '/mobile/legal-document',
            });
            const {data} = policyRes;
            if (data as PolicyType[]) {
                return data as PolicyType[];
            } else {
                const error = data as ErrorAboutUs;
                return rejectWithValue(error?.message);
            }
        } catch (error: any) {
            Utils.showToast({
                msg: 'Error',
                type: AppToastType.error,
            });
            return rejectWithValue(error?.message);
        }
    },
);

export const {resetAboutUsDetailSlice} = aboutUsDetail.actions;
export const getAboutUs = (state: RootState) => state.aboutUs;
const aboutUsDetailReducer = aboutUsDetail.reducer;

export default aboutUsDetailReducer;
