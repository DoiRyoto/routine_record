// Catchup Plan Constants
// Moved from domain layer to routine model

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'extreme';
export type PeriodType = 'daily' | 'weekly' | 'monthly';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const CATCHUP_PLAN_CONSTANTS = {
  DIFFICULTY_MULTIPLIERS: {
    easy: 1.0,
    medium: 1.2,
    hard: 1.5,
    extreme: 2.0,
  },
  
  PERIOD_DAYS: {
    daily: 1,
    weekly: 7,
    monthly: 30,
  },
  
  DAYS_PER_WEEK: 7,
  DEFAULT_DAYS_PER_MONTH: 30,
  MIN_PROGRESS_VALUE: 0,
  DEFAULT_CATCHUP_WINDOW: 7, // days
  MIN_PROGRESS_THRESHOLD: 0.5, // 50%
  MAX_DAILY_SUGGESTIONS: 3,
  
  XP_BONUSES: {
    catchup_completion: 50,
    streak_bonus: 25,
    difficulty_bonus: {
      easy: 10,
      medium: 20,
      hard: 35,
      extreme: 50,
    },
  },
  
  TIME_PREFERENCES: {
    morning: { start: 6, end: 12 },
    afternoon: { start: 12, end: 18 },
    evening: { start: 18, end: 22 },
    night: { start: 22, end: 6 },
  },
} as const;