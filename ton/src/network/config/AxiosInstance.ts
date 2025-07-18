import axios, { AxiosError } from "axios";
import EnvConfig from "../../common/EnvConfig";

async function getAxiosInstance(
  customBaseUrl?: string,
  apiKey?: string,
  customHeaders?: { [key: string]: string }
) {
  const instance = axios.create({
    baseURL: customBaseUrl ?? EnvConfig.TON_API_BASE_URL,
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": apiKey ?? EnvConfig.TON_API_TOKEN,
      ...customHeaders,
    },
  });

  instance.interceptors.request.use(
    async (config: any) => {
      console.log("-----API CALL-----");
      console.warn(`--${config?.url}--`);
      console.log("-------------------");

      return config;
    },
    (error: AxiosError) => {
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
      if (axios.isAxiosError(err)) {
        // if (err?.response?.status === 400) {
        //     if (response?.errorCode === '1000157') {
        //         dispatch(setAccountDeactivate(true));
        //     }
        // }
        return Promise.reject(err);
      } else {
        return Promise.reject(new Error(err));
      }
    }
  );
  return instance;
}
export default getAxiosInstance;
