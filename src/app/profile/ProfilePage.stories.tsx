import type { Meta, StoryObj } from '@storybook/nextjs';

import { ProfilePage } from './ProfilePage';

const meta: Meta<typeof ProfilePage> = {
  title: 'Pages/ProfilePage',
  component: ProfilePage,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// モックデータ
const mockUserProfile = {
  userId: 'user1',
  level: 12,
  totalXP: 2450,
  currentXP: 450,
  nextLevelXP: 600,
  streak: 45,
  longestStreak: 67,
  totalRoutines: 15,
  totalExecutions: 342,
  joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
  lastActiveAt: new Date(),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
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
        updatedAt: new Date(),
      },
      unlockedAt: new Date(),
      isNew: true,
      createdAt: new Date(),
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
        updatedAt: new Date(),
      },
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isNew: false,
      createdAt: new Date(),
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
        updatedAt: new Date(),
      },
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      isNew: false,
      createdAt: new Date(),
    },
    {
      id: '4',
      userId: 'user1',
      badgeId: 'badge4',
      badge: {
        id: 'badge4',
        name: '朝型人間',
        description: '朝6時前にルーティンを50回完了',
        iconUrl: '',
        rarity: 'common' as const,
        category: '時間',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      isNew: false,
      createdAt: new Date(),
    }
  ],
  title: 'ルーティンマスター',
};

const mockStreakData = {
  current: 45,
  longest: 67,
  freezeCount: 3,
  lastActiveDate: new Date(),
};

export const Default: Story = {
  args: {
    userProfile: mockUserProfile,
    streakData: mockStreakData,
  },
};

export const NewUser: Story = {
  args: {
    userProfile: {
      ...mockUserProfile,
      level: 1,
      totalXP: 50,
      currentXP: 50,
      nextLevelXP: 100,
      badges: [],
      streak: 0,
      longestStreak: 0,
      totalRoutines: 2,
      totalExecutions: 5,
      title: undefined,
      joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    streakData: {
      current: 0,
      longest: 0,
      freezeCount: 5,
      lastActiveDate: new Date(),
    },
  },
};

export const HighLevel: Story = {
  args: {
    userProfile: {
      ...mockUserProfile,
      level: 87,
      totalXP: 45720,
      currentXP: 820,
      nextLevelXP: 1000,
      badges: [...mockUserProfile.badges, ...Array(12).fill(mockUserProfile.badges[0]).map((badge, i) => ({
        ...badge,
        id: `badge-extra-${i}`,
        badgeId: `badge-extra-${i}`,
      }))],
      streak: 156,
      longestStreak: 203,
      totalRoutines: 47,
      totalExecutions: 2847,
      title: '伝説のルーティンマスター',
      joinedAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000),
    },
    streakData: {
      current: 156,
      longest: 203,
      freezeCount: 1,
      lastActiveDate: new Date(),
    },
  },
};

export const ManyBadges: Story = {
  args: {
    userProfile: {
      ...mockUserProfile,
      badges: Array(24).fill(null).map((_, i) => ({
        id: `badge-${i}`,
        userId: 'user1',
        badgeId: `badge-${i}`,
        badge: {
          id: `badge-${i}`,
          name: `バッジ ${i + 1}`,
          description: `説明 ${i + 1}`,
          iconUrl: '',
          rarity: (['common', 'rare', 'epic', 'legendary'] as const)[i % 4],
          category: 'テスト',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        unlockedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        isNew: i < 3,
        createdAt: new Date(),
      })),
    },
    streakData: mockStreakData,
  },
};

export const NoBadges: Story = {
  args: {
    userProfile: {
      ...mockUserProfile,
      badges: [],
    },
    streakData: mockStreakData,
  },
};