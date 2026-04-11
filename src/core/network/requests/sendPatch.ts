import axios from 'axios';
import AxiosInstance from 'src/core/network/config/AxiosInstance';
import transform from 'src/core/network/transform';
import ErrorLogger from 'src/core/services/ErrorLogger';

async function sendPatch<T>({
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
    customHeaders?: {[key: string]: string};
}) {
    try {
        const axiosInstance = await AxiosInstance(
            customBaseUrl,
            customBearerToken,
            apiKey,
            idToken,
            customHeaders,
        );
        const apiResponse = await axiosInstance.patch(endPoint ?? '', params);
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

export default sendPatch;
