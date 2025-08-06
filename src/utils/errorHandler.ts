/**
 * セキュアなエラーメッセージを生成するユーティリティ
 * サーバーの詳細情報やセンシティブなデータの漏洩を防ぐ
 */

export interface SafeError {
  message: string;
}

/**
 * APIエラーレスポンスから安全なエラーメッセージを抽出
 */
export function sanitizeApiError(errorMessage: string | undefined): string {
  if (!errorMessage) {
    return '予期しないエラーが発生しました';
  }

  // 既知のユーザー向けメッセージはそのまま返す
  const safeMessages = [
    'メールアドレスとパスワードが必要です',
    'メールアドレスまたはパスワードが正しくありません',
    'パスワードは6文字以上で入力してください',
    'このメールアドレスは既に登録されています',
    'メールアドレスの形式が正しくありません',
    'パスワードの形式が正しくありません',
    'ユーザー登録が完了しました',
    'サインインが完了しました',
    'ユーザー登録に失敗しました',
    'サインインに失敗しました',
  ];

  if (safeMessages.some((safe) => errorMessage.includes(safe))) {
    return errorMessage;
  }

  // その他のエラーは汎用メッセージに置き換え
  return 'エラーが発生しました。しばらく時間をおいて再度お試しください';
}

/**
 * ネットワークエラーや予期しないエラーのための安全なメッセージ
 */
export function getNetworkErrorMessage(): string {
  return 'ネットワークエラーが発生しました。インターネット接続を確認してください';
}

/**
 * 認証エラーのための安全なメッセージ
 */
export function getAuthErrorMessage(): string {
  return '認証に失敗しました。メールアドレスとパスワードを確認してください';
}

/**
 * サーバーエラーのための安全なメッセージ
 */
export function getServerErrorMessage(): string {
  return 'サーバーエラーが発生しました。しばらく時間をおいて再度お試しください';
}
