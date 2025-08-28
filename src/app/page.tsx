import { serverTypedGet } from '@/lib/api-client/server-fetch';
import { requireAuth } from '@/lib/auth/server';
import {
  RoutinesGetResponseSchema,
  ExecutionRecordsGetResponseSchema,
  UserSettingsGetResponseSchema,
  UserProfileGetResponseSchema,
} from '@/lib/schemas/api-response';

import DashboardPage from './DashboardPage';

export default async function HomePage() {
  const user = await requireAuth('/');

  try {
    // API Routesを使用してデータを並行取得
    const [routinesResponse, executionRecordsResponse, userSettingsResponse, userProfileResponse] = await Promise.all([
      serverTypedGet('/api/routines', RoutinesGetResponseSchema),
      serverTypedGet('/api/execution-records', ExecutionRecordsGetResponseSchema),
      serverTypedGet('/api/user-settings', UserSettingsGetResponseSchema),
      serverTypedGet(`/api/user-profiles?userId=${user.id}`, UserProfileGetResponseSchema),
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
        userProfile={userProfileResponse.data}
      />
    );
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
}
