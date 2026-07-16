import axios from 'axios';
import AxiosInstance from 'src/core/network/config/AxiosInstance';
import transform from 'src/core/network/transform';
import ErrorLogger from 'src/core/services/ErrorLogger';

async function sendDelete<T>({
    endPoint,
    body,
    customBaseUrl,
    customBearerToken,
    apiKey,
    params,
    customHeaders,
}: {
    endPoint?: string;
    body?: any;
    customBaseUrl?: string;
    customBearerToken?: string;
    apiKey?: string;
    params?: any;
    customHeaders?: any;
}) {
    try {
        const axiosInstance = await AxiosInstance(
            customBaseUrl,
            null as any,
            apiKey,
            null as any,
            customHeaders,
        );
        const url = endPoint ?? '';
        console.log(`[🚀 Calling DELETE]: ${customBaseUrl ?? 'BASE'}${url}`, body ? body : '');

        const apiResponse = await axiosInstance.delete(url, {
            data: body,
        });
        return transform.Response<T>(apiResponse);
    } catch (err: any) {
        console.group('[❌ NETWORK ERROR - DELETE]');
        console.error('Endpoint:', endPoint);
        console.error('Full URL:', err?.config?.url);
        console.error('Message:', err.message);
        if (err.response) {
            console.error('Data:', err.response.data);
            console.error('Status:', err.response.status);
        }
        console.groupEnd();

        ErrorLogger.log(err, 'network/sendDelete');
        if (axios.isAxiosError(err) && err.response) {
            return transform.Error<T>(err.response);
        } else {
            return transform.NetworkError<T>(err as Error);
        }
    }
}

export default sendDelete;
