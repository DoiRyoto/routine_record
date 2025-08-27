import { requireAuth } from '@/lib/auth/server';

import StatisticsPage from './StatisticsPage';

export default async function StatisticsServerPage() {
  await requireAuth('/statistics');

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
      <StatisticsPage
        initialRoutines={routinesResponse.data || []}
        initialExecutionRecords={executionRecordsResponse.data || []}
        userSettings={userSettingsResponse.data}
      />
    );
  } catch (error) {
    console.error('Failed to fetch statistics data:', error);
    throw error;
  }
}
