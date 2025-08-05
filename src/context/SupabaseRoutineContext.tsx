'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routine, ExecutionRecord, UserSettings } from '@/types/routine';
import { useAuth } from './AuthContext';
import {
  getUserRoutines,
  createRoutine as dbCreateRoutine,
  updateRoutine as dbUpdateRoutine,
  deleteRoutine as dbDeleteRoutine,
} from '../lib/db/queries/routines';
import {
  getUserExecutionRecords,
  createExecutionRecord as dbCreateExecutionRecord,
  updateExecutionRecord as dbUpdateExecutionRecord,
  deleteExecutionRecord as dbDeleteExecutionRecord,
} from '../lib/db/queries/execution-records';
import {
  getUserSettings as dbGetUserSettings,
  createUserSettings as dbCreateUserSettings,
  updateUserSettings as dbUpdateUserSettings,
} from '../lib/db/queries/user-settings';

interface RoutineContextType {
  routines: Routine[];
  executionRecords: ExecutionRecord[];
  userSettings: UserSettings;
  loading: boolean;
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt'>) => Promise<void>;
  updateRoutine: (id: string, routine: Partial<Routine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  addExecutionRecord: (record: Omit<ExecutionRecord, 'id'>) => Promise<void>;
  updateExecutionRecord: (id: string, record: Partial<ExecutionRecord>) => Promise<void>;
  deleteExecutionRecord: (id: string) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
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
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [executionRecords, setExecutionRecords] = useState<ExecutionRecord[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultUserSettings);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    } else {
      setRoutines([]);
      setExecutionRecords([]);
      setUserSettings(defaultUserSettings);
      setLoading(false);
    }
  }, [user?.id]);

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

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      const [routinesData, recordsData, settingsData] = await Promise.all([
        getUserRoutines(user.id),
        getUserExecutionRecords(user.id),
        dbGetUserSettings(user.id),
      ]);

      setRoutines(routinesData);
      setExecutionRecords(recordsData);
      
      if (settingsData) {
        setUserSettings(settingsData);
      } else {
        await dbCreateUserSettings(user.id, defaultUserSettings);
        setUserSettings(defaultUserSettings);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRoutine = async (routine: Omit<Routine, 'id' | 'createdAt'>) => {
    if (!user?.id) return;

    try {
      const newRoutine = await dbCreateRoutine(user.id, routine);
      setRoutines(prev => [...prev, newRoutine]);
    } catch (error) {
      console.error('Failed to create routine:', error);
      throw error;
    }
  };

  const updateRoutine = async (id: string, routine: Partial<Routine>) => {
    if (!user?.id) return;

    try {
      const updatedRoutine = await dbUpdateRoutine(user.id, id, routine);
      if (updatedRoutine) {
        setRoutines(prev => prev.map(r => r.id === id ? updatedRoutine : r));
      }
    } catch (error) {
      console.error('Failed to update routine:', error);
      throw error;
    }
  };

  const deleteRoutine = async (id: string) => {
    if (!user?.id) return;

    try {
      const success = await dbDeleteRoutine(user.id, id);
      if (success) {
        setRoutines(prev => prev.filter(r => r.id !== id));
        setExecutionRecords(prev => prev.filter(r => r.routineId !== id));
      }
    } catch (error) {
      console.error('Failed to delete routine:', error);
      throw error;
    }
  };

  const addExecutionRecord = async (record: Omit<ExecutionRecord, 'id'>) => {
    if (!user?.id) return;

    try {
      const newRecord = await dbCreateExecutionRecord(user.id, record);
      setExecutionRecords(prev => [...prev, newRecord]);
    } catch (error) {
      console.error('Failed to create execution record:', error);
      throw error;
    }
  };

  const updateExecutionRecord = async (id: string, record: Partial<ExecutionRecord>) => {
    if (!user?.id) return;

    try {
      const updatedRecord = await dbUpdateExecutionRecord(user.id, id, record);
      if (updatedRecord) {
        setExecutionRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
      }
    } catch (error) {
      console.error('Failed to update execution record:', error);
      throw error;
    }
  };

  const deleteExecutionRecord = async (id: string) => {
    if (!user?.id) return;

    try {
      const success = await dbDeleteExecutionRecord(user.id, id);
      if (success) {
        setExecutionRecords(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete execution record:', error);
      throw error;
    }
  };

  const updateUserSettings = async (settings: Partial<UserSettings>) => {
    if (!user?.id) return;

    try {
      const updatedSettings = await dbUpdateUserSettings(user.id, settings);
      if (updatedSettings) {
        setUserSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error;
    }
  };

  const toggleDarkMode = async () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    await updateUserSettings({
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
        loading,
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