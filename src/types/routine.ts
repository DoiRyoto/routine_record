export interface Routine {
  id: string;
  name: string;
  description: string;
  category: string;
  targetFrequency: 'daily' | 'weekly' | 'monthly';
  targetCount?: number;
  createdAt: Date;
  isActive: boolean;
}

export interface ExecutionRecord {
  id: string;
  routineId: string;
  executedAt: Date;
  duration?: number;
  memo?: string;
  isCompleted: boolean;
}

export interface UserSettings {
  displaySettings: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ja' | 'en';
    timeFormat: '12h' | '24h';
  };
  goalSettings: {
    dailyGoal: number;
    weeklyGoal: number;
    monthlyGoal: number;
  };
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
  routines: {
    routineId: string;
    routineName: string;
    isCompleted: boolean;
    duration?: number;
  }[];
}