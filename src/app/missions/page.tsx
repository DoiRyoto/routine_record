import { getCurrentUser } from '@/lib/auth/server';

import { MissionsPage } from './MissionsPage';

async function getMissionsData(userId?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const [missionsResponse, userMissionsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/gamification?type=missions`)
        .then(res => res.json()),
      userId ? 
        fetch(`${baseUrl}/api/gamification?type=user-missions&userId=${userId}`)
          .then(res => res.json()) : 
        Promise.resolve([])
    ]);

    return {
      missions: missionsResponse,
      userMissions: userMissionsResponse
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/gamification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'claim-mission-reward',
        userId: user.id,
        missionId
      })
    });

    if (!response.ok) {
      throw new Error('ミッション報酬の受け取りに失敗しました');
    }
  } catch (error) {
    console.error('Failed to claim reward:', error);
  }
}

async function handleFilterChange(filters: { type?: string; difficulty?: string; category?: string }) {
  'use server';
  console.log('Filter changed:', filters);
  // フィルター処理は通常クライアントサイドで行うため、ここでは何もしない
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