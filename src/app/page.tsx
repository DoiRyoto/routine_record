import { apiClient as typedApiClient } from '@/lib/api-client/index';

import { requireAuth } from '@/lib/auth/server';

import DashboardPage from './DashboardPage';

export default async function HomePage() {
  await requireAuth('/');

  try {
    // 型安全なAPIクライアントを使用してデータを並行取得
    const [routinesResponse, executionRecordsResponse, userSettingsResponse] = await Promise.all([
      typedApiClient.routines.getAll(),
      typedApiClient.executionRecords.getAll(),
      typedApiClient.userSettings.get(),
    ]);

    // ユーザー設定は常に返されるはず（getOrCreateUserSettings）
    if (!userSettingsResponse.data) {
      throw new Error('User settings could not be loaded');
    }

    return (
      <DashboardPage
        initialRoutines={routinesResponse.data || []}
        initialExecutionRecords={executionRecordsResponse.data || []}
        userSettings={userSettingsResponse.data}
      />
    );
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
}
