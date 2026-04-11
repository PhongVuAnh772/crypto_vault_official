import axios from 'axios';
import AxiosInstance from 'src/core/network/config/AxiosInstance';
import transform from 'src/core/network/transform';
import ErrorLogger from 'src/core/services/ErrorLogger';

export type SendPostParamsType = {
    endPoint?: string;
    body: any;
    customBaseUrl?: string;
    customBearerToken?: string;
    apiKey?: string;
    idToken?: string; //for rez-point
    customHeaders?: { [key: string]: string };
};

async function sendPost<T>({
    endPoint,
    body,
    customBaseUrl,
    customBearerToken,
    apiKey,
    idToken,
    customHeaders,
}: SendPostParamsType) {
    try {
        const axiosInstance = await AxiosInstance(
            customBaseUrl,
            customBearerToken,
            apiKey,
            idToken,
            customHeaders,
        );
        const apiResponse = await axiosInstance.post(
            endPoint ?? '',
            JSON.stringify(body),
        );
        return transform.Response<T>(apiResponse);
    } catch (err) {
        ErrorLogger.log(err, 'network/sendPost');
        if (axios.isAxiosError(err) && err.response) {
            return transform.Error<T>(err.response);
        } else {
            return transform.NetworkError<T>(err as Error);
        }
    }
}

export default sendPost;
