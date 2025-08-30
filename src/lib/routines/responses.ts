/**
 * Routine Management API Response Utilities
 * TASK-102: ルーチン管理API実装 - 統一レスポンス形式
 */

import { NextResponse } from 'next/server';

export interface RoutineResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * 成功レスポンスの生成
 */
export function createSuccessResponse(
  data: any,
  message?: string,
  statusCode: number = 200
): NextResponse<RoutineResponse> {
  const response: RoutineResponse = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * エラーレスポンスの生成
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 500
): NextResponse<RoutineResponse> {
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
export function createValidationErrorResponse(error: string): NextResponse<RoutineResponse> {
  return createErrorResponse(error, 400);
}

/**
 * 認証エラーレスポンス
 */
export function createAuthErrorResponse(): NextResponse<RoutineResponse> {
  return createErrorResponse('認証が必要です', 401);
}

/**
 * 権限エラーレスポンス
 */
export function createPermissionErrorResponse(): NextResponse<RoutineResponse> {
  return createErrorResponse('このルーチンにアクセスする権限がありません', 403);
}

/**
 * リソース未発見エラーレスポンス
 */
export function createNotFoundErrorResponse(): NextResponse<RoutineResponse> {
  return createErrorResponse('指定されたルーチンが見つかりません', 404);
}

/**
 * REQ-102 実行制限エラーレスポンス
 */
export function createUnavailableErrorResponse(): NextResponse<RoutineResponse> {
  return createErrorResponse('このルーチンは現在利用できません', 400);
}

/**
 * 重複エラーレスポンス
 */
export function createConflictErrorResponse(message: string): NextResponse<RoutineResponse> {
  return createErrorResponse(message, 409);
}

/**
 * サーバーエラーレスポンス
 */
export function createServerErrorResponse(): NextResponse<RoutineResponse> {
  return createErrorResponse(
    '一時的なエラーが発生しました。しばらく経ってから再度お試しください',
    500
  );
}