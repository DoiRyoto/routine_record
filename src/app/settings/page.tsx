import { serverTypedGet } from '@/lib/api-client/server-fetch';
import { requireAuth } from '@/lib/auth/server';
import { UserSettingsGetResponseSchema } from '@/lib/schemas/api-response';

import SettingsPage from './SettingsPage';

export default async function SettingsServerPage() {
  await requireAuth('/settings');

  try {
    // API Routesを使用してユーザー設定を取得
    const userSettingsResponse = await serverTypedGet('/api/user-settings', UserSettingsGetResponseSchema);

    if (!userSettingsResponse.data) {
      throw new Error('User settings could not be loaded');
    }

    return (
      <SettingsPage
        initialSettings={userSettingsResponse.data}
      />
    );
  } catch (error) {
    console.error('Failed to fetch user settings:', error);
    throw error;
  }
}
