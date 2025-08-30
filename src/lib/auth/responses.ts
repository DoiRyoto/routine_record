/**
 * Authentication API Response Utilities
 * TASK-101: 認証API実装 - 統一レスポンス形式
 */

import { NextResponse } from 'next/server';

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
  };
}

/**
 * 成功レスポンスの生成
 */
export function createSuccessResponse(
  message: string, 
  statusCode: number = 200,
  user?: { id: string; email: string }
): NextResponse<AuthResponse> {
  const response: AuthResponse = {
    success: true,
    message,
  };

  if (user) {
    response.user = user;
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * エラーレスポンスの生成
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 500
): NextResponse<AuthResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status: statusCode }
  );
}

/**
 * バリデーションエラーレスポンス
 */
export function createValidationErrorResponse(error: string): NextResponse<AuthResponse> {
  return createErrorResponse(error, 400);
}

/**
 * 認証エラーレスポンス
 */
export function createAuthErrorResponse(): NextResponse<AuthResponse> {
  return createErrorResponse('認証情報が正しくありません', 401);
}

/**
 * 重複エラーレスポンス
 */
export function createConflictErrorResponse(): NextResponse<AuthResponse> {
  return createErrorResponse('このメールアドレスは既に登録されています', 409);
}

/**
 * サーバーエラーレスポンス
 */
export function createServerErrorResponse(): NextResponse<AuthResponse> {
  return createErrorResponse(
    '一時的なエラーが発生しました。しばらく経ってから再度お試しください',
    500
  );
}

/**
 * 設定不備エラーレスポンス
 */
export function createConfigErrorResponse(): NextResponse<AuthResponse> {
  return createServerErrorResponse(); // 設定情報は隠蔽
}