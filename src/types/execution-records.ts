// 実行記録関連の共通型定義

export interface Routine {
  id: string;
  name: string;
  categoryId: string;
  isActive: boolean;
  goalType: 'schedule_based' | 'frequency_based';
  recurrenceType?: 'daily' | 'weekly';
  targetPeriod?: 'daily' | 'weekly';
  targetCount?: number;
}

export interface ExecutionRecord {
  id: string;
  userId: string;
  routineId: string;
  executedAt: Date;
  duration?: number;
  memo?: string;
  isCompleted: boolean;
  xpEarned?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionRecordWithRoutine extends ExecutionRecord {
  routine: {
    id: string;
    name: string;
    category: string;
  };
}

export interface ExecutionRecordFormData {
  routineId: string;
  executedAt: Date;
  duration?: number;
  memo?: string;
  isCompleted: boolean;
}

export interface LevelUpData {
  newLevel: number;
  previousLevel: number;
  xpGained: number;
  nextLevelXp: number;
  currentXp: number;
  rewards: string[];
}

export interface ExecutionRecordFilters {
  routineId: string;
  startDate: string;
  endDate: string;
  showFilters: boolean;
}