import { requireAuth } from '@/lib/auth/server';
import { getExecutionRecords } from '@/lib/db/queries/execution-records';
import { getRoutines } from '@/lib/db/queries/routines';
import { getOrCreateUserSettings } from '@/lib/db/queries/user-settings';

import CalendarPage from './CalendarPage';

export default async function CalendarServerPage() {
  const user = await requireAuth('/calendar');

  // サーバーサイドでデータを並行取得
  const [routines, executionRecords, userSettings] = await Promise.all([
    getRoutines(user.id),
    getExecutionRecords(user.id),
    getOrCreateUserSettings(user.id),
  ]);

  return (
    <CalendarPage
      initialRoutines={routines}
      initialExecutionRecords={executionRecords}
      userSettings={userSettings}
    />
  );
}
