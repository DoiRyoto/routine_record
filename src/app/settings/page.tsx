import { apiClient as typedApiClient } from '@/lib/api-client/index';

import { requireAuth } from '@/lib/auth/server';

import SettingsPage from './SettingsPage';

export default async function SettingsServerPage() {
  await requireAuth('/settings');

  try {
    // 型安全なAPIクライアントを使用してユーザー設定を取得
    const userSettingsResponse = await typedApiClient.userSettings.get();

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
