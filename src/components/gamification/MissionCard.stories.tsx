import type { Meta, StoryObj } from '@storybook/nextjs';

import { MissionCard } from './MissionCard';

const meta: Meta<typeof MissionCard> = {
  title: 'Gamification/MissionCard',
  component: MissionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClaim: { action: 'claimed' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockMission = {
  id: '1',
  title: '7日間連続実行',
  description: '同じルーティンを7日間続けて実行しよう。継続は力なり！',
  type: 'streak' as const,
  targetValue: 7,
  xpReward: 100,
  difficulty: 'easy' as const,
  isActive: true,
  progress: 0,
  createdAt: new Date(),
};

export const Default: Story = {
  args: {
    mission: mockMission,
  },
};

export const WithProgress: Story = {
  args: {
    mission: mockMission,
    userMission: {
      id: 'user-1',
      userId: 'user1',
      missionId: '1',
      progress: 3,
      isCompleted: false,
      startedAt: new Date(),
    },
  },
};

export const Completed: Story = {
  args: {
    mission: mockMission,
    userMission: {
      id: 'user-1',
      userId: 'user1',
      missionId: '1',
      progress: 7,
      isCompleted: true,
      startedAt: new Date(),
      completedAt: new Date(),
    },
  },
};

export const MediumDifficulty: Story = {
  args: {
    mission: {
      ...mockMission,
      title: '今週20回実行',
      description: 'この週に合計20回のルーティンを実行しよう',
      type: 'count' as const,
      targetValue: 20,
      xpReward: 150,
      difficulty: 'medium' as const,
    },
    userMission: {
      id: 'user-1',
      userId: 'user1',
      missionId: '1',
      progress: 12,
      isCompleted: false,
      startedAt: new Date(),
    },
  },
};

export const HardDifficulty: Story = {
  args: {
    mission: {
      ...mockMission,
      title: '5つの異なるカテゴリ',
      description: '5つの異なるカテゴリのルーティンを実行しよう',
      type: 'variety' as const,
      targetValue: 5,
      xpReward: 200,
      badgeId: 'variety-master',
      difficulty: 'hard' as const,
    },
    userMission: {
      id: 'user-1',
      userId: 'user1',
      missionId: '1',
      progress: 2,
      isCompleted: false,
      startedAt: new Date(),
    },
  },
};

export const Legendary: Story = {
  args: {
    mission: {
      ...mockMission,
      title: '伝説の継続者',
      description: '100日連続でルーティンを実行しよう。伝説になれるか？',
      type: 'streak' as const,
      targetValue: 100,
      xpReward: 1000,
      badgeId: 'legendary-streak',
      difficulty: 'legendary' as const,
    },
    userMission: {
      id: 'user-1',
      userId: 'user1',
      missionId: '1',
      progress: 45,
      isCompleted: false,
      startedAt: new Date(),
    },
  },
};

export const WithBadgeReward: Story = {
  args: {
    mission: {
      ...mockMission,
      title: '習慣マスター',
      description: '10個の異なるルーティンを完了してマスターになろう',
      badgeId: 'habit-master',
      xpReward: 250,
    },
  },
};

export const WithExpiration: Story = {
  args: {
    mission: {
      ...mockMission,
      title: '今日のチャレンジ',
      description: '今日中に3つのルーティンを完了しよう',
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8時間後
    },
    userMission: {
      id: 'user-1',
      userId: 'user1',
      missionId: '1',
      progress: 1,
      isCompleted: false,
      startedAt: new Date(),
    },
  },
};

export const AlmostCompleted: Story = {
  args: {
    mission: mockMission,
    userMission: {
      id: 'user-1',
      userId: 'user1',
      missionId: '1',
      progress: 6,
      isCompleted: false,
      startedAt: new Date(),
    },
  },
};