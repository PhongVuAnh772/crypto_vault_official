import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import EnvConfig from 'src/core/constants/EnvConfig';
import { ErrorFromBEType } from 'src/core/services/ErrorHandler/error.type';
import ErrorHandler from 'src/core/services/ErrorHandler/errorHandler';

async function getAxiosInstance(
    customBaseUrl?: string,
    customBearerToken?: string,
    apiKey?: string,
    idToken?: string, // for rez-point
    customHeaders?: { [key: string]: string },
) {
    const instance = axios.create({
        baseURL: customBaseUrl ?? EnvConfig.BASE_URL,
        timeout: 60000,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'x-api-key': apiKey ?? EnvConfig.API_KEY,
            ...customHeaders,
        },
    });

    instance.interceptors.request.use(
        async (config: any) => {
            console.log('-----API CALL-----');
            console.warn(`--${config?.url}--`);
            console.log('-------------------');

            const token = await AsyncStorage.getItem('token');

            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }
            if (customBearerToken) {
                config.headers.Authorization = 'Bearer ' + customBearerToken;
            }
            if (idToken) {
                config.headers['id-token'] = idToken;
            }
            return config;
        },
        (error: AxiosError) => {
            if (axios.isAxiosError(error)) {
                return Promise.reject(error);
            } else {
                return Promise.reject(new Error(error));
            }
        },
    );

    instance.interceptors.response.use(
        res => {
            return res;
        },
        err => {
            if (axios.isAxiosError(err)) {
                const response = err?.response?.data as ErrorFromBEType;
                ErrorHandler.showError(response?.errorCode);
                return Promise.reject(err);
            } else {
                return Promise.reject(new Error(err));
            }
        },
    );
    return instance;
}
export default getAxiosInstance;
