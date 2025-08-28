import { apiClient as typedApiClient } from '@/lib/api-client/index';

import { requireAuth } from '@/lib/auth/server';

import CalendarPage from './CalendarPage';

export default async function CalendarServerPage() {
  await requireAuth('/calendar');

  try {
    // 型安全なAPIクライアントを使用してデータを並行取得
    const [routinesResponse, executionRecordsResponse, userSettingsResponse] = await Promise.all([
      typedApiClient.routines.getAll(),
      typedApiClient.executionRecords.getAll(),
      typedApiClient.userSettings.get(),
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
