import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {
    createAsyncThunk,
    createSlice,
    PayloadAction,
    ThunkDispatch,
    UnknownAction,
} from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import appErrorMessage from 'src/core/constants/AppErrorMessage';
import ReduxKey from 'src/core/enum/ReduxKey';
import { sendGet, sendPost } from 'src/core/network/requests';
import sendPut from 'src/core/network/requests/sendPut';
import { RootState } from 'src/core/redux/store';
import Auth0Service from 'src/core/services/Auth0';
import { ErrorFromBEType } from 'src/core/services/ErrorHandler/error.type';
import {
    APIGetUserResponse,
    APIGetUserResponseData,
    ErrorCode,
    GetBalanceResponse,
    GetPointExpireResponse,
    GetTransactionHistoryParams,
    GetTransactionHistoryResponse,
    GetUserPrams,
    RezPointStateType,
    SetCurrentAuthorizationAndStateCodeType,
} from './rezPoint.type';

const initialState: RezPointStateType = {
    currentAuthorizationCode: undefined,
    userInfo: undefined,
    stateCode: undefined,
    accountDeactivate: false,
    accountDeleted: false,
    accountDeletedOnlyCreateAccountUtil30Days: false,
    isLoading: false,
};

export const rezPoint = createSlice({
    name: 'rezPoint',
    initialState: initialState,
    reducers: {
        setCurrentAuthorizationAndStateCodeFromCallBack: (
            state,
            action: PayloadAction<SetCurrentAuthorizationAndStateCodeType>,
        ) => {
            const { authorizationCode, stateCode } = action.payload;
            state.currentAuthorizationCode = authorizationCode;
            state.stateCodeFromCallBack = stateCode;
        },
        setCurrentStateCode: (state, action: PayloadAction<string>) => {
            const data = action.payload;
            state.stateCode = data;
        },
        setLoadingLogin: (state, action: PayloadAction<boolean>) => {
            const data = action.payload;
            state.isLoading = data;
        },
        userSignOut: state => {
            resetUserInfoAndToken(state);
        },
        setAccountDeactivate: (state, action: PayloadAction<boolean>) => {
            if (action.payload) {
                resetUserInfoAndToken(state);
            }
            state.accountDeactivate = action.payload;
        },
        setAccountDeleted: (state, action: PayloadAction<boolean>) => {
            if (action.payload) {
                resetUserInfoAndToken(state);
            }
            state.accountDeleted = action.payload;
        },
        setAccountDeletedOnlyCreateAccountUtil30Days: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.accountDeletedOnlyCreateAccountUtil30Days = action.payload;
        },
    },
    extraReducers: build => {
        build
            .addCase(getDataUserByAccessToken.fulfilled, (state, action) => {
                const data = action.payload;
                state.userInfo = data.user;
                state.sessionId = data.sessionId;
            })
            .addCase(getBalanceByAccessToken.fulfilled, (state, action) => {
                const data = action.payload;
                state.balanceInfo = data.data;
            })
            .addCase(deleteCurrentUser.fulfilled, (state, action) => {
                resetUserInfoAndToken(state);
            })
            .addCase(
                getPointByAccessToken.fulfilled,
                (state, action: PayloadAction<GetPointExpireResponse>) => {
                    const { data } = action.payload;
                    state.pointExpiringInfo = {
                        listPointExpiring: data.listPointExpiring,
                        pointExpiringLatest: data.pointExpiring,
                    };
                },
            );
    },
});

const resetUserInfoAndToken = (state: RezPointStateType) => {
    state.userInfo = undefined;
    state.balanceInfo = undefined;
    const auth0Service = new Auth0Service();
    auth0Service.auth.clearCredentials();
};

const handleError = async (
    error: any,
    rejectWithValue: any,
    dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
) => {
    let errorMessage = error + '';
    console.log('🚀 ~ handleError ~ error:', error);
    if (error?.statusCode === 400) {
        // account deactivated
        if (error?.errorCode === ErrorCode.ACCOUNT_DEACTIVATED) {
            dispatch(setAccountDeactivate(true));
            errorMessage = appErrorMessage.accountDeactivated;
        }
        // account deleted
        if (error?.errorCode === ErrorCode.ACCOUNT_DELETED) {
            dispatch(setAccountDeleted(true));
            errorMessage = appErrorMessage.accountDeleted;
        }
        // account deleted only create account util 30 days
        if (
            error?.errorCode ===
            ErrorCode.ACCOUNT_DELETED_ONLY_CREATE_ACCOUNT_UTIL_30_DAYS
        ) {
            dispatch(setAccountDeletedOnlyCreateAccountUtil30Days(true));
            errorMessage = appErrorMessage.accountDeleted;
        }
    }

    if (error?.status === 401) {
        const deviceToken = await messaging().getToken();
        await dispatch(logOutUser(deviceToken));
        dispatch(userSignOut());
        errorMessage = appErrorMessage.unauthorized;
    }
    return rejectWithValue({
        message: errorMessage,
        errorCode: error?.errorCode,
    });
};
export const getDataUserByAccessToken = createAsyncThunk(
    'rezPoint/getDataUserByAccessToken',
    async (data: GetUserPrams, { rejectWithValue, dispatch, getState }) => {
        try {
            const result = await sendPost<APIGetUserResponse | ErrorFromBEType>(
                {
                    endPoint: '/rez-point/login',
                    customBearerToken: data.accessToken,
                    body: {
                        deviceId: data.deviceToken,
                        deviceType: data.deviceType,
                    },
                    idToken: data.idToken,
                },
            );

            if (result.status !== 200) {
                const convertedErrorData = result.data as ErrorFromBEType;
                return handleError(
                    convertedErrorData,
                    rejectWithValue,
                    dispatch,
                );
            }

            return result.data as unknown as APIGetUserResponseData;
        } catch (error) {
            return handleError(error, rejectWithValue, dispatch);
        }
    },
);
export const getBalanceByAccessToken = createAsyncThunk(
    'rezPoint/getBalanceByAccessToken',
    async (_, { getState, rejectWithValue, dispatch }) => {
        try {
            const state = getState() as RootState;
            const auth0Service = new Auth0Service();
            const credentials = await auth0Service.auth.getCredentials();
            const accessToken = credentials.accessToken;
            const sessionId = state.rezPoint.sessionId;

            if (!accessToken || !sessionId) {
                return rejectWithValue(appErrorMessage.unauthorized);
            }

            const result = await sendGet<GetBalanceResponse | ErrorFromBEType>({
                endPoint: '/rez-point/users/get-balance',
                customBearerToken: accessToken,
                customHeaders: {
                    'id-session': sessionId,
                },
            });

            if (result.status !== 200) {
                const convertedErrorData = result.data as ErrorFromBEType;
                return handleError(
                    convertedErrorData,
                    rejectWithValue,
                    dispatch,
                );
            }

            return result.data as unknown as GetBalanceResponse;
        } catch (error) {
            return handleError(error, rejectWithValue, dispatch);
        }
    },
);
export const deleteCurrentUser = createAsyncThunk(
    'rezPoint/deleteCurrentUser',
    async (_, { getState, rejectWithValue, dispatch }) => {
        try {
            const state = getState() as RootState;
            const auth0Service = new Auth0Service();
            const credentials = await auth0Service.auth.getCredentials();
            const accessToken = credentials.accessToken;
            const sessionId = state.rezPoint.sessionId;

            if (!accessToken || !sessionId) {
                return rejectWithValue(appErrorMessage.unauthorized);
            }

            const result = await sendPut<ErrorFromBEType>({
                endPoint: '/rez-point/delete-current-user',
                customBearerToken: accessToken,
                customHeaders: {
                    'id-session': sessionId,
                },
            });

            if (result.status !== 200) {
                const convertedErrorData = result.data as ErrorFromBEType;
                return handleError(
                    convertedErrorData,
                    rejectWithValue,
                    dispatch,
                );
            }

            return result.data;
        } catch (error) {
            return handleError(error, rejectWithValue, dispatch);
        }
    },
);

export const getPointByAccessToken = createAsyncThunk(
    'rezPoint/getPointByAccessToken',
    async (_, { getState, rejectWithValue, dispatch }) => {
        try {
            const state = getState() as RootState;
            const auth0Service = new Auth0Service();
            const credentials = await auth0Service.auth.getCredentials();
            const accessToken = credentials.accessToken;
            const sessionId = state.rezPoint.sessionId;

            if (!accessToken || !sessionId) {
                return rejectWithValue(appErrorMessage.unauthorized);
            }

            const result = await sendGet<
                GetPointExpireResponse | ErrorFromBEType
            >({
                endPoint: '/rez-point/users/get-point-expiring-soon',
                customBearerToken: accessToken,
                customHeaders: {
                    'id-session': sessionId,
                },
            });

            if (result.status !== 200) {
                const convertedErrorData = result.data as ErrorFromBEType;
                return handleError(
                    convertedErrorData,
                    rejectWithValue,
                    dispatch,
                );
            }

            return result.data as unknown as GetPointExpireResponse;
        } catch (error) {
            return handleError(error, rejectWithValue, dispatch);
        }
    },
);
export const logOutUser = createAsyncThunk(
    'rezPoint/logOutUser',
    async (deviceToken: string, { getState, rejectWithValue, dispatch }) => {
        try {
            const state = getState() as RootState;
            const auth0Service = new Auth0Service();
            const credentials = await auth0Service.auth.getCredentials();
            const accessToken = credentials.accessToken;
            const sessionId = state.rezPoint.sessionId;

            if (!accessToken || !sessionId) {
                return rejectWithValue(appErrorMessage.unauthorized);
            }

            const result = await sendPost({
                endPoint: '/rez-point/logout',
                customBearerToken: accessToken,
                body: {
                    deviceId: deviceToken,
                    sessionId,
                },
            });

            if (result.status !== 200) {
                const convertedErrorData = result.data as ErrorFromBEType;
                return handleError(
                    convertedErrorData,
                    rejectWithValue,
                    dispatch,
                );
            }
            return true;
        } catch (error) {
            return handleError(error, rejectWithValue, dispatch);
        }
    },
);

export const getPointHistoryByAccessToken = createAsyncThunk(
    'rezPoint/getPointHistoryByAccessToken',
    async (
        { page, perPage }: GetTransactionHistoryParams,
        { getState, rejectWithValue, dispatch },
    ) => {
        try {
            const state = getState() as RootState;
            const auth0Service = new Auth0Service();
            const credentials = await auth0Service.auth.getCredentials();
            const accessToken = credentials.accessToken;
            const sessionId = state.rezPoint.sessionId;

            if (!accessToken || !sessionId) {
                return rejectWithValue(appErrorMessage.unauthorized);
            }

            const result = await sendGet<
                GetTransactionHistoryResponse | ErrorFromBEType
            >({
                endPoint: '/rez-point/wallet-transaction',
                customBearerToken: accessToken,
                params: {
                    page,
                    perPage,
                },
            });

            if (result.status !== 200) {
                const convertedErrorData = result.data as ErrorFromBEType;
                return handleError(
                    convertedErrorData,
                    rejectWithValue,
                    dispatch,
                );
            }

            return result.data as GetTransactionHistoryResponse;
        } catch (error) {
            return handleError(error, rejectWithValue, dispatch);
        }
    },
);

export const handleResendEmailThunk = createAsyncThunk(
    'rezPoint/handleResendEmail',
    async (idUser: string, { rejectWithValue }) => {
        try {
            const result = await sendPost({
                endPoint: `/rez-point/users/send-email-verify/${idUser}`,
                body: {},
            });

            if (result.status !== 200) {
                return rejectWithValue(result.data);
            }
            return true;
        } catch (error) {
            console.log('🚀 ~ error:', error);
            return rejectWithValue(error);
        }
    },
);
export const {
    userSignOut,
    setCurrentStateCode,
    setAccountDeactivate,
    setAccountDeleted,
    setAccountDeletedOnlyCreateAccountUtil30Days,
    setCurrentAuthorizationAndStateCodeFromCallBack,
    setLoadingLogin,
} = rezPoint.actions;

export const getCurrentAuthorizationCode = (state: RootState) =>
    state?.rezPoint?.currentAuthorizationCode;

export const getRezPointState = (state: RootState) => state.rezPoint;

export const getUserInfo = (state: RootState) => state?.rezPoint?.userInfo;

export const getBalanceInfoByAccessToken = (state: RootState) =>
    state?.rezPoint?.balanceInfo;
export const getAccountDeactivate = (state: RootState) =>
    state?.rezPoint?.accountDeactivate;
export const getAccountDeleted = (state: RootState) =>
    state?.rezPoint?.accountDeleted;
export const getAccountDeletedOnlyCreateAccountUtil30Days = (
    state: RootState,
) => state?.rezPoint?.accountDeletedOnlyCreateAccountUtil30Days;
export const getPointExpire = (state: RootState) =>
    state?.rezPoint?.pointExpiringInfo;
export const getLoadingLogin = (state: RootState) => state?.rezPoint?.isLoading;

const ProtocolListConfig = {
    key: ReduxKey.rezPoint,
    storage: AsyncStorage,
    blacklist: [
        'currentAuthorizationCode',
        'stateCode',
        'accountDeactivate',
        'accountDeleted',
        'accountDeletedOnlyCreateAccountUtil30Days',
        'isLoading',
    ],
};

const rezPointReducer = persistReducer(ProtocolListConfig, rezPoint.reducer);

export default rezPointReducer;
