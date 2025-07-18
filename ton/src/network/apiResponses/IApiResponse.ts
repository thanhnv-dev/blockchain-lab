export interface IApiResponse<T> extends ApiResponse {
    data?: T;
}

interface ApiResponse {
    isSuccess: boolean;
    status?: number;
}
export type Headers = {
    ['x-next-page']: number;
    ['x-page']: number;
    ['x-pages-count']: number;
    ['x-per-page']: number;
    ['x-total-count']: number;
};
