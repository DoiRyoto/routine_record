'use client';

import React, { createContext, useContext } from 'react';
import { Routine, ExecutionRecord, UserSettings } from '@/types/routine';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { demoRoutines, demoExecutionRecords } from '@/utils/demoData';
import { generateUUID } from '@/utils/uuid';

interface RoutineContextType {
  routines: Routine[];
  executionRecords: ExecutionRecord[];
  userSettings: UserSettings;
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt'>) => void;
  updateRoutine: (id: string, routine: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  addExecutionRecord: (record: Omit<ExecutionRecord, 'id'>) => void;
  updateExecutionRecord: (id: string, record: Partial<ExecutionRecord>) => void;
  deleteExecutionRecord: (id: string) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
}

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

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const [routines, setRoutines] = useLocalStorage<Routine[]>('routines', demoRoutines);
  const [executionRecords, setExecutionRecords] = useLocalStorage<ExecutionRecord[]>('executionRecords', demoExecutionRecords);
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('userSettings', defaultUserSettings);


  const addRoutine = (routine: Omit<Routine, 'id' | 'createdAt'>) => {
    const newRoutine: Routine = {
      ...routine,
      id: generateUUID(),
      createdAt: new Date(),
    };
    setRoutines(prev => [...prev, newRoutine]);
  };

  const updateRoutine = (id: string, routine: Partial<Routine>) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...routine } : r));
  };

  const deleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    setExecutionRecords(prev => prev.filter(r => r.routineId !== id));
  };

  const addExecutionRecord = (record: Omit<ExecutionRecord, 'id'>) => {
    const newRecord: ExecutionRecord = {
      ...record,
      id: generateUUID(),
    };
    setExecutionRecords(prev => [...prev, newRecord]);
  };

  const updateExecutionRecord = (id: string, record: Partial<ExecutionRecord>) => {
    setExecutionRecords(prev => prev.map(r => r.id === id ? { ...r, ...record } : r));
  };

  const deleteExecutionRecord = (id: string) => {
    setExecutionRecords(prev => prev.filter(r => r.id !== id));
  };

  const updateUserSettings = (settings: Partial<UserSettings>) => {
    setUserSettings(prev => ({
      ...prev,
      ...settings,
    }));
  };

  return (
    <RoutineContext.Provider
      value={{
        routines,
        executionRecords,
        userSettings,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        addExecutionRecord,
        updateExecutionRecord,
        deleteExecutionRecord,
        updateUserSettings,
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
}

export function useRoutine() {
  const context = useContext(RoutineContext);
  if (context === undefined) {
    throw new Error('useRoutine must be used within a RoutineProvider');
  }
  return context;
}