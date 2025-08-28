import { serverTypedGet } from '@/lib/api-client/server-fetch';
import { requireAuth } from '@/lib/auth/server';
import {
  RoutinesGetResponseSchema,
  ExecutionRecordsGetResponseSchema,
  UserSettingsGetResponseSchema,
} from '@/lib/schemas/api-response';

import CalendarPage from './CalendarPage';

export default async function CalendarServerPage() {
  await requireAuth('/calendar');

  try {
    // API Routesを使用してデータを並行取得
    const [routinesResponse, executionRecordsResponse, userSettingsResponse] = await Promise.all([
      serverTypedGet('/api/routines', RoutinesGetResponseSchema),
      serverTypedGet('/api/execution-records', ExecutionRecordsGetResponseSchema),
      serverTypedGet('/api/user-settings', UserSettingsGetResponseSchema),
    ]);

    if (!userSettingsResponse.data) {
      throw new Error('User settings could not be loaded');
    }

    return (
      <CalendarPage
        initialRoutines={routinesResponse.data || []}
        initialExecutionRecords={executionRecordsResponse.data || []}
        userSettings={userSettingsResponse.data}
      />
    );
  } catch (error) {
    console.error('Failed to fetch calendar data:', error);
    throw error;
  }
}
