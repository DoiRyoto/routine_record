export const CATCHUP_PLAN_CONSTANTS = {
  // Time calculation constants
  MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DEFAULT_DAYS_PER_MONTH: 30,
  MIN_REMAINING_DAYS: 1,
  
  // Difficulty thresholds
  DIFFICULTY_THRESHOLDS: {
    EASY_MAX: 1,
    MODERATE_MAX: 2,
    HARD_MAX: 4
    // Above 4 is extreme
  } as const,
  
  // Progress calculation
  MIN_PROGRESS_VALUE: 0,
  FULL_PROGRESS_PERCENTAGE: 100,
  HIGH_PROGRESS_THRESHOLD: 80,
  MEDIUM_PROGRESS_THRESHOLD: 50,
  
  // Time of day suggestions
  TIME_OF_DAY_BOUNDARIES: {
    MORNING_END: 12,
    AFTERNOON_END: 17
  } as const,
  
  // Error messages
  ERROR_MESSAGES: {
    USER_PLANS_FETCH_FAILED: 'ユーザー挽回プランの取得に失敗しました',
    ACTIVE_PLANS_FETCH_FAILED: 'アクティブな挽回プランの取得に失敗しました',
    PLAN_CREATION_FAILED: '挽回プランの作成に失敗しました',
    PLAN_UPDATE_FAILED: '挽回プランの更新に失敗しました',
    PROGRESS_UPDATE_FAILED: '挽回プラン進捗の更新に失敗しました',
    PLAN_DEACTIVATION_FAILED: '挽回プランの非アクティブ化に失敗しました',
    ROUTINE_PLAN_FETCH_FAILED: 'ルーティン別挽回プランの取得に失敗しました',
    PLAN_DELETION_FAILED: '挽回プランの削除に失敗しました',
    PLAN_NOT_FOUND: '挽回プランが見つかりません'
  } as const,
  
  // Validation constants
  VALIDATION: {
    MAX_DAILY_TARGET: 10, // Reasonable upper limit for daily targets
    MIN_TARGET_PERIOD_DAYS: 1
  } as const
} as const;

// Type definitions for better type safety
export type DifficultyLevel = 'easy' | 'moderate' | 'hard' | 'extreme';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export type PeriodType = 'weekly' | 'monthly';
