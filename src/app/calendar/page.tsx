import { requireAuth } from '@/lib/auth/server';

import CalendarPage from './CalendarPage';

export default async function CalendarServerPage() {
  await requireAuth('/calendar');

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
      <CalendarPage
        initialRoutines={routinesResponse.data || []}
        initialExecutionRecords={executionRecordsResponse.data || []}
        userSettings={userSettingsResponse.data}
      />
    );
  } catch (error) {
    console.error('Failed to fetch calendar data:', error);
    throw error;
  }
}
