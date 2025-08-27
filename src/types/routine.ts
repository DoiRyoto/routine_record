export interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string;
  
  // ミッションのタイプ（頻度ベース vs スケジュールベース）
  goalType: 'frequency_based' | 'schedule_based';
  
  // 頻度ベース用の設定
  targetCount: number | null; // 期間内の目標実行回数
  targetPeriod?: string | null; // 'daily', 'weekly', 'monthly' - 目標期間
  
  // スケジュールベース用の繰り返しパターン設定
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceInterval?: number | null; // 間隔（2日おき = 2）
  
  // 月次パターン用
  monthlyType?: 'day_of_month' | 'day_of_week' | null; // 月の何日 or 第何曜日
  dayOfMonth?: number | null; // 1-31（月の何日）
  weekOfMonth?: number | null; // 1-4, -1（第何週、-1は最終週）
  dayOfWeek?: number | null; // 0-6（日曜=0）
  
  // 週次パターン用
  daysOfWeek?: string | null; // [1,3,5] = 月水金（JSON文字列）
  
  // カスタム間隔用
  startDate?: Date | null; // 基準日
  
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  deletedAt?: Date | null; // オプショナルにして互換性を保つ
}

export interface ExecutionRecord {
  id: string;
  routineId: string;
  executedAt: Date;
  duration: number | null;
  memo: string | null;
  isCompleted: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'ja' | 'en';
  timeFormat: '12h' | '24h';
}


export interface DashboardData {
  todayRoutines: Routine[];
  todayProgress: {
    completed: number;
    total: number;
  };
  weeklyProgress: {
    completed: number;
    total: number;
  };
  monthlyProgress: {
    completed: number;
    total: number;
  };
}

export interface StatisticsData {
  routineId: string;
  routineName: string;
  totalExecutions: number;
  streak: number;
  averageDuration?: number;
  completionRate: number;
  lastExecuted?: Date;
}

export interface CalendarData {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  routines: {
    routineId: string;
    routineName: string;
    isCompleted: boolean;
    duration?: number;
  }[];
}

// Category型とCatchupPlan型をschemaから再エクスポート
export type { Category, CatchupPlan } from '@/lib/db/schema';

// ゲーミフィケーション関連型を再エクスポート
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
} from './gamification';
