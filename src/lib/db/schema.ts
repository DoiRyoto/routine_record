// Database Schema Types - Auto-generated from Drizzle
// This file contains all database entity types used throughout the application

// Common types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User and Profile types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  timezone: string;
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  level: number;
  totalXp: number;
  currentXp: number;
  nextLevelXp: number;
  streak: number;
  longestStreak: number;
  totalRoutines: number;
  totalExecutions: number;
  joinedAt: Date;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSetting {
  id: string;
  userId: string;
  theme: 'auto' | 'light' | 'dark';
  language: 'ja' | 'en';
  timeFormat: '12h' | '24h';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettingWithTimezone extends UserSetting {
  timezone?: string | null | undefined;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

// Routine related types
export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  description?: string | null | undefined;
  category: string;
  goalType: 'frequency_based' | 'schedule_based';
  targetFrequency: 'daily' | 'weekly' | 'monthly';
  targetCount?: number | null | undefined;
  targetPeriod?: string | null | undefined;
  isActive: boolean;
  deletedAt?: Date | null | undefined;
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields expected by existing code
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | 'custom' | null | undefined;
  targetValue?: number | null | undefined;
  daysOfWeek?: string | null | undefined;
  monthlyType?: string | null | undefined;
  dayOfMonth?: number | null | undefined;
  weekOfMonth?: number | null | undefined;
  dayOfWeek?: number | null | undefined;
  startDate?: Date | null | undefined;
  recurrenceInterval?: number | null | undefined;
}

export interface ExecutionRecord {
  id: string;
  routineId: string;
  userId: string;
  executedAt: Date;
  duration?: number | null | undefined;
  memo?: string | null | undefined;
  value?: number | null | undefined;
  notes?: string | null | undefined;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Gamification types
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: Date;
  isNew: boolean;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'seasonal' | 'special';
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  joinedAt: Date;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date | null;
  rank?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'count' | 'variety' | 'consistency';
  targetValue: number;
  xpReward: number;
  badgeId?: string | null | undefined;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  progress: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date | null | undefined;
  claimedAt?: Date | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  sourceType: 'routine_completion' | 'streak_bonus' | 'mission_completion' | 'challenge_completion' | 'daily_bonus' | 'achievement_unlock';
  sourceId?: string;
  createdAt: Date;
}

export interface GameNotification {
  id: string;
  userId: string;
  type: 'level_up' | 'badge_unlocked' | 'mission_completed' | 'challenge_completed' | 'streak_milestone' | 'xp_milestone';
  title: string;
  message: string;
  data?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CatchupPlan {
  id: string;
  routineId: string;
  userId: string;
  targetPeriodStart: Date;
  targetPeriodEnd: Date;
  originalTarget: number;
  currentProgress: number;
  remainingTarget: number;
  suggestedDailyTarget: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Insert types (for database insertion)
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertUserProfile = Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>;
export type InsertUserSetting = Omit<UserSetting, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertCategory = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertRoutine = Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertExecutionRecord = Omit<ExecutionRecord, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertBadge = Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertUserBadge = Omit<UserBadge, 'id' | 'createdAt'>;
export type InsertChallenge = Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertUserChallenge = Omit<UserChallenge, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertMission = Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertUserMission = Omit<UserMission, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertXPTransaction = Omit<XPTransaction, 'id' | 'createdAt'>;
export type InsertGameNotification = Omit<GameNotification, 'id' | 'createdAt'>;
export type InsertCatchupPlan = Omit<CatchupPlan, 'id' | 'createdAt' | 'updatedAt'>;

// Compound types commonly used in the application
export interface BadgeWithUserData extends Badge {
  userBadge?: UserBadge;
  isEarned: boolean;
}

export interface RoutineWithCategory extends Routine {
  categoryData?: Category;
}

export interface ChallengeWithProgress extends Challenge {
  userChallenge?: UserChallenge;
  progress: number;
}

export interface LeaderboardEntry {
  user: UserProfile;
  score: number;
  rank: number;
}