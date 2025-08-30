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
    // API Routesを使用してデータを並行取得（エラーハンドリングを個別に行う）
    const [routinesResponse, executionRecordsResponse, userSettingsResponse, userProfileResponse] = await Promise.allSettled([
      serverTypedGet('/api/routines', RoutinesGetResponseSchema),
      serverTypedGet('/api/execution-records', ExecutionRecordsGetResponseSchema),
      serverTypedGet('/api/user-settings', UserSettingsGetResponseSchema),
      serverTypedGet(`/api/user-profiles?userId=${user.id}`, UserProfileGetResponseSchema),
    ]);

    // 個別のレスポンス処理
    const routines = routinesResponse.status === 'fulfilled' ? routinesResponse.value.data || [] : [];
    const executionRecords = executionRecordsResponse.status === 'fulfilled' ? executionRecordsResponse.value.data || [] : [];
    const userSettings = userSettingsResponse.status === 'fulfilled' ? userSettingsResponse.value.data : null;
    const userProfile = userProfileResponse.status === 'fulfilled' ? userProfileResponse.value.data : null;

    // ユーザー設定は必須（新規ユーザーの場合は自動作成される）
    if (!userSettings) {
      console.error('User settings could not be loaded for user:', user.id);
      throw new Error('User settings could not be loaded');
    }

    // ユーザープロフィールが存在しない場合のログ出力（新規ユーザー対応）
    if (!userProfile) {
      console.warn('User profile not found for user:', user.id, 'This may be a new user.');
    }

    return (
      <DashboardPage
        initialRoutines={routines}
        initialExecutionRecords={executionRecords}
        userSettings={userSettings}
        userProfile={userProfile || undefined}
      />
    );
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
}
