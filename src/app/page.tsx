import { requireAuth } from '@/lib/auth/server';
import { getRoutines } from '@/lib/db/queries/routines';
import { getExecutionRecords } from '@/lib/db/queries/execution-records';
import DashboardClientPage from '@/components/Dashboard/DashboardClientPage';

export default async function HomePage() {
  const user = await requireAuth('/');

  // サーバーサイドでデータを並行取得
  const [routines, executionRecords] = await Promise.all([
    getRoutines(user.id),
    getExecutionRecords(user.id),
  ]);

  return (
    <DashboardClientPage 
      initialRoutines={routines} 
      initialExecutionRecords={executionRecords}
    />
  );
}