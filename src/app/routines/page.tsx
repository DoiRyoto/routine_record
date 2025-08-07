import RoutineClientPage from '@/components/Routines/RoutineClientPage';
import { requireAuth } from '@/lib/auth/server';
import { getRoutines } from '@/lib/db/queries/routines';
import { getOrCreateUserSettings } from '@/lib/db/queries/user-settings';

export default async function RoutinesPage() {
  const user = await requireAuth('/routines');

  // サーバーサイドでデータを並行取得
  const [routines, userSettings] = await Promise.all([
    getRoutines(user.id),
    getOrCreateUserSettings(user.id),
  ]);

  return <RoutineClientPage initialRoutines={routines} userSettings={userSettings} />;
}
