'use client';

import { ChallengesPage } from './ChallengesPage';

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
    title: '春の習慣チャレンジ',
    description: '春に向けて新しい習慣を身につけよう！3つの異なるカテゴリのルーティンを実行する',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    type: 'seasonal' as const,
    participants: 0,
    isActive: false,
    rewards: [
      {
        id: '4',
        challengeId: '3',
        name: '春の新習慣バッジ',
        description: 'シーズナルチャレンジ完了者',
        badgeId: 'spring-habits',
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
    progress: 85,
    isCompleted: false,
    rank: 12
  }
];

export default function Page() {
  const handleJoinChallenge = (challengeId: string) => {
    console.warn('Joining challenge:', challengeId);
  };

  const handleLeaveChallenge = (challengeId: string) => {
    console.warn('Leaving challenge:', challengeId);
  };

  return (
    <ChallengesPage
      challenges={mockChallenges}
      userChallenges={mockUserChallenges}
      onJoinChallenge={handleJoinChallenge}
      onLeaveChallenge={handleLeaveChallenge}
    />
  );
}