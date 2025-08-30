/**
 * Routine Management API Logging Utilities
 * TASK-102: ルーチン管理API実装 - ログ管理
 */

interface LogContext {
  userId?: string;
  routineId?: string;
  action?: string;
  requestData?: any;
  error?: Error;
  timestamp?: Date;
}

/**
 * エラーログの記録
 */
export function logRoutineError(context: LogContext, message: string): void {
  const timestamp = new Date().toISOString();
  const logData = {
    level: 'error',
    service: 'routine-api',
    message,
    timestamp,
    ...context,
  };

  // 本番環境では構造化ログとして出力
  if (process.env.NODE_ENV === 'production') {
    console.error(JSON.stringify(logData));
  } else {
    // 開発環境では読みやすい形式で出力
    console.error(`[ROUTINE ERROR] ${message}`, {
      userId: context.userId,
      routineId: context.routineId,
      action: context.action,
      error: context.error?.message,
      stack: context.error?.stack,
    });
  }
}

/**
 * 成功ログの記録
 */
export function logRoutineSuccess(context: LogContext, message: string): void {
  const timestamp = new Date().toISOString();
  const logData = {
    level: 'info',
    service: 'routine-api',
    message,
    timestamp,
    ...context,
  };

  // 本番環境では構造化ログとして出力
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(logData));
  } else {
    // 開発環境では読みやすい形式で出力
    // eslint-disable-next-line no-console
    console.log(`[ROUTINE INFO] ${message}`, {
      userId: context.userId,
      routineId: context.routineId,
      action: context.action,
    });
  }
}

/**
 * パフォーマンスログの記録
 */
export function logRoutinePerformance(
  context: LogContext,
  operation: string,
  duration: number
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    level: 'debug',
    service: 'routine-api',
    message: `${operation} completed in ${duration}ms`,
    timestamp,
    duration,
    operation,
    ...context,
  };

  // デバッグモードでのみ出力
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
    // eslint-disable-next-line no-console
    console.debug(JSON.stringify(logData));
  }
}