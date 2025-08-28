// 標準APIレスポンス型
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// エラーレスポンス型
export interface APIErrorResponse {
  success: false;
  error: string;
  data?: never;
}

// 成功レスポンス型
export interface APISuccessResponse<T> {
  success: true;
  data: T;
  error?: never;
  message?: string;
}

// 型安全なAPIレスポンス型
export type TypedAPIResponse<T> = APISuccessResponse<T> | APIErrorResponse;