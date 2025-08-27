import SettingsPage from './SettingsPage';
import { requireAuth } from '@/lib/auth/server';
import { getOrCreateUserSettings } from '@/lib/db/queries/user-settings';

export default async function SettingsServerPage() {
  const user = await requireAuth('/settings');

  // サーバーサイドでユーザー設定を取得
  const userSettings = await getOrCreateUserSettings(user.id);

  return (
    <SettingsPage
      initialSettings={userSettings}
    />
  );
}
