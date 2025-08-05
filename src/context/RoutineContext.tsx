'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routine, ExecutionRecord, UserSettings } from '@/types/routine';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { demoRoutines, demoExecutionRecords } from '@/utils/demoData';

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
  isDarkMode: boolean;
  toggleDarkMode: () => void;
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const theme = userSettings.displaySettings.theme;
    if (theme === 'dark') {
      setIsDarkMode(true);
    } else if (theme === 'light') {
      setIsDarkMode(false);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, [userSettings.displaySettings.theme]);

  const addRoutine = (routine: Omit<Routine, 'id' | 'createdAt'>) => {
    const newRoutine: Routine = {
      ...routine,
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    updateUserSettings({
      displaySettings: {
        ...userSettings.displaySettings,
        theme: newTheme,
      },
    });
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
        isDarkMode,
        toggleDarkMode,
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