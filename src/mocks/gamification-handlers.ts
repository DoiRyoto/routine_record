import { rest } from 'msw';
import type { 
  Mission, 
  UserMission, 
  Badge, 
  UserBadge, 
  UserProfile, 
  Challenge, 
  UserChallenge,
  XPTransaction,
  GameNotification 
} from '@/types/gamification';

// モックデータ
const mockMissions: Mission[] = [
  {
    id: '1',
    title: '7日間連続実行',
    description: '同じルーティンを7日間続けて実行しよう',
    type: 'streak',
    targetValue: 7,
    xpReward: 100,
    difficulty: 'easy',
    isActive: true,
    progress: 0,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: '今週20回実行',
    description: 'この週に合計20回のルーティンを実行しよう',
    type: 'count',
    targetValue: 20,
    xpReward: 150,
    difficulty: 'medium',
    isActive: true,
    progress: 0,
    createdAt: new Date(),
  },
  {
    id: '3',
    title: '5つの異なるカテゴリ',
    description: '5つの異なるカテゴリのルーティンを実行しよう',
    type: 'variety',
    targetValue: 5,
    xpReward: 200,
    badgeId: 'variety-master',
    difficulty: 'hard',
    isActive: true,
    progress: 0,
    createdAt: new Date(),
  }
];

const mockUserMissions: UserMission[] = [
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

const mockBadges: Badge[] = [
  {
    id: 'badge1',
    name: '習慣マスター',
    description: '10個のルーティンを完了',
    iconUrl: '/badges/habit-master.png',
    rarity: 'rare',
    category: '実績',
    createdAt: new Date(),
  },
  {
    id: 'badge2',
    name: 'ストリークキング',
    description: '30日連続実行',
    iconUrl: '/badges/streak-king.png',
    rarity: 'epic',
    category: 'ストリーク',
    createdAt: new Date(),
  }
];

const mockUserBadges: UserBadge[] = [
  {
    id: '1',
    userId: 'user1',
    badgeId: 'badge1',
    badge: mockBadges[0],
    unlockedAt: new Date(),
    isNew: true,
  }
];

const mockUserProfile: UserProfile = {
  userId: 'user1',
  level: 8,
  totalXP: 1650,
  currentXP: 150,
  nextLevelXP: 300,
  badges: mockUserBadges,
  streak: 12,
  longestStreak: 28,
  totalRoutines: 5,
  totalExecutions: 42,
  joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  lastActiveAt: new Date(),
};

const mockChallenges: Challenge[] = [
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
    rewards: [
      {
        id: '1',
        challengeId: '1',
        name: '新年マスターバッジ',
        description: '2025年最初のチャレンジ完了者',
        badgeId: 'new-year-2025',
        requirement: 'completion'
      }
    ],
    requirements: [
      {
        id: '1',
        challengeId: '1',
        type: 'routine_count',
        value: 100,
        description: '1月中に100回のルーティンを実行'
      }
    ],
    createdAt: new Date()
  }
];

const mockUserChallenges: UserChallenge[] = [
  {
    id: '1',
    userId: 'user1',
    challengeId: '1',
    joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    progress: 65,
    isCompleted: false,
    rank: 23
  }
];

export const gamificationHandlers = [
  // ミッション関連API
  rest.get('/api/missions', (req, res, ctx) => {
    return res(ctx.json({ missions: mockMissions }));
  }),

  rest.get('/api/missions/:id', (req, res, ctx) => {
    const { id } = req.params;
    const mission = mockMissions.find(m => m.id === id);
    if (!mission) {
      return res(ctx.status(404), ctx.json({ error: 'Mission not found' }));
    }
    return res(ctx.json({ mission }));
  }),

  rest.post('/api/missions/complete', async (req, res, ctx) => {
    const { missionId } = await req.json() as { missionId: string };
    const mission = mockMissions.find(m => m.id === missionId);
    
    if (!mission) {
      return res(ctx.status(404), ctx.json({ error: 'Mission not found' }));
    }

    // ミッション完了処理のシミュレーション
    const completedMission: UserMission = {
      id: `completed-${missionId}`,
      userId: 'user1',
      missionId,
      progress: mission.targetValue,
      isCompleted: true,
      startedAt: new Date(),
      completedAt: new Date()
    };

    return res(ctx.json({ 
      userMission: completedMission,
      xpGained: mission.xpReward,
      badgeUnlocked: mission.badgeId ? mockBadges.find(b => b.id === mission.badgeId) : null
    }));
  }),

  // ユーザーミッション関連API
  rest.get('/api/user-missions', (req, res, ctx) => {
    const userId = req.url.searchParams.get('userId') || 'user1';
    const userMissions = mockUserMissions.filter(um => um.userId === userId);
    return res(ctx.json({ userMissions }));
  }),

  // プロフィール関連API
  rest.get('/api/profile', (req, res, ctx) => {
    const userId = req.url.searchParams.get('userId') || 'user1';
    if (userId !== mockUserProfile.userId) {
      return res(ctx.status(404), ctx.json({ error: 'Profile not found' }));
    }
    return res(ctx.json({ profile: mockUserProfile }));
  }),

  rest.put('/api/profile', async (req, res, ctx) => {
    const updates = await req.json() as Partial<UserProfile>;
    const updatedProfile = { ...mockUserProfile, ...updates };
    return res(ctx.json({ profile: updatedProfile }));
  }),

  // バッジ関連API
  rest.get('/api/badges', (req, res, ctx) => {
    return res(ctx.json({ badges: mockBadges }));
  }),

  rest.get('/api/user-badges', (req, res, ctx) => {
    const userId = req.url.searchParams.get('userId') || 'user1';
    const userBadges = mockUserBadges.filter(ub => ub.userId === userId);
    return res(ctx.json({ userBadges }));
  }),

  // チャレンジ関連API
  rest.get('/api/challenges', (req, res, ctx) => {
    const type = req.url.searchParams.get('type');
    let challenges = mockChallenges;
    
    if (type) {
      challenges = challenges.filter(c => c.type === type);
    }
    
    return res(ctx.json({ challenges }));
  }),

  rest.post('/api/challenges/join', async (req, res, ctx) => {
    const { challengeId } = await req.json() as { challengeId: string };
    const challenge = mockChallenges.find(c => c.id === challengeId);
    
    if (!challenge) {
      return res(ctx.status(404), ctx.json({ error: 'Challenge not found' }));
    }

    const userChallenge: UserChallenge = {
      id: `user-challenge-${challengeId}`,
      userId: 'user1',
      challengeId,
      joinedAt: new Date(),
      progress: 0,
      isCompleted: false
    };

    return res(ctx.json({ userChallenge }));
  }),

  rest.post('/api/challenges/leave', async (req, res, ctx) => {
    const { challengeId } = await req.json() as { challengeId: string };
    return res(ctx.json({ success: true, challengeId }));
  }),

  rest.get('/api/user-challenges', (req, res, ctx) => {
    const userId = req.url.searchParams.get('userId') || 'user1';
    const userChallenges = mockUserChallenges.filter(uc => uc.userId === userId);
    return res(ctx.json({ userChallenges }));
  }),

  // XP関連API
  rest.post('/api/xp/add', async (req, res, ctx) => {
    const { amount, reason, sourceType, sourceId } = await req.json() as {
      amount: number;
      reason: string;
      sourceType: string;
      sourceId: string;
    };

    const xpTransaction: XPTransaction = {
      id: `xp-${Date.now()}`,
      userId: 'user1',
      amount,
      reason,
      sourceType: sourceType as any,
      sourceId,
      createdAt: new Date()
    };

    // プロフィール更新のシミュレーション
    const newTotalXP = mockUserProfile.totalXP + amount;
    const updatedProfile = {
      ...mockUserProfile,
      totalXP: newTotalXP,
      currentXP: mockUserProfile.currentXP + amount
    };

    return res(ctx.json({ 
      xpTransaction, 
      profile: updatedProfile,
      levelUp: newTotalXP >= mockUserProfile.totalXP + mockUserProfile.nextLevelXP - mockUserProfile.currentXP
    }));
  }),

  // 通知関連API
  rest.get('/api/notifications', (req, res, ctx) => {
    const mockNotifications: GameNotification[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'level_up',
        title: 'レベルアップ！',
        message: 'レベル9に到達しました！',
        data: { level: 9, xp: 50 },
        isRead: false,
        createdAt: new Date()
      },
      {
        id: '2',
        userId: 'user1',
        type: 'badge_unlocked',
        title: 'バッジ獲得！',
        message: '習慣マスターバッジを獲得しました！',
        data: { badgeId: 'badge1' },
        isRead: false,
        createdAt: new Date()
      }
    ];

    return res(ctx.json({ notifications: mockNotifications }));
  }),

  rest.put('/api/notifications/:id/read', (req, res, ctx) => {
    const { id } = req.params;
    return res(ctx.json({ success: true, notificationId: id }));
  })
];