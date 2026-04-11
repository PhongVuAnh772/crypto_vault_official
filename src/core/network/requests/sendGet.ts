import axios from 'axios';
import AxiosInstance from 'src/core/network/config/AxiosInstance';
import transform from 'src/core/network/transform';
import ErrorLogger from 'src/core/services/ErrorLogger';

export type SendGetParamsType = {
    endPoint?: string;
    customBaseUrl?: string;
    customBearerToken?: string;
    params?: any;
    apiKey?: string;
    idToken?: string;
    customHeaders?: {[key: string]: string};
};

async function sendGet<T>({
    endPoint,
    customBaseUrl,
    customBearerToken,
    params,
    apiKey,
    idToken,
    customHeaders,
}: SendGetParamsType) {
    try {
        let axiosInstance = await AxiosInstance(
            customBaseUrl,
            customBearerToken,
            apiKey,
            idToken,
            customHeaders,
        );
        const apiResponse = await axiosInstance.get(endPoint ?? '', {
            params: params,
        });
        return transform.Response<T>(apiResponse);
    } catch (err) {
        ErrorLogger.log(err, 'network/sendGet');
        if (axios.isAxiosError(err) && err.response) {
            return transform.Error<T>(err.response);
        } else {
            return transform.NetworkError<T>(err as Error);
        }
    }
}
export default sendGet;
