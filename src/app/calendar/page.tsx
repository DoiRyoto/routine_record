import { requireAuth } from '@/lib/auth/server';
import { getRoutines } from '@/lib/db/queries/routines';
import { getExecutionRecords } from '@/lib/db/queries/execution-records';
import CalendarClientPage from '@/components/Calendar/CalendarClientPage';

export default async function CalendarPage() {
  const user = await requireAuth('/calendar');

  // サーバーサイドでデータを並行取得
  const [routines, executionRecords] = await Promise.all([
    getRoutines(user.id),
    getExecutionRecords(user.id),
  ]);

  return (
    <CalendarClientPage 
      initialRoutines={routines} 
      initialExecutionRecords={executionRecords}
    />
  );
}