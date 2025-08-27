import type { Meta, StoryObj } from '@storybook/nextjs';

import { MissionsPage } from './MissionsPage';

const meta: Meta<typeof MissionsPage> = {
  title: 'Pages/MissionsPage',
  component: MissionsPage,
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
  },
  {
    id: '4',
    title: '伝説の継続者',
    description: '100日連続でルーティンを実行しよう',
    type: 'streak' as const,
    targetValue: 100,
    xpReward: 1000,
    badgeId: 'legendary-streak',
    difficulty: 'legendary' as const,
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
  },
  {
    id: '3',
    userId: 'user1',
    missionId: '3',
    progress: 5,
    isCompleted: true,
    startedAt: new Date(),
    completedAt: new Date(),
  }
];

export const Default: Story = {
  args: {
    missions: mockMissions,
    userMissions: mockUserMissions,
  },
};

export const Empty: Story = {
  args: {
    missions: [],
    userMissions: [],
  },
};

export const AllCompleted: Story = {
  args: {
    missions: mockMissions,
    userMissions: mockMissions.map((mission, index) => ({
      id: `user-${index + 1}`,
      userId: 'user1',
      missionId: mission.id,
      progress: mission.targetValue,
      isCompleted: true,
      startedAt: new Date(),
      completedAt: new Date(),
    })),
  },
};

export const InProgress: Story = {
  args: {
    missions: mockMissions,
    userMissions: mockMissions.map((mission, index) => ({
      id: `user-${index + 1}`,
      userId: 'user1',
      missionId: mission.id,
      progress: Math.floor(mission.targetValue * 0.6),
      isCompleted: false,
      startedAt: new Date(),
    })),
  },
};

export const Loading: Story = {
  args: {
    missions: [],
    userMissions: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'ローディング状態のミッションページ',
      },
    },
  },
};