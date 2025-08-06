import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import { useEffect, useState } from 'react';

interface UseUserSettingsReturn {
  userSettings: UserSettingWithTimezone | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserSettings(): UseUserSettingsReturn {
  const [userSettings, setUserSettings] = useState<UserSettingWithTimezone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user-settings');

      if (!response.ok) {
        throw new Error('ユーザー設定の取得に失敗しました');
      }

      const data = await response.json();

      if (data.success) {
        setUserSettings(data.data);
      } else {
        throw new Error(data.error || 'ユーザー設定の取得に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setUserSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSettings();
  }, []);

  return {
    userSettings,
    loading,
    error,
    refetch: fetchUserSettings,
  };
}
