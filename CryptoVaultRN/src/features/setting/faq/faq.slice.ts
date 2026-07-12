import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {sendGet} from 'src/core/network/requests';
import {RootState} from 'src/core/redux/store';
import Utils from 'src/core/utils/commonUtils';
import AppToastType from 'src/core/enum/AppToastType';
import {ErrorFAQ, FAQSlice, ResFAQ} from './faq.type';

const initialState: FAQSlice = {
    loading: false,
    faqData: undefined,
};

export const faqReducer = createSlice({
    name: 'faq',
    initialState: initialState,
    reducers: {
        resetFAQSlice: () => initialState,
    },
    extraReducers: builder => {
        builder
            .addCase(getFAQThunk.pending, state => {
                state.loading = true;
            })
            .addCase(getFAQThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.faqData = action.payload.items;
            });
    },
});

export const getFAQThunk = createAsyncThunk(
    '/setting/getFAQ',
    async (_, {rejectWithValue}) => {
        try {
            const contactRes = await sendGet<ResFAQ | ErrorFAQ>({
                endPoint: '/mobile/faq',
            });
            if (contactRes.data as ResFAQ) {
                return contactRes.data as ResFAQ;
            } else {
                const error = contactRes.data as ErrorFAQ;
                Utils.showToast({
                    msg: 'Error',
                    type: AppToastType.error,
                });
                return rejectWithValue(error.message);
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

export const {resetFAQSlice} = faqReducer.actions;

export const getFAQState = (state: RootState) => state.faq;

const faqReducerExport = faqReducer.reducer;

export default faqReducerExport;
