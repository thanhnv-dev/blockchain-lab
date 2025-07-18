import {IApiResponse} from '../apiResponses/IApiResponse';

function Response<T>(apiResponse: any) {
    let res: IApiResponse<T> = {
        isSuccess: true,
        data: apiResponse.data,
        status: apiResponse.status,
    };
    return res;
}
function Error<T>(apiResponse: any) {
    let res: IApiResponse<T> = {
        isSuccess: false,
        data: apiResponse.data,
        status: apiResponse.status,
    };
    return res;
}

function NetworkError<T>(apiResponse: Error) {
    let res: IApiResponse<T> = {
        isSuccess: false,
        data: apiResponse.message as any,
    };
    return res;
}

export default {Response, Error, NetworkError};
