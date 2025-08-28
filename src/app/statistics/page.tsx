import { apiClient as typedApiClient } from '@/lib/api-client/index';

import { requireAuth } from '@/lib/auth/server';

import StatisticsPage from './StatisticsPage';

export default async function StatisticsServerPage() {
  await requireAuth('/statistics');

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
      <StatisticsPage
        initialRoutines={routinesResponse.data || []}
        initialExecutionRecords={executionRecordsResponse.data || []}
        userSettings={userSettingsResponse.data}
      />
    );
  } catch (error) {
    console.error('Failed to fetch statistics data:', error);
    throw error;
  }
}
