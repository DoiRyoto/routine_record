import type { Meta, StoryObj } from '@storybook/nextjs';

import { ChallengesPage } from './ChallengesPage';

const meta: Meta<typeof ChallengesPage> = {
  title: 'Pages/ChallengesPage',
  component: ChallengesPage,
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
const mockChallenges = [
  {
    id: '1',
    title: '新年スタートダッシュ',
    description: '1月中に100回のルーティンを実行して2025年を最高のスタートにしよう！',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    type: 'monthly' as const,
    participants: 1247,
    maxParticipants: 2000,
    isActive: true,
    rewards: [
      {
        id: '1',
        challengeId: '1',
        name: '新年マスターバッジ',
        description: '2025年最初のチャレンジ完了者',
        badgeId: 'new-year-2025',
        requirement: 'completion' as const
      },
      {
        id: '2',
        challengeId: '1',
        name: 'XPボーナス',
        description: '完了報酬',
        xpAmount: 500,
        requirement: 'completion' as const
      }
    ],
    requirements: [
      {
        id: '1',
        challengeId: '1',
        type: 'routine_count' as const,
        value: 100,
        description: '1月中に100回のルーティンを実行'
      }
    ],
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'ウィークリー完璧主義者',
    description: 'この週に毎日少なくとも3つのルーティンを実行しよう',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    type: 'weekly' as const,
    participants: 456,
    isActive: true,
    rewards: [
      {
        id: '3',
        challengeId: '2',
        name: 'XPブースト',
        description: '週間完了報酬',
        xpAmount: 200,
        requirement: 'completion' as const
      }
    ],
    requirements: [
      {
        id: '2',
        challengeId: '2',
        type: 'routine_count' as const,
        value: 21,
        description: '週間で21回のルーティンを実行（毎日3回 × 7日）'
      }
    ],
    createdAt: new Date()
  },
  {
    id: '3',
    title: 'シーズナル習慣チャレンジ',
    description: '季節に向けて新しい習慣を身につけよう！3つの異なるカテゴリのルーティンを実行する',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
    type: 'seasonal' as const,
    participants: 892,
    isActive: true,
    rewards: [
      {
        id: '4',
        challengeId: '3',
        name: '季節の新習慣バッジ',
        description: 'シーズナルチャレンジ完了者',
        badgeId: 'seasonal-habits',
        requirement: 'completion' as const
      }
    ],
    requirements: [
      {
        id: '3',
        challengeId: '3',
        type: 'category' as const,
        value: 3,
        description: '3つの異なるカテゴリのルーティンを実行'
      }
    ],
    createdAt: new Date()
  },
  {
    id: '4',
    title: 'スペシャル限定イベント',
    description: '特別なイベント期間中の限定チャレンジ！特別な報酬が待っている',
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    type: 'special' as const,
    participants: 234,
    maxParticipants: 500,
    isActive: true,
    rewards: [
      {
        id: '5',
        challengeId: '4',
        name: 'レア限定バッジ',
        description: '限定イベント参加者のみ',
        badgeId: 'special-event',
        requirement: 'participation' as const
      }
    ],
    requirements: [
      {
        id: '4',
        challengeId: '4',
        type: 'routine_count' as const,
        value: 10,
        description: 'イベント期間中に10回のルーティンを実行'
      }
    ],
    createdAt: new Date()
  },
  {
    id: '5',
    title: '春の準備チャレンジ',
    description: '春に向けて新しい習慣を準備しよう',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    type: 'seasonal' as const,
    participants: 0,
    isActive: false,
    rewards: [],
    requirements: [],
    createdAt: new Date()
  }
];

const mockUserChallenges = [
  {
    id: '1',
    userId: 'user1',
    challengeId: '1',
    joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    progress: 65,
    isCompleted: false,
    rank: 23
  },
  {
    id: '2',
    userId: 'user1',
    challengeId: '2',
    joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    progress: 100,
    isCompleted: true,
    completedAt: new Date(),
    rank: 12
  }
];

export const Default: Story = {
  args: {
    challenges: mockChallenges,
    userChallenges: mockUserChallenges,
  },
};

export const Empty: Story = {
  args: {
    challenges: [],
    userChallenges: [],
  },
};

export const AllJoined: Story = {
  args: {
    challenges: mockChallenges.filter(c => c.isActive),
    userChallenges: mockChallenges
      .filter(c => c.isActive)
      .map((challenge, index) => ({
        id: `user-${index + 1}`,
        userId: 'user1',
        challengeId: challenge.id,
        joinedAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
        progress: Math.floor(Math.random() * 100),
        isCompleted: Math.random() > 0.5,
        rank: Math.floor(Math.random() * 100) + 1
      })),
  },
};

export const NoActiveChallenges: Story = {
  args: {
    challenges: mockChallenges.map(c => ({ ...c, isActive: false })),
    userChallenges: [],
  },
};

export const UpcomingOnly: Story = {
  args: {
    challenges: [mockChallenges[4]], // 近日開催予定のみ
    userChallenges: [],
  },
};

export const WeeklyOnly: Story = {
  args: {
    challenges: mockChallenges.filter(c => c.type === 'weekly'),
    userChallenges: mockUserChallenges.filter(uc => uc.challengeId === '2'),
  },
};

export const SpecialOnly: Story = {
  args: {
    challenges: mockChallenges.filter(c => c.type === 'special'),
    userChallenges: [],
  },
};