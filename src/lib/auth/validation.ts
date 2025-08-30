/**
 * Authentication API Validation Utilities
 * TASK-101: 認証API実装 - 共通バリデーションロジック
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface AuthInput {
  email: string;
  password: string;
}

/**
 * Email形式をバリデーション
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: emailが必要です',
    };
  }

  const sanitizedEmail = sanitizeInput(email.trim());
  if (!sanitizedEmail) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: emailが必要です',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitizedEmail)) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: email形式が正しくありません',
    };
  }

  return { isValid: true };
}

/**
 * Password をバリデーション
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: passwordが必要です',
    };
  }

  const sanitizedPassword = sanitizeInput(password);
  if (!sanitizedPassword) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: passwordが必要です',
    };
  }

  if (sanitizedPassword.length < 8) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: passwordは8文字以上である必要があります',
    };
  }

  return { isValid: true };
}

/**
 * 認証入力データを一括バリデーション
 */
export function validateAuthInput(input: Partial<AuthInput>): ValidationResult {
  const emailResult = validateEmail(input.email || '');
  if (!emailResult.isValid) {
    return emailResult;
  }

  const passwordResult = validatePassword(input.password || '');
  if (!passwordResult.isValid) {
    return passwordResult;
  }

  return { isValid: true };
}

/**
 * 入力値のサニタイゼーション
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  // XSS攻撃を防ぐため基本的なHTMLタグを削除
  return input.replace(/[<>]/g, '');
}

/**
 * 認証入力データのサニタイゼーション
 */
export function sanitizeAuthInput(input: Partial<AuthInput>): AuthInput {
  return {
    email: input.email ? sanitizeInput(input.email.trim()) : '',
    password: input.password ? sanitizeInput(input.password) : '',
  };
}

/**
 * Supabaseエラーメッセージの変換
 */
export function mapSupabaseError(error: any): { statusCode: number; message: string } {
  const errorMessage = error?.message || '';

  // 重複メールアドレス
  if (errorMessage.includes('already registered') || errorMessage.includes('duplicate')) {
    return {
      statusCode: 409,
      message: 'このメールアドレスは既に登録されています',
    };
  }

  // 無効な認証情報
  if (errorMessage.includes('Invalid credentials') || errorMessage.includes('invalid')) {
    return {
      statusCode: 401,
      message: '認証情報が正しくありません',
    };
  }

  // その他のエラー（詳細を隠してセキュアに）
  return {
    statusCode: 500,
    message: '一時的なエラーが発生しました。しばらく経ってから再度お試しください',
  };
}