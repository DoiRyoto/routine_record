import DashboardPage from '@/app/DashboardPage';
import { serverTypedGet } from '@/lib/api-client/server-fetch';
import { requireAuth } from '@/lib/auth/server';
import {
  HabitLogsGetResponseSchema,
  HabitsGetResponseSchema,
} from '@/lib/schemas/api-response';

export default async function HomePage() {
  await requireAuth('/');

  try {
    // API Routesを使用してデータを並行取得（エラーハンドリングを個別に行う）
    const [habitsResponse, habitLogsResponse] = await Promise.allSettled([
      serverTypedGet('/api/habits', HabitsGetResponseSchema),
      serverTypedGet('/api/habit-logs', HabitLogsGetResponseSchema),
    ]);

    // 個別のレスポンス処理
    const habits = habitsResponse.status === 'fulfilled' ? habitsResponse.value.data || [] : [];
    const habitLogs = habitLogsResponse.status === 'fulfilled' ? habitLogsResponse.value.data || [] : [];

    return (
      <DashboardPage
        habits={habits}
        habitLogs={habitLogs}
      />
    );
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
}
