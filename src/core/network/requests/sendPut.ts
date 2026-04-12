import axios from 'axios';
import AxiosInstance from 'src/core/network/config/AxiosInstance';
import transform from 'src/core/network/transform';
import ErrorLogger from 'src/core/services/ErrorLogger';

async function sendPut<T>({
    endPoint,
    customBaseUrl,
    customBearerToken,
    apiKey,
    idToken,
    params,
    customHeaders,
}: {
    endPoint?: string;
    customBaseUrl?: string;
    customBearerToken?: string;
    apiKey?: string;
    idToken?: string;
    params?: any;
    customHeaders?: { [key: string]: string };
}) {
    try {
        const axiosInstance = await AxiosInstance(
            customBaseUrl,
            customBearerToken,
            apiKey,
            idToken,
            customHeaders,
        );
        const url = endPoint ?? '';
        console.log(`[🚀 Calling PUT]: ${customBaseUrl ?? 'BASE'}${url}`, params ? params : '');

        const apiResponse = await axiosInstance.put(url, params);
        return transform.Response<T>(apiResponse);
    } catch (err: any) {
        console.group('[❌ NETWORK ERROR - PUT]');
        console.error('Endpoint:', endPoint);
        console.error('Full URL:', err?.config?.url);
        console.error('Message:', err.message);
        if (err.response) {
            console.error('Data:', err.response.data);
            console.error('Status:', err.response.status);
        }
        console.groupEnd();

        ErrorLogger.log(err, 'network/sendPut');
        if (axios.isAxiosError(err) && err.response) {
            return transform.Error<T>(err.response);
        } else {
            return transform.NetworkError<T>(err as Error);
        }
    }
}

export default sendPut;
