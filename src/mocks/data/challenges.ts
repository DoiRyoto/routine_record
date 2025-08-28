import type { Challenge, UserChallenge, ChallengeReward, ChallengeRequirement } from '@/lib/db/schema';

// モックチャレンジデータ

export const mockUserChallenges: UserChallenge[] = [
  {
    id: '1',
    userId: 'user1',
    challengeId: '1',
    joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    progress: 65,
    isCompleted: false,
    completedAt: null,
    rank: 23,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    challengeId: '2',
    joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    progress: 85,
    isCompleted: false,
    completedAt: null,
    rank: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'user1',
    challengeId: '4',
    joinedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    progress: 26,
    isCompleted: false,
    completedAt: null,
    rank: 156,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    userId: 'user2',
    challengeId: '1',
    joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    progress: 32,
    isCompleted: false,
    completedAt: null,
    rank: 78,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    userId: 'user3',
    challengeId: '2',
    joinedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
    progress: 100,
    isCompleted: true,
    completedAt: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000),
    rank: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockChallenges: (Challenge & {
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
})[] = [
  {
    id: '1',
    title: '新年スタートダッシュ',
    description: '1月中に100回のルーティンを実行して2025年を最高のスタートにしよう！',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    type: 'monthly',
    participants: 1247,
    maxParticipants: 2000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    requirements: [
      {
        id: '1',
        challengeId: '1',
        type: 'routine_count',
        value: 100,
        description: '1月中に100回のルーティンを実行',
        createdAt: new Date(),
      },
    ],
    rewards: [
      {
        id: '1',
        challengeId: '1',
        name: '新年マスターバッジ',
        description: '2025年最初のチャレンジ完了者',
        badgeId: 'new-year-2025',
        xpAmount: null,
        requirement: 'completion',
        createdAt: new Date(),
      },
      {
        id: '2',
        challengeId: '1',
        name: 'XPボーナス',
        description: '完了報酬',
        badgeId: null,
        xpAmount: 500,
        requirement: 'completion',
        createdAt: new Date(),
      },
    ],
  },
  {
    id: '2',
    title: 'ウィークリー完璧主義者',
    description: 'この週に毎日少なくとも3つのルーティンを実行しよう',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    type: 'weekly',
    participants: 456,
    maxParticipants: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    requirements: [
      {
        id: '2',
        challengeId: '2',
        type: 'routine_count',
        value: 21,
        description: '週間で21回のルーティンを実行（毎日3回 × 7日）',
        createdAt: new Date(),
      },
    ],
    rewards: [
      {
        id: '3',
        challengeId: '2',
        name: 'XPブースト',
        description: '週間完了報酬',
        badgeId: null,
        xpAmount: 200,
        requirement: 'completion',
        createdAt: new Date(),
      },
    ],
  },
  {
    id: '3',
    title: '春の習慣チャレンジ',
    description: '春に向けて新しい習慣を身につけよう！3つの異なるカテゴリのルーティンを実行する',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    type: 'seasonal',
    participants: 0,
    maxParticipants: null,
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    requirements: [
      {
        id: '3',
        challengeId: '3',
        type: 'category',
        value: 3,
        description: '3つの異なるカテゴリのルーティンを実行',
        createdAt: new Date(),
      },
    ],
    rewards: [
      {
        id: '4',
        challengeId: '3',
        name: '春の新習慣バッジ',
        description: 'シーズナルチャレンジ完了者',
        badgeId: 'spring-habits',
        xpAmount: null,
        requirement: 'completion',
        createdAt: new Date(),
      },
    ],
  },
  {
    id: '4',
    title: '継続の力',
    description: '30日間連続でルーティンを実行し、習慣化の力を実感しよう',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    type: 'monthly',
    participants: 523,
    maxParticipants: 1000,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    requirements: [
      {
        id: '4',
        challengeId: '4',
        type: 'streak_days',
        value: 30,
        description: '30日連続でルーティンを実行',
        createdAt: new Date(),
      },
    ],
    rewards: [
      {
        id: '5',
        challengeId: '4',
        name: '継続マスターバッジ',
        description: '30日連続達成者',
        badgeId: 'streak-master-30',
        xpAmount: null,
        requirement: 'completion',
        createdAt: new Date(),
      },
      {
        id: '6',
        challengeId: '4',
        name: 'ストリークボーナス',
        description: '継続報酬',
        badgeId: null,
        xpAmount: 300,
        requirement: 'completion',
        createdAt: new Date(),
      },
    ],
  },
  {
    id: '5',
    title: '夏の健康チャレンジ',
    description: '暑い夏を乗り切るための健康習慣を身につけよう',
    startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
    type: 'seasonal',
    participants: 0,
    maxParticipants: 500,
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    requirements: [
      {
        id: '5',
        challengeId: '5',
        type: 'routine_count',
        value: 60,
        description: '健康カテゴリのルーティンを60回実行',
        createdAt: new Date(),
      },
    ],
    rewards: [
      {
        id: '7',
        challengeId: '5',
        name: '夏の健康バッジ',
        description: '夏季健康チャレンジ完了者',
        badgeId: 'summer-health',
        xpAmount: null,
        requirement: 'completion',
        createdAt: new Date(),
      },
    ],
  },
];

// Mock関数 - lib/db/queries/challenges.ts に対応
export const getMockActiveChallenges = () => {
  return mockChallenges.filter(c => c.isActive);
};

export const getMockUserChallenges = (userId: string) => {
  return mockUserChallenges.filter(uc => uc.userId === userId);
};

export const mockJoinChallenge = (userId: string, challengeId: string): UserChallenge => {
  const newUserChallenge: UserChallenge = {
    id: `user-challenge-${challengeId}-${Date.now()}`,
    userId,
    challengeId,
    joinedAt: new Date(),
    progress: 0,
    isCompleted: false,
    completedAt: null,
    rank: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockUserChallenges.push(newUserChallenge);
  
  // 参加者数を増やす
  const challenge = mockChallenges.find(c => c.id === challengeId);
  if (challenge) {
    challenge.participants += 1;
  }
  
  return newUserChallenge;
};

export const mockLeaveChallenge = (userId: string, challengeId: string): void => {
  const index = mockUserChallenges.findIndex(uc => 
    uc.userId === userId && uc.challengeId === challengeId
  );
  
  if (index !== -1) {
    mockUserChallenges.splice(index, 1);
    
    // 参加者数を減らす
    const challenge = mockChallenges.find(c => c.id === challengeId);
    if (challenge && challenge.participants > 0) {
      challenge.participants -= 1;
    }
  }
};

export const mockUpdateChallengeProgress = (
  userId: string, 
  challengeId: string, 
  progress: number
): UserChallenge => {
  const userChallenge = mockUserChallenges.find(uc => 
    uc.userId === userId && uc.challengeId === challengeId
  );
  
  if (!userChallenge) {
    throw new Error('ユーザーチャレンジが見つかりません');
  }
  
  userChallenge.progress = progress;
  userChallenge.updatedAt = new Date();
  
  if (progress >= 100 && !userChallenge.isCompleted) {
    userChallenge.isCompleted = true;
    userChallenge.completedAt = new Date();
  }
  
  return userChallenge;
};