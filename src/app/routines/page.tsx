import { requireAuth } from '@/lib/auth/server';
import { getRoutines } from '@/lib/db/queries/routines';
import RoutineClientPage from '@/components/Routines/RoutineClientPage';

export default async function RoutinesPage() {
  const user = await requireAuth('/routines');

  // サーバーサイドでデータを取得
  const routines = await getRoutines(user.id);

  return <RoutineClientPage initialRoutines={routines} />;
}