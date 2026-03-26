export interface BaseResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface EmptyResponse {
  code: number;
  message: string;
  data?: null;
}