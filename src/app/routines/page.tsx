import { requireAuth } from '@/lib/auth/server';

import RoutinesPage from './RoutinesPage';

export default async function RoutinesServerPage() {
  await requireAuth('/routines');

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // サーバーサイドでデータを並行取得
    const [routinesResponse, userSettingsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/routines`)
        .then(res => res.json()),
      fetch(`${baseUrl}/api/user-settings`)
        .then(res => res.json()),
    ]);

    return (
      <RoutinesPage
        initialRoutines={routinesResponse.data || []}
        userSettings={userSettingsResponse.data}
      />
    );
  } catch (error) {
    console.error('Failed to fetch routines data:', error);
    throw error;
  }
}
