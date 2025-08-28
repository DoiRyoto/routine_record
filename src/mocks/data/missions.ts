import type { Mission, UserMission } from '@/lib/db/schema';

export const mockMissions: Mission[] = [
  {
    id: '1',
    title: '習慣の第一歩',
    description: '初めてのルーティンを完了しよう',
    type: 'count',
    targetValue: 1,
    xpReward: 50,
    badgeId: 'routine-creator',
    difficulty: 'easy',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: '7日チャレンジ',
    description: '7日連続でルーティンを実行しよう',
    type: 'streak',
    targetValue: 7,
    xpReward: 150,
    badgeId: 'weekly-warrior',
    difficulty: 'medium',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: '多様性の追求',
    description: '3つの異なるカテゴリでルーティンを実行しよう',
    type: 'variety',
    targetValue: 3,
    xpReward: 100,
    badgeId: null,
    difficulty: 'medium',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: '完璧主義者',
    description: '1日に10回のルーティンを実行しよう',
    type: 'count',
    targetValue: 10,
    xpReward: 200,
    badgeId: 'perfectionist',
    difficulty: 'hard',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: '継続は力なり',
    description: '30日連続でルーティンを実行しよう',
    type: 'streak',
    targetValue: 30,
    xpReward: 500,
    badgeId: 'badge2',
    difficulty: 'extreme',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: '週間コンシステンシー',
    description: '1週間毎日最低1つのルーティンを実行しよう',
    type: 'consistency',
    targetValue: 7,
    xpReward: 120,
    badgeId: null,
    difficulty: 'medium',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    title: 'ルーティンコレクター',
    description: '20個のルーティンを実行しよう',
    type: 'count',
    targetValue: 20,
    xpReward: 250,
    badgeId: null,
    difficulty: 'hard',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockUserMissions: UserMission[] = [
  {
    id: '1',
    userId: 'user1',
    missionId: '1',
    progress: 1,
    isCompleted: true,
    startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    claimedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    userId: 'user1',
    missionId: '2',
    progress: 5,
    isCompleted: false,
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    completedAt: null,
    claimedAt: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'user1',
    missionId: '3',
    progress: 2,
    isCompleted: false,
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    completedAt: null,
    claimedAt: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: '4',
    userId: 'user2',
    missionId: '1',
    progress: 1,
    isCompleted: true,
    startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
    claimedAt: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    userId: 'user3',
    missionId: '5',
    progress: 30,
    isCompleted: true,
    startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    claimedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// Mock関数 - lib/db/queries/missions.ts に対応
export const getMockAllMissions = (): Mission[] => {
  return mockMissions.filter(mission => mission.isActive);
};

export const getMockMissionById = (id: string): Mission | null => {
  return mockMissions.find(mission => mission.id === id) || null;
};

export const getMockUserMissions = (userId: string): UserMission[] => {
  return mockUserMissions.filter(um => um.userId === userId);
};

export const getMockUserMissionById = (id: string): UserMission | null => {
  return mockUserMissions.find(um => um.id === id) || null;
};

export const mockStartMission = (userId: string, missionId: string): UserMission => {
  // すでに開始済みかチェック
  const existingMission = mockUserMissions.find(um => 
    um.userId === userId && um.missionId === missionId
  );
  
  if (existingMission) {
    throw new Error('このミッションは既に開始済みです');
  }
  
  const mission = getMockMissionById(missionId);
  if (!mission) {
    throw new Error('ミッションが見つかりません');
  }
  
  const newUserMission: UserMission = {
    id: `user-mission-${userId}-${missionId}-${Date.now()}`,
    userId,
    missionId,
    progress: 0,
    isCompleted: false,
    startedAt: new Date(),
    completedAt: null,
    claimedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockUserMissions.push(newUserMission);
  return newUserMission;
};

export const mockUpdateMissionProgress = (
  userMissionId: string, 
  progress: number
): UserMission => {
  const userMission = mockUserMissions.find(um => um.id === userMissionId);
  if (!userMission) {
    throw new Error('ユーザーミッションが見つかりません');
  }
  
  const mission = getMockMissionById(userMission.missionId);
  if (!mission) {
    throw new Error('ミッションが見つかりません');
  }
  
  userMission.progress = progress;
  userMission.updatedAt = new Date();
  
  // 達成判定
  if (progress >= mission.targetValue && !userMission.isCompleted) {
    userMission.isCompleted = true;
    userMission.completedAt = new Date();
  }
  
  return userMission;
};

export const mockClaimMissionReward = (userMissionId: string): UserMission => {
  const userMission = mockUserMissions.find(um => um.id === userMissionId);
  if (!userMission) {
    throw new Error('ユーザーミッションが見つかりません');
  }
  
  if (!userMission.isCompleted) {
    throw new Error('未完了のミッションの報酬は受け取れません');
  }
  
  if (userMission.claimedAt) {
    throw new Error('この報酬は既に受け取り済みです');
  }
  
  userMission.claimedAt = new Date();
  userMission.updatedAt = new Date();
  
  return userMission;
};