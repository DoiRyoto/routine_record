import StatisticsClientPage from '@/components/Statistics/StatisticsClientPage';
import { requireAuth } from '@/lib/auth/server';
import { getExecutionRecords } from '@/lib/db/queries/execution-records';
import { getRoutines } from '@/lib/db/queries/routines';

export default async function StatisticsPage() {
  const user = await requireAuth('/statistics');

  // サーバーサイドでデータを並行取得
  const [routines, executionRecords] = await Promise.all([
    getRoutines(user.id),
    getExecutionRecords(user.id),
  ]);

  return (
    <StatisticsClientPage initialRoutines={routines} initialExecutionRecords={executionRecords} />
  );
}
