import type { DataService } from './data-service';
import type { Routine, ExecutionRecord, UserSettings } from '@/types/routine';

const defaultUserSettings: UserSettings = {
  displaySettings: {
    theme: 'auto',
    language: 'ja',
    timeFormat: '24h',
  },
  goalSettings: {
    dailyGoal: 3,
    weeklyGoal: 21,
    monthlyGoal: 90,
  },
};

export function createLocalStorageDataService(): DataService {
  const getFromStorage = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          ...item,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          executedAt: item.executedAt ? new Date(item.executedAt) : undefined,
        })) as T;
      }
      
      return parsed;
    } catch {
      return defaultValue;
    }
  };

  const setToStorage = <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  };

  return {
    routines: {
      async getAll(): Promise<Routine[]> {
        return getFromStorage<Routine[]>('routines', []);
      },
      
      async create(routine: Omit<Routine, 'id' | 'createdAt'>): Promise<Routine> {
        const routines = getFromStorage<Routine[]>('routines', []);
        const newRoutine: Routine = {
          ...routine,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        const updatedRoutines = [...routines, newRoutine];
        setToStorage('routines', updatedRoutines);
        return newRoutine;
      },
      
      async update(id: string, routine: Partial<Routine>): Promise<Routine | null> {
        const routines = getFromStorage<Routine[]>('routines', []);
        const index = routines.findIndex(r => r.id === id);
        if (index === -1) return null;
        
        const updatedRoutine = { ...routines[index], ...routine };
        routines[index] = updatedRoutine;
        setToStorage('routines', routines);
        return updatedRoutine;
      },
      
      async delete(id: string): Promise<boolean> {
        const routines = getFromStorage<Routine[]>('routines', []);
        const filteredRoutines = routines.filter(r => r.id !== id);
        if (filteredRoutines.length === routines.length) return false;
        
        setToStorage('routines', filteredRoutines);
        
        const records = getFromStorage<ExecutionRecord[]>('executionRecords', []);
        const filteredRecords = records.filter(r => r.routineId !== id);
        setToStorage('executionRecords', filteredRecords);
        
        return true;
      },
    },
    
    executionRecords: {
      async getAll(startDate?: Date, endDate?: Date): Promise<ExecutionRecord[]> {
        const records = getFromStorage<ExecutionRecord[]>('executionRecords', []);
        
        if (!startDate || !endDate) return records;
        
        return records.filter(record => {
          const executedAt = new Date(record.executedAt);
          return executedAt >= startDate && executedAt <= endDate;
        });
      },
      
      async getByRoutineId(routineId: string, startDate?: Date, endDate?: Date): Promise<ExecutionRecord[]> {
        const records = getFromStorage<ExecutionRecord[]>('executionRecords', []);
        let filtered = records.filter(r => r.routineId === routineId);
        
        if (startDate && endDate) {
          filtered = filtered.filter(record => {
            const executedAt = new Date(record.executedAt);
            return executedAt >= startDate && executedAt <= endDate;
          });
        }
        
        return filtered;
      },
      
      async create(record: Omit<ExecutionRecord, 'id'>): Promise<ExecutionRecord> {
        const records = getFromStorage<ExecutionRecord[]>('executionRecords', []);
        const newRecord: ExecutionRecord = {
          ...record,
          id: crypto.randomUUID(),
        };
        const updatedRecords = [...records, newRecord];
        setToStorage('executionRecords', updatedRecords);
        return newRecord;
      },
      
      async update(id: string, record: Partial<ExecutionRecord>): Promise<ExecutionRecord | null> {
        const records = getFromStorage<ExecutionRecord[]>('executionRecords', []);
        const index = records.findIndex(r => r.id === id);
        if (index === -1) return null;
        
        const updatedRecord = { ...records[index], ...record };
        records[index] = updatedRecord;
        setToStorage('executionRecords', records);
        return updatedRecord;
      },
      
      async delete(id: string): Promise<boolean> {
        const records = getFromStorage<ExecutionRecord[]>('executionRecords', []);
        const filteredRecords = records.filter(r => r.id !== id);
        if (filteredRecords.length === records.length) return false;
        
        setToStorage('executionRecords', filteredRecords);
        return true;
      },
    },
    
    userSettings: {
      async get(): Promise<UserSettings | null> {
        const settings = getFromStorage<UserSettings | null>('userSettings', null);
        return settings || defaultUserSettings;
      },
      
      async create(settings: UserSettings): Promise<UserSettings> {
        setToStorage('userSettings', settings);
        return settings;
      },
      
      async update(settings: Partial<UserSettings>): Promise<UserSettings | null> {
        const currentSettings = getFromStorage<UserSettings>('userSettings', defaultUserSettings);
        const updatedSettings = {
          ...currentSettings,
          ...settings,
          displaySettings: {
            ...currentSettings.displaySettings,
            ...settings.displaySettings,
          },
          goalSettings: {
            ...currentSettings.goalSettings,
            ...settings.goalSettings,
          },
        };
        setToStorage('userSettings', updatedSettings);
        return updatedSettings;
      },
    },
  };
}