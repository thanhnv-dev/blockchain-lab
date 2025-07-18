import axios from "axios";
import AxiosInstance from "../config/AxiosInstance";
import transform from "../transform";

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
  customHeaders?: { [key: string]: string };
}) {
  try {
    const axiosInstance = await AxiosInstance(
      customBaseUrl,
      apiKey,
      customHeaders
    );
    const apiResponse = await axiosInstance.patch(endPoint ?? "", params);
    return transform.Response<T>(apiResponse);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      return transform.Error<T>(err.response);
    } else {
      return transform.NetworkError<T>(err);
    }
  }
}

export default sendPatch;
