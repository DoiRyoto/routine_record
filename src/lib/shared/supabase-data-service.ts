import type { DataService, CreateDataServiceOptions } from './data-service';
import {
  getUserRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} from '../db/queries/routines';
import {
  getUserExecutionRecords,
  getRoutineExecutionRecords,
  createExecutionRecord,
  updateExecutionRecord,
  deleteExecutionRecord,
} from '../db/queries/execution-records';
import {
  getUserSettings,
  createUserSettings,
  updateUserSettings,
} from '../db/queries/user-settings';

export function createSupabaseDataService(options: CreateDataServiceOptions = {}): DataService {
  const { userId } = options;

  if (!userId) {
    throw new Error('User ID is required for Supabase data service');
  }

  return {
    routines: {
      getAll: () => getUserRoutines(userId),
      create: (routine) => createRoutine(userId, routine),
      update: (id, routine) => updateRoutine(userId, id, routine),
      delete: (id) => deleteRoutine(userId, id),
    },
    executionRecords: {
      getAll: (startDate, endDate) => getUserExecutionRecords(userId, startDate, endDate),
      getByRoutineId: (routineId, startDate, endDate) => 
        getRoutineExecutionRecords(userId, routineId, startDate, endDate),
      create: (record) => createExecutionRecord(userId, record),
      update: (id, record) => updateExecutionRecord(userId, id, record),
      delete: (id) => deleteExecutionRecord(userId, id),
    },
    userSettings: {
      get: () => getUserSettings(userId),
      create: (settings) => createUserSettings(userId, settings),
      update: (settings) => updateUserSettings(userId, settings),
    },
  };
}