import axios from 'axios';
import AxiosInstance from 'src/core/network/config/AxiosInstance';
import transform from 'src/core/network/transform';
import ErrorLogger from 'src/core/services/ErrorLogger';

async function sendDelete<T>({
    endPoint,
    customBaseUrl,
    customBearerToken,
    apiKey,
    params,
}: {
    endPoint?: string;
    body?: any;
    customBaseUrl?: string;
    customBearerToken?: string;
    apiKey?: string;
    params?: any;
}) {
    try {
        const axiosInstance = await AxiosInstance(
            customBaseUrl,
            customBearerToken,
            apiKey,
        );

        const apiResponse = await axiosInstance.delete(endPoint ?? '', {
            params: params,
        });

        return transform.Response<T>(apiResponse);
    } catch (err: any) {
        ErrorLogger.log(err, 'network');
        if (axios.isAxiosError(err) && err.response) {
            return transform.Error<T>(err.response);
        } else {
            return transform.NetworkError<T>(err);
        }
    }
}

export default sendDelete;
