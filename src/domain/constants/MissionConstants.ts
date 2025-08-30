export const MISSION_CONSTANTS = {
  // Performance thresholds
  CALCULATION_TIMEOUT_MS: 500,
  MAX_EXECUTION_RECORDS_TO_PROCESS: 1000,
  
  // Date calculation constants
  MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,
  
  // Mission progress limits
  MIN_PROGRESS_VALUE: 0,
  MAX_STREAK_DAYS: 365,
  
  // Notification types
  NOTIFICATION_TYPES: {
    MISSION_COMPLETED: 'mission_completed',
    LEVEL_UP: 'level_up',
    XP_GAINED: 'xp_gained'
  } as const,
  
  // Error codes
  ERROR_CODES: {
    INVALID_MISSION_TYPE: 'INVALID_MISSION_TYPE',
    MISSION_NOT_FOUND: 'MISSION_NOT_FOUND',
    CALCULATION_FAILED: 'CALCULATION_FAILED',
    REWARD_GRANT_FAILED: 'REWARD_GRANT_FAILED'
  } as const
} as const;