// Mission System Components
export { MissionCard } from './MissionCard';
export { MissionTracker } from './MissionTracker';

// Progression Components  
export { ProgressBar } from './ProgressBar';
export { LevelIndicator } from './LevelIndicator';
export { XPCounter } from './XPCounter';
export { StreakCounter } from './StreakCounter';

// User Profile Components
export { ProfileAvatar } from './ProfileAvatar';
export { BadgeGrid } from './BadgeGrid';
export { StatCard } from './StatCard';

// Challenge Components
export { ChallengeCard } from './ChallengeCard';

// Notification Components
export { AchievementNotification, AchievementNotificationManager } from './AchievementNotification';

// Utility Components
export { GameTooltip, BadgeTooltip, MissionTooltip } from './GameTooltip';

// Re-export types for convenience
export type {
  Mission,
  UserMission,
  Badge,
  UserBadge,
  UserProfile,
  Challenge,
  UserChallenge,
  Achievement,
  UserAchievement,
  XPTransaction,
  LevelSystem,
  StreakData,
  GameNotification,
  LeaderboardEntry,
  Leaderboard,
  GameStats,
  MissionType,
  MissionDifficulty,
  BadgeRarity,
  ChallengeType
} from '@/types/gamification';