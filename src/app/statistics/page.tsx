import { requireAuth } from '@/lib/auth/server';
import { getExecutionRecords } from '@/lib/db/queries/execution-records';
import { getRoutines } from '@/lib/db/queries/routines';
import { getOrCreateUserSettings } from '@/lib/db/queries/user-settings';

import StatisticsPage from './StatisticsPage';

export default async function StatisticsServerPage() {
  const user = await requireAuth('/statistics');

  // サーバーサイドでデータを並行取得
  const [routines, executionRecords, userSettings] = await Promise.all([
    getRoutines(user.id),
    getExecutionRecords(user.id),
    getOrCreateUserSettings(user.id),
  ]);

  return (
    <StatisticsPage
      initialRoutines={routines}
      initialExecutionRecords={executionRecords}
      userSettings={userSettings}
    />
  );
}
