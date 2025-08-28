import { apiClient as typedApiClient } from '@/lib/api-client/index';

import { requireAuth } from '@/lib/auth/server';

import RoutinesPage from './RoutinesPage';

export default async function RoutinesServerPage() {
  await requireAuth('/routines');

  try {
    // 型安全なAPIクライアントを使用してデータを並行取得
    const [routinesResponse, userSettingsResponse] = await Promise.all([
      typedApiClient.routines.getAll(),
      typedApiClient.userSettings.get(),
    ]);

    if (!userSettingsResponse.data) {
      throw new Error('User settings could not be loaded');
    }

    return (
      <RoutinesPage
        initialRoutines={routinesResponse.data || []}
        userSettings={userSettingsResponse.data}
      />
    );
  } catch (error) {
    console.error('Failed to fetch routines data:', error);
    throw error;
  }
}
