import { useState, useEffect, useCallback } from 'react';

import { useAuth } from '@/context/AuthContext';
import { createApiDataService } from '@/lib/shared/api-data-service';

// APIデータを管理する汎用フック
export function useApiData<T>(apiCall: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refresh = useCallback(async () => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user, apiCall]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refresh, ...dependencies]);

  return { data, loading, error, refresh };
}

// 汎用的なAPI操作フック
export function useApiActions() {
  const dataService = createApiDataService();

  return {
    routines: dataService.routines,
    executionRecords: dataService.executionRecords,
    userSettings: dataService.userSettings,
  };
}
