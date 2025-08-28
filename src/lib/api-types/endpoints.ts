import type { 
  Routine, 
  ExecutionRecord, 
  UserSetting, 
  Category,
  UserProfile,
  Challenge,
  UserChallenge,
  Mission,
  UserMission,
} from '@/lib/db/schema';

import type { TypedAPIResponse } from './common';

// エンドポイント別レスポンス型定義

// Routines API
export type RoutinesGetResponse = TypedAPIResponse<Routine[]>;
export type RoutinePostResponse = TypedAPIResponse<Routine>;

export interface RoutineCreateRequest {
  name: string;
  description?: string | null;
  category: string;
  goalType: 'frequency_based' | 'schedule_based';
  targetCount?: number | null;
  targetPeriod?: string | null;
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceInterval?: number;
  monthlyType?: 'day_of_month' | 'day_of_week' | null;
  dayOfMonth?: number | null;
  weekOfMonth?: number | null;
  dayOfWeek?: number | null;
  daysOfWeek?: string | null;
  startDate?: Date | string | null;
  isActive?: boolean;
}

// Execution Records API
export type ExecutionRecordsGetResponse = TypedAPIResponse<ExecutionRecord[]>;
export type ExecutionRecordPostResponse = TypedAPIResponse<ExecutionRecord>;

export interface ExecutionRecordCreateRequest {
  userId: string;
  routineId: string;
  executedAt?: string | Date;
  duration?: number | null;
  memo?: string | null;
  isCompleted?: boolean;
}

// User Settings API
export type UserSettingsGetResponse = TypedAPIResponse<UserSetting>;
export type UserSettingsPutResponse = TypedAPIResponse<UserSetting>;

export interface UserSettingsUpdateRequest {
  theme?: 'light' | 'dark' | 'auto';
  language?: 'ja' | 'en';
  timeFormat?: '12h' | '24h';
  dailyGoal?: number;
  weeklyGoal?: number;
  monthlyGoal?: number;
}

// Categories API
export type CategoriesGetResponse = TypedAPIResponse<Category[]>;
export type CategoryPostResponse = TypedAPIResponse<Category>;

// User Profiles API
export type UserProfileGetResponse = TypedAPIResponse<UserProfile>;

// Challenges API
export type ChallengesGetResponse = TypedAPIResponse<Challenge[]>;
export type UserChallengesGetResponse = TypedAPIResponse<UserChallenge[]>;

// Missions API
export type MissionsGetResponse = TypedAPIResponse<Mission[]>;
export type UserMissionsGetResponse = TypedAPIResponse<UserMission[]>;