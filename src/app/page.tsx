import { requireAuth } from '@/lib/auth/server';

import DashboardPage from './DashboardPage';

export default async function HomePage() {
  await requireAuth('/');

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // サーバーサイドでデータを並行取得
    const [routinesResponse, executionRecordsResponse, userSettingsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/routines`)
        .then(res => res.json()),
      fetch(`${baseUrl}/api/execution-records`)
        .then(res => res.json()),
      fetch(`${baseUrl}/api/user-settings`)
        .then(res => res.json()),
    ]);

    return (
      <DashboardPage
        initialRoutines={routinesResponse.data || []}
        initialExecutionRecords={executionRecordsResponse.data || []}
        userSettings={userSettingsResponse.data}
      />
    );
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
}
