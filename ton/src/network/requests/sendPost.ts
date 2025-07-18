import axios from "axios";
import AxiosInstance from "../config/AxiosInstance";
import transform from "../transform";

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
  apiKey,
  customHeaders,
}: SendPostParamsType) {
  try {
    const axiosInstance = await AxiosInstance(
      customBaseUrl,
      apiKey,
      customHeaders
    );
    const apiResponse = await axiosInstance.post(
      endPoint ?? "",
      JSON.stringify(body)
    );
    return transform.Response<T>(apiResponse);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return transform.Error<T>(err.response);
    } else {
      return transform.NetworkError<T>(err as Error);
    }
  }
}

export default sendPost;
