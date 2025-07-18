import axios from "axios";
import AxiosInstance from "../config/AxiosInstance";
import transform from "../transform";

async function sendDelete<T>({
  endPoint,
  customBaseUrl,
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
    const axiosInstance = await AxiosInstance(customBaseUrl, apiKey, {});

    const apiResponse = await axiosInstance.delete(endPoint ?? "", {
      params: params,
    });

    return transform.Response<T>(apiResponse);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      return transform.Error<T>(err.response);
    } else {
      return transform.NetworkError<T>(err);
    }
  }
}

export default sendDelete;
