import { requireAuth } from '@/lib/auth/server';
import { getExecutionRecords } from '@/lib/db/queries/execution-records';
import { getRoutines } from '@/lib/db/queries/routines';
import { getOrCreateUserSettings } from '@/lib/db/queries/user-settings';

import DashboardPage from './DashboardPage';

export default async function HomePage() {
  const user = await requireAuth('/');

  // サーバーサイドでデータを並行取得
  const [routines, executionRecords, userSettings] = await Promise.all([
    getRoutines(user.id),
    getExecutionRecords(user.id),
    getOrCreateUserSettings(user.id),
  ]);

  return (
    <DashboardPage
      initialRoutines={routines}
      initialExecutionRecords={executionRecords}
      userSettings={userSettings}
    />
  );
}
