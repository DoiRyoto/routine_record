import { MissionsPage } from './MissionsPage';

// モックデータ（実際の実装では API から取得）
const mockMissions = [
  {
    id: '1',
    title: '7日間連続実行',
    description: '同じルーティンを7日間続けて実行しよう',
    type: 'streak' as const,
    targetValue: 7,
    xpReward: 100,
    difficulty: 'easy' as const,
    isActive: true,
    progress: 0,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: '今週20回実行',
    description: 'この週に合計20回のルーティンを実行しよう',
    type: 'count' as const,
    targetValue: 20,
    xpReward: 150,
    difficulty: 'medium' as const,
    isActive: true,
    progress: 0,
    createdAt: new Date(),
  },
  {
    id: '3',
    title: '5つの異なるカテゴリ',
    description: '5つの異なるカテゴリのルーティンを実行しよう',
    type: 'variety' as const,
    targetValue: 5,
    xpReward: 200,
    badgeId: 'variety-master',
    difficulty: 'hard' as const,
    isActive: true,
    progress: 0,
    createdAt: new Date(),
  }
];

const mockUserMissions = [
  {
    id: '1',
    userId: 'user1',
    missionId: '1',
    progress: 3,
    isCompleted: false,
    startedAt: new Date(),
  },
  {
    id: '2', 
    userId: 'user1',
    missionId: '2',
    progress: 12,
    isCompleted: false,
    startedAt: new Date(),
  }
];

export default function Page() {
  const handleClaimReward = (missionId: string) => {
    console.warn('Claiming reward for mission:', missionId);
  };

  const handleFilterChange = (filters: { type?: string; difficulty?: string; category?: string }) => {
    console.warn('Filter changed:', filters);
  };

  return (
    <MissionsPage
      missions={mockMissions}
      userMissions={mockUserMissions}
      onClaimReward={handleClaimReward}
      onFilterChange={handleFilterChange}
    />
  );
}