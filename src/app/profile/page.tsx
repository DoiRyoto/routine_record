import { ProfilePage } from './ProfilePage';

// モックデータ
const mockUserProfile = {
  userId: 'user1',
  level: 12,
  totalXP: 2450,
  currentXP: 450,
  nextLevelXP: 600,
  badges: [
    {
      id: '1',
      userId: 'user1',
      badgeId: 'badge1',
      badge: {
        id: 'badge1',
        name: '習慣マスター',
        description: '10個のルーティンを完了',
        iconUrl: '',
        rarity: 'rare' as const,
        category: '実績',
        createdAt: new Date(),
      },
      unlockedAt: new Date(),
      isNew: true,
    },
    {
      id: '2',
      userId: 'user1',
      badgeId: 'badge2',
      badge: {
        id: 'badge2',
        name: 'ストリークキング',
        description: '30日連続実行',
        iconUrl: '',
        rarity: 'epic' as const,
        category: 'ストリーク',
        createdAt: new Date(),
      },
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isNew: false,
    },
    {
      id: '3',
      userId: 'user1',
      badgeId: 'badge3',
      badge: {
        id: 'badge3',
        name: '伝説の継続者',
        description: '100日連続実行',
        iconUrl: '',
        rarity: 'legendary' as const,
        category: 'ストリーク',
        createdAt: new Date(),
      },
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      isNew: false,
    }
  ],
  streak: 45,
  longestStreak: 67,
  totalRoutines: 15,
  totalExecutions: 342,
  title: 'ルーティンマスター',
  joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
  lastActiveAt: new Date(),
};

const mockStreakData = {
  current: 45,
  longest: 67,
  lastExecutionDate: new Date(),
  freezesUsed: 2,
  freezesAvailable: 3,
};

export default function Page() {
  const handleAvatarChange = (avatarUrl: string) => {
    console.warn('Avatar changed:', avatarUrl);
  };

  const handleTitleChange = (title: string) => {
    console.warn('Title changed:', title);
  };

  const handleBadgeClick = (badge: { id: string; userId: string; badgeId: string; unlockedAt: Date }) => {
    console.warn('Badge clicked:', badge);
  };

  return (
    <ProfilePage
      userProfile={mockUserProfile}
      streakData={mockStreakData}
      onAvatarChange={handleAvatarChange}
      onTitleChange={handleTitleChange}
      onBadgeClick={handleBadgeClick}
    />
  );
}