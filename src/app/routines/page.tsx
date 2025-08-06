import RoutineClientPage from '@/components/Routines/RoutineClientPage';
import { requireAuth } from '@/lib/auth/server';
import { getRoutines } from '@/lib/db/queries/routines';

export default async function RoutinesPage() {
  const user = await requireAuth('/routines');

  // サーバーサイドでデータを取得
  const routines = await getRoutines(user.id);

  return <RoutineClientPage initialRoutines={routines} />;
}
