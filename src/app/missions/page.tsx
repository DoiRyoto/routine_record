import { getCurrentUser } from '@/lib/auth/server';

import { MissionsPage } from './MissionsPage';

async function getMissionsData(_userId?: string) {
  try {
    // 現在はモックデータを返す（API実装まで）
    const mockMissions: any[] = [];
    const mockUserMissions: any[] = [];

    return {
      missions: mockMissions,
      userMissions: mockUserMissions
    };
  } catch (error) {
    console.error('Failed to fetch missions data:', error);
    throw error;
  }
}

async function handleClaimReward(missionId: string) {
  'use server';
  const user = await getCurrentUser();
  if (!user?.id) return;

  try {
    console.warn('Claiming mission reward for:', { userId: user.id, missionId });
    // TODO: API実装後に有効化
  } catch (error) {
    console.error('Failed to claim reward:', error);
  }
}

async function handleFilterChange(filters: { type?: string; difficulty?: string; category?: string }) {
  'use server';
  // フィルター処理は通常クライアントサイドで行うため、ここでは何もしない
  console.warn('Filter changed:', filters);
}

export default async function Page() {
  const user = await getCurrentUser();
  const { missions, userMissions } = await getMissionsData(user?.id);

  return (
    <MissionsPage
      missions={missions}
      userMissions={userMissions}
      onClaimReward={handleClaimReward}
      onFilterChange={handleFilterChange}
    />
  );
}