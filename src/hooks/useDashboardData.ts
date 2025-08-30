import { useState, useEffect, useCallback } from 'react';

// 型定義
export interface DashboardUser {
  id: string;
  name: string;
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  avatarUrl?: string;
}

export interface TodayProgress {
  completedRoutines: number;
  totalRoutines: number;
  todayXp: number;
  currentStreak: number;
  completionRate: number;
}

export interface Achievement {
  recentBadges: Array<{
    id: string;
    name: string;
    iconUrl: string;
  }>;
  activeMissions: Array<{
    id: string;
    title: string;
    progress: number;
    target: number;
  }>;
}

export interface GameNotification {
  id: string;
  message: string;
  type: 'levelup' | 'badge' | 'streak' | 'xp';
}

export interface DashboardData {
  user: DashboardUser;
  todayProgress: TodayProgress;
  achievements: Achievement;
  notifications: GameNotification[];
}

export interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: Error | null;
  completeRoutine: (routineId: string) => Promise<void>;
  retry: () => void;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 並行してAPIを呼び出し
      const [userResponse, routinesResponse, statisticsResponse, notificationsResponse] = await Promise.all([
        fetch('/api/user-profiles'),
        fetch('/api/routines?today=true'),
        fetch('/api/statistics/dashboard'),
        fetch('/api/game-notifications')
      ]);

      // レスポンスチェック
      if (!userResponse.ok || !routinesResponse.ok || !statisticsResponse.ok || !notificationsResponse.ok) {
        throw new Error('データの取得に失敗しました');
      }

      // JSON パース
      const [userResult, routinesResult, statisticsResult, notificationsResult] = await Promise.all([
        userResponse.json(),
        routinesResponse.json(),
        statisticsResponse.json(),
        notificationsResponse.json()
      ]);

      // データの組み立て
      const dashboardData: DashboardData = {
        user: userResult.data || {
          id: 'user123',
          name: 'テストユーザー',
          level: 5,
          totalXp: 2500,
          currentLevelXp: 200,
          nextLevelXp: 500,
        },
        todayProgress: {
          completedRoutines: statisticsResult.data?.completedRoutines || 0,
          totalRoutines: statisticsResult.data?.totalRoutines || 0,
          todayXp: statisticsResult.data?.todayXp || 0,
          currentStreak: statisticsResult.data?.currentStreak || 0,
          completionRate: statisticsResult.data?.completionRate || 0,
        },
        achievements: {
          recentBadges: [],
          activeMissions: [],
        },
        notifications: notificationsResult.data || [],
      };

      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('不明なエラーが発生しました'));
    } finally {
      setLoading(false);
    }
  }, []);

  const completeRoutine = useCallback(async (routineId: string) => {
    try {
      const response = await fetch('/api/execution-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ routineId }),
      });

      if (!response.ok) {
        throw new Error('ルーチンの完了処理に失敗しました');
      }

      // 成功後、ダッシュボードデータを再取得
      await fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('不明なエラーが発生しました'));
      throw err;
    }
  }, [fetchDashboardData]);

  const retry = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    completeRoutine,
    retry,
  };
}