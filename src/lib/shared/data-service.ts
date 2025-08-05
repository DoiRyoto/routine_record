import type { Routine, ExecutionRecord, UserSettings } from '@/types/routine';

export interface DataService {
  routines: {
    getAll(): Promise<Routine[]>;
    create(routine: Omit<Routine, 'id' | 'createdAt'>): Promise<Routine>;
    update(id: string, routine: Partial<Routine>): Promise<Routine | null>;
    delete(id: string): Promise<boolean>;
  };
  executionRecords: {
    getAll(startDate?: Date, endDate?: Date): Promise<ExecutionRecord[]>;
    getByRoutineId(routineId: string, startDate?: Date, endDate?: Date): Promise<ExecutionRecord[]>;
    create(record: Omit<ExecutionRecord, 'id'>): Promise<ExecutionRecord>;
    update(id: string, record: Partial<ExecutionRecord>): Promise<ExecutionRecord | null>;
    delete(id: string): Promise<boolean>;
  };
  userSettings: {
    get(): Promise<UserSettings | null>;
    create(settings: UserSettings): Promise<UserSettings>;
    update(settings: Partial<UserSettings>): Promise<UserSettings | null>;
  };
}

export interface CreateDataServiceOptions {
  userId?: string;
}

export type CreateDataService = (options?: CreateDataServiceOptions) => DataService;