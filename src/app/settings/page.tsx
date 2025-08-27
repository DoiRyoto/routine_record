import { requireAuth } from '@/lib/auth/server';

import SettingsPage from './SettingsPage';

export default async function SettingsServerPage() {
  await requireAuth('/settings');

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // サーバーサイドでユーザー設定を取得
    const userSettingsResponse = await fetch(`${baseUrl}/api/user-settings`)
      .then(res => res.json());

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
