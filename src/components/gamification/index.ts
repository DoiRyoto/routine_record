export { UserAvatar } from './UserAvatar';
export { LevelProgressBar } from './LevelProgressBar';
export { ExperiencePoints } from './ExperiencePoints';
export { StreakDisplay } from './StreakDisplay';
export { StatsCard } from './StatsCard';
export { TaskCard } from './TaskCard';
export { ChallengeItem } from './ChallengeItem';
export { BadgeCollection } from './BadgeCollection';

// Type definitions
export interface StreakData {
  current: number;
  longest: number;
  freezeCount: number;
  lastActiveDate: Date;
}

export type MissionType = 'streak' | 'count' | 'variety' | 'consistency';
export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type ChallengeType = 'weekly' | 'monthly' | 'seasonal' | 'special';