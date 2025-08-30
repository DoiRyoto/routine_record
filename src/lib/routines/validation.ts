/**
 * Routine Management API Validation Utilities
 * TASK-102: ルーチン管理API実装 - バリデーションロジック
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface RoutineInput {
  name: string;
  description?: string;
  category: string;
  goalType: 'frequency_based' | 'schedule_based';
  targetCount?: number;
  targetPeriod?: 'daily' | 'weekly' | 'monthly';
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceInterval?: number;
  monthlyType?: 'day_of_month' | 'day_of_week';
  dayOfMonth?: number;
  weekOfMonth?: number;
  dayOfWeek?: number;
  daysOfWeek?: number[];
  startDate?: string;
}

/**
 * 必須フィールドのバリデーション
 */
export function validateRequiredFields(input: Partial<RoutineInput>): ValidationResult {
  if (!input.name || typeof input.name !== 'string' || input.name.trim() === '') {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: nameが必要です',
    };
  }

  if (!input.category || typeof input.category !== 'string' || input.category.trim() === '') {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: categoryが必要です',
    };
  }

  if (!input.goalType || (input.goalType !== 'frequency_based' && input.goalType !== 'schedule_based')) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: goalTypeが必要です',
    };
  }

  return { isValid: true };
}

/**
 * REQ-404: 文字数制限のバリデーション
 */
export function validateFieldLengths(input: Partial<RoutineInput>): ValidationResult {
  if (input.name && input.name.length > 100) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: nameは100文字以下である必要があります',
    };
  }

  if (input.description && input.description.length > 500) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: descriptionは500文字以下である必要があります',
    };
  }

  if (input.category && input.category.length > 50) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: categoryは50文字以下である必要があります',
    };
  }

  return { isValid: true };
}

/**
 * REQ-101: 頻度ベース検証
 */
export function validateFrequencyBased(input: Partial<RoutineInput>): ValidationResult {
  if (input.goalType !== 'frequency_based') {
    return { isValid: true };
  }

  if (!input.targetCount || typeof input.targetCount !== 'number' || input.targetCount < 1) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: 頻度ベースではtargetCountが必要です',
    };
  }

  if (!input.targetPeriod || !['daily', 'weekly', 'monthly'].includes(input.targetPeriod)) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: 頻度ベースではtargetPeriodが必要です',
    };
  }

  return { isValid: true };
}

/**
 * スケジュールベース検証
 */
export function validateScheduleBased(input: Partial<RoutineInput>): ValidationResult {
  if (input.goalType !== 'schedule_based') {
    return { isValid: true };
  }

  if (!input.recurrenceType || !['daily', 'weekly', 'monthly', 'custom'].includes(input.recurrenceType)) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: スケジュールベースではrecurrenceTypeが必要です',
    };
  }

  if (input.recurrenceInterval !== undefined && (typeof input.recurrenceInterval !== 'number' || input.recurrenceInterval < 1)) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: recurrenceIntervalは1以上である必要があります',
    };
  }

  return { isValid: true };
}

/**
 * 月次パターン検証
 */
export function validateMonthlyPattern(input: Partial<RoutineInput>): ValidationResult {
  if (input.recurrenceType !== 'monthly') {
    return { isValid: true };
  }

  if (input.monthlyType === 'day_of_month') {
    if (!input.dayOfMonth || input.dayOfMonth < 1 || input.dayOfMonth > 31) {
      return {
        isValid: false,
        error: '入力内容に誤りがあります: dayOfMonthは1-31の範囲で必要です',
      };
    }
  } else if (input.monthlyType === 'day_of_week') {
    if (!input.weekOfMonth || (input.weekOfMonth < 1 && input.weekOfMonth !== -1) || input.weekOfMonth > 4) {
      return {
        isValid: false,
        error: '入力内容に誤りがあります: weekOfMonthは1-4または-1で必要です',
      };
    }
    if (input.dayOfWeek === undefined || input.dayOfWeek < 0 || input.dayOfWeek > 6) {
      return {
        isValid: false,
        error: '入力内容に誤りがあります: dayOfWeekは0-6の範囲で必要です',
      };
    }
  }

  return { isValid: true };
}

/**
 * 週次パターン検証
 */
export function validateWeeklyPattern(input: Partial<RoutineInput>): ValidationResult {
  if (input.recurrenceType !== 'weekly') {
    return { isValid: true };
  }

  if (input.daysOfWeek && Array.isArray(input.daysOfWeek)) {
    if (input.daysOfWeek.length === 0) {
      return {
        isValid: false,
        error: '入力内容に誤りがあります: daysOfWeekは1個以上の要素が必要です',
      };
    }

    for (const day of input.daysOfWeek) {
      if (typeof day !== 'number' || day < 0 || day > 6) {
        return {
          isValid: false,
          error: '入力内容に誤りがあります: daysOfWeekは0-6の数値配列である必要があります',
        };
      }
    }

    // 重複チェック
    const uniqueDays = [...new Set(input.daysOfWeek)];
    if (uniqueDays.length !== input.daysOfWeek.length) {
      return {
        isValid: false,
        error: '入力内容に誤りがあります: daysOfWeekに重複があります',
      };
    }
  }

  return { isValid: true };
}

/**
 * ルーチン入力データを一括バリデーション
 */
export function validateRoutineInput(input: Partial<RoutineInput>): ValidationResult {
  // 必須フィールド検証
  const requiredResult = validateRequiredFields(input);
  if (!requiredResult.isValid) {
    return requiredResult;
  }

  // 文字数制限検証
  const lengthResult = validateFieldLengths(input);
  if (!lengthResult.isValid) {
    return lengthResult;
  }

  // 頻度ベース検証
  const frequencyResult = validateFrequencyBased(input);
  if (!frequencyResult.isValid) {
    return frequencyResult;
  }

  // スケジュールベース検証
  const scheduleResult = validateScheduleBased(input);
  if (!scheduleResult.isValid) {
    return scheduleResult;
  }

  // 月次パターン検証
  const monthlyResult = validateMonthlyPattern(input);
  if (!monthlyResult.isValid) {
    return monthlyResult;
  }

  // 週次パターン検証
  const weeklyResult = validateWeeklyPattern(input);
  if (!weeklyResult.isValid) {
    return weeklyResult;
  }

  // 開始日検証
  const dateResult = validateDateString(input.startDate);
  if (!dateResult.isValid) {
    return dateResult;
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
  // XSS攻撃を防ぐため基本的なHTMLタグとスクリプトを削除
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * 日付文字列のバリデーション
 */
export function validateDateString(dateString?: string): ValidationResult {
  if (!dateString) {
    return { isValid: true };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: 有効な日付形式を入力してください',
    };
  }

  // 未来の日付のみ許可（開始日として合理的）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return {
      isValid: false,
      error: '入力内容に誤りがあります: startDateは今日以降の日付である必要があります',
    };
  }

  return { isValid: true };
}

/**
 * ルーチン入力データのサニタイゼーション
 */
export function sanitizeRoutineInput(input: Partial<RoutineInput>): Partial<RoutineInput> {
  const sanitized: Partial<RoutineInput> = {};

  if (input.name) sanitized.name = sanitizeInput(input.name.trim());
  if (input.description) sanitized.description = sanitizeInput(input.description.trim());
  if (input.category) sanitized.category = sanitizeInput(input.category.trim());
  if (input.goalType) sanitized.goalType = input.goalType;
  if (input.targetCount) sanitized.targetCount = input.targetCount;
  if (input.targetPeriod) sanitized.targetPeriod = input.targetPeriod;
  if (input.recurrenceType) sanitized.recurrenceType = input.recurrenceType;
  if (input.recurrenceInterval) sanitized.recurrenceInterval = input.recurrenceInterval;
  if (input.monthlyType) sanitized.monthlyType = input.monthlyType;
  if (input.dayOfMonth) sanitized.dayOfMonth = input.dayOfMonth;
  if (input.weekOfMonth) sanitized.weekOfMonth = input.weekOfMonth;
  if (input.dayOfWeek !== undefined) sanitized.dayOfWeek = input.dayOfWeek;
  if (input.daysOfWeek) sanitized.daysOfWeek = input.daysOfWeek;
  if (input.startDate) sanitized.startDate = input.startDate;

  return sanitized;
}