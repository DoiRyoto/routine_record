import { requireAuth } from '@/lib/auth/server';
import {
  RoutinesGetResponseSchema,
  UserSettingsGetResponseSchema,
} from '@/lib/schemas/api-response';

import { serverTypedGet } from '@/common/lib/api-client/server-fetch';

import RoutinesPage from './RoutinesPage';



export default async function RoutinesServerPage() {
  await requireAuth();

  try {
    // API Routesを使用してデータを並行取得
    const [routinesResponse, userSettingsResponse] = await Promise.all([
      serverTypedGet('/api/routines', RoutinesGetResponseSchema),
      serverTypedGet('/api/user-settings', UserSettingsGetResponseSchema),
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
