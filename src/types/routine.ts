export interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string;
  targetFrequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number | null;
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
  dailyGoal: number;
  weeklyGoal: number;
  monthlyGoal: number;
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

// Category型をschemaから再エクスポート
export type { Category } from '@/lib/db/schema';
