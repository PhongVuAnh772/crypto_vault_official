import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";
import { ErrorFromBEType } from "src/type/NetworkType";

const showError = (errorCode: string) => {};

// Utils.showToast({
//   msg: AppI18Next.t(errorMessage),
//   type: AppToastType.error,
// });

async function getAxiosInstance(
  customBaseUrl?: string,
  customBearerToken?: string,
  apiKey?: string,
  idToken?: string, // for rez-point
  customHeaders?: { [key: string]: string }
) {
  const instance = axios.create({
    baseURL: customBaseUrl ?? "https://redx-api.nws-dev.com",
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": "",
      ...customHeaders,
    },
  });

  instance.interceptors.request.use(
    async (config: any) => {
      console.log("-----API CALL-----");
      console.warn(`--${config?.url}--`);
      console.log("-------------------");

      const token = await AsyncStorage.getItem("token");

      if (token) {
        config.headers.Authorization = "Bearer " + token;
      }
      if (customBearerToken) {
        config.headers.Authorization = "Bearer " + customBearerToken;
      }
      if (idToken) {
        config.headers["id-token"] = idToken;
      }
      return config;
    },
    (error: AxiosError) => {
      // eslint-disable-next-line import/no-named-as-default-member
      if (axios.isAxiosError(error)) {
        return Promise.reject(error);
      } else {
        return Promise.reject(new Error(error));
      }
    }
  );

  instance.interceptors.response.use(
    (res) => {
      return res;
    },
    (err) => {
      // eslint-disable-next-line import/no-named-as-default-member
      if (axios.isAxiosError(err)) {
        const response = err?.response?.data as ErrorFromBEType;

        // if (err?.response?.status === 400) {
        //     if (response?.errorCode === '1000157') {
        //         dispatch(setAccountDeactivate(true));
        //     }
        // }

        showError(response?.errorCode);
        return Promise.reject(err);
      } else {
        return Promise.reject(new Error(err));
      }
    }
  );
  return instance;
}
export default getAxiosInstance;
