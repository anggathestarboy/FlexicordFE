export interface PostCloseResponse {
  message: string;
  data: string;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
}

export type PostCloseApiResponse = PostCloseResponse | ApiErrorResponse;
