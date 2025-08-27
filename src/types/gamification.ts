export type MissionType = 'streak' | 'count' | 'duration' | 'variety' | 'consistency';
export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ChallengeType = 'weekly' | 'monthly' | 'seasonal' | 'special';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  targetValue: number;
  xpReward: number;
  badgeId?: string;
  difficulty: MissionDifficulty;
  isActive: boolean;
  progress: number;
  completedAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  mission?: Mission;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  startedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: BadgeRarity;
  category: string;
  isSecret?: boolean;
  createdAt: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge?: Badge;
  unlockedAt: Date;
  progress?: number;
  isNew?: boolean;
}

export interface UserProfile {
  userId: string;
  level: number;
  totalXP: number;
  currentXP: number;
  nextLevelXP: number;
  badges: UserBadge[];
  streak: number;
  longestStreak: number;
  totalRoutines: number;
  totalExecutions: number;
  profileAvatar?: string;
  title?: string;
  joinedAt: Date;
  lastActiveAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: ChallengeType;
  participants: number;
  maxParticipants?: number | null;
  isActive: boolean;
  rewards: ChallengeReward[];
  requirements: ChallengeRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeReward {
  id: string;
  challengeId: string;
  name: string;
  description: string;
  xpAmount?: number | null;
  badgeId?: string | null;
  requirement: string;
  createdAt: Date;
}

export interface ChallengeRequirement {
  id: string;
  challengeId: string;
  type: string;
  value: number;
  description: string;
  createdAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge?: Challenge;
  joinedAt: Date;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date | null;
  rank?: number | null;
  rewards?: ChallengeReward[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: string;
  type: 'milestone' | 'streak' | 'variety' | 'consistency' | 'social';
  requirements: AchievementRequirement[];
  xpReward: number;
  badgeReward?: string;
  isSecret?: boolean;
  createdAt: Date;
}

export interface AchievementRequirement {
  id: string;
  achievementId: string;
  type: 'routine_count' | 'streak_days' | 'total_executions' | 'categories_used' | 'consistency_score';
  operator: 'gte' | 'lte' | 'eq' | 'between';
  value: number | string;
  description: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement?: Achievement;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  unlockedAt?: Date;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  sourceType: 'routine' | 'mission' | 'achievement' | 'challenge' | 'bonus';
  sourceId: string;
  createdAt: Date;
}

export interface LevelSystem {
  level: number;
  requiredXP: number;
  title: string;
  description?: string;
  rewards?: {
    badgeId?: string;
    features?: string[];
  };
}

export interface StreakData {
  current: number;
  longest: number;
  lastExecutionDate?: Date | null;
  freezesUsed: number;
  freezesAvailable: number;
}

export interface GameNotification {
  id: string;
  userId: string;
  type: 'level_up' | 'badge_unlocked' | 'mission_completed' | 'achievement_unlocked' | 'challenge_joined';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  userProfile?: UserProfile;
  score: number;
  rank: number;
  change?: number; // 前回からの順位変動
}

export interface Leaderboard {
  id: string;
  name: string;
  type: 'xp' | 'streak' | 'completions' | 'consistency';
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface GameStats {
  totalUsers: number;
  activeUsers: number;
  totalMissions: number;
  completedMissions: number;
  totalChallenges: number;
  activeChallenges: number;
  averageLevel: number;
  topStreak: number;
}