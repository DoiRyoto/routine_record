import { CATCHUP_PLAN_CONSTANTS, DifficultyLevel, TimeOfDay } from '@/domain/constants/CatchupPlanConstants';
import type { ExecutionRecord } from '@/lib/db/schema';

/**
 * Utility functions for catch-up plan calculations
 * Extracted to improve reusability and reduce code duplication
 */

/**
 * Calculate remaining days between current date and end date, excluding paused days
 */
export function calculateRemainingDays(
  currentDate: Date, 
  endDate: Date, 
  excludePausedDays: Date[] = []
): number {
  const totalRemainingDays = Math.max(
    0, 
    Math.ceil((endDate.getTime() - currentDate.getTime()) / CATCHUP_PLAN_CONSTANTS.MILLISECONDS_PER_DAY)
  );
  
  if (excludePausedDays.length === 0) {
    return Math.max(CATCHUP_PLAN_CONSTANTS.MIN_REMAINING_DAYS, totalRemainingDays);
  }

  // Count paused days that fall within the remaining period
  const pausedDaysInRemainingPeriod = excludePausedDays.filter(
    pausedDay => pausedDay >= currentDate && pausedDay <= endDate
  ).length;

  return Math.max(
    CATCHUP_PLAN_CONSTANTS.MIN_REMAINING_DAYS, 
    totalRemainingDays - pausedDaysInRemainingPeriod
  );
}

/**
 * Calculate suggested daily target based on remaining target and days
 */
export function calculateSuggestedDailyTarget(
  remainingTarget: number, 
  remainingDays: number
): number {
  return remainingDays > 0 ? Math.ceil(remainingTarget / remainingDays) : 0;
}

/**
 * Determine difficulty level based on suggested daily target
 */
export function determineDifficultyLevel(suggestedDailyTarget: number): DifficultyLevel {
  const { DIFFICULTY_THRESHOLDS } = CATCHUP_PLAN_CONSTANTS;
  
  if (suggestedDailyTarget <= DIFFICULTY_THRESHOLDS.EASY_MAX) return 'easy';
  if (suggestedDailyTarget <= DIFFICULTY_THRESHOLDS.MODERATE_MAX) return 'moderate';
  if (suggestedDailyTarget <= DIFFICULTY_THRESHOLDS.HARD_MAX) return 'hard';
  return 'extreme';
}

/**
 * Check if a catch-up plan is achievable based on difficulty level
 */
export function isAchievable(difficultyLevel: DifficultyLevel): boolean {
  return difficultyLevel !== 'extreme';
}

/**
 * Calculate consistency score based on execution pattern
 */
export function calculateConsistencyScore(
  executionRecords: ExecutionRecord[], 
  targetPeriod: { start: Date; end: Date }
): number {
  if (executionRecords.length === 0) return 0;

  const totalDays = Math.ceil(
    (targetPeriod.end.getTime() - targetPeriod.start.getTime()) / 
    CATCHUP_PLAN_CONSTANTS.MILLISECONDS_PER_DAY
  );
  
  const executionDays = new Set(
    executionRecords.map(record => record.executedAt.toDateString())
  ).size;

  return Math.round((executionDays / totalDays) * CATCHUP_PLAN_CONSTANTS.FULL_PROGRESS_PERCENTAGE);
}

/**
 * Suggest optimal time of day based on execution history
 */
export function suggestOptimalTimeOfDay(executionRecords: ExecutionRecord[]): TimeOfDay {
  if (executionRecords.length === 0) return 'morning';

  const hourCounts: { [hour: number]: number } = {};
  
  executionRecords.forEach(record => {
    const hour = new Date(record.executedAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const mostCommonHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  if (!mostCommonHour) return 'morning';

  const hour = parseInt(mostCommonHour);
  const { TIME_OF_DAY_BOUNDARIES } = CATCHUP_PLAN_CONSTANTS;
  
  if (hour < TIME_OF_DAY_BOUNDARIES.MORNING_END) return 'morning';
  if (hour < TIME_OF_DAY_BOUNDARIES.AFTERNOON_END) return 'afternoon';
  return 'evening';
}

/**
 * Calculate weekday target adjustments for better distribution
 */
export function calculateWeekdayAdjustments(
  executionRecords: ExecutionRecord[], 
  remainingDays: number
): { [key: string]: number } {
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const adjustments: { [key: string]: number } = {};

  // Simple equal distribution as baseline
  const baseTarget = remainingDays > 0 ? 
    Math.ceil(remainingDays / CATCHUP_PLAN_CONSTANTS.DAYS_PER_WEEK) : 0;
  
  weekdays.forEach(day => {
    adjustments[day] = baseTarget;
  });

  return adjustments;
}

/**
 * Generate progress message based on current state
 */
export function generateProgressMessage(
  currentProgress: number,
  targetCount: number,
  remainingTarget: number,
  remainingDays: number,
  periodType: 'weekly' | 'monthly'
): string {
  if (remainingTarget === 0) {
    return `🎉 ${periodType === 'weekly' ? '今週' : '今月'}の目標を達成しました！`;
  }
  
  if (remainingDays === 0) {
    return `⏰ 期限終了。最終結果: ${currentProgress}/${targetCount}回`;
  }
  
  const progressRate = Math.round(
    (currentProgress / targetCount) * CATCHUP_PLAN_CONSTANTS.FULL_PROGRESS_PERCENTAGE
  );
  
  const { HIGH_PROGRESS_THRESHOLD, MEDIUM_PROGRESS_THRESHOLD } = CATCHUP_PLAN_CONSTANTS;
  
  if (progressRate >= HIGH_PROGRESS_THRESHOLD) {
    return `👍 順調です！あと${remainingTarget}回で目標達成`;
  } else if (progressRate >= MEDIUM_PROGRESS_THRESHOLD) {
    return `💪 頑張りましょう！残り${remainingDays}日で${remainingTarget}回`;
  } else {
    return `🚨 挽回が必要です！残り${remainingDays}日で${remainingTarget}回`;
  }
}

/**
 * Validate catch-up plan input data
 */
export function validateCatchupPlanInput(input: {
  routine: any;
  currentDate: Date;
  targetPeriod: { start: Date; end: Date };
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.routine) {
    errors.push('Routine is required');
  }

  if (!input.currentDate || !(input.currentDate instanceof Date)) {
    errors.push('Valid current date is required');
  }

  if (!input.targetPeriod || !input.targetPeriod.start || !input.targetPeriod.end) {
    errors.push('Valid target period is required');
  }

  if (input.targetPeriod && input.targetPeriod.start >= input.targetPeriod.end) {
    errors.push('Target period start must be before end');
  }

  const periodDays = input.targetPeriod ? 
    Math.ceil((input.targetPeriod.end.getTime() - input.targetPeriod.start.getTime()) / CATCHUP_PLAN_CONSTANTS.MILLISECONDS_PER_DAY) : 0;
  
  if (periodDays < CATCHUP_PLAN_CONSTANTS.VALIDATION.MIN_TARGET_PERIOD_DAYS) {
    errors.push('Target period must be at least 1 day');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
