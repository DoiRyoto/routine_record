import { http, HttpResponse } from 'msw';

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
  http.get('/api/missions', () => {
    return HttpResponse.json({ missions: mockMissions });
  }),

  http.get('/api/missions/:id', ({ params }) => {
    const { id } = params;
    const mission = mockMissions.find(m => m.id === id);
    if (!mission) {
      return new HttpResponse(JSON.stringify({ error: 'Mission not found' }), { status: 404 });
    }
    return HttpResponse.json({ mission });
  }),

  http.post('/api/missions/complete', async ({ request }) => {
    const { missionId } = await request.json() as { missionId: string };
    const mission = mockMissions.find(m => m.id === missionId);
    
    if (!mission) {
      return new HttpResponse(JSON.stringify({ error: 'Mission not found' }), { status: 404 });
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

    return HttpResponse.json({ 
      userMission: completedMission,
      xpGained: mission.xpReward,
      badgeUnlocked: mission.badgeId ? mockBadges.find(b => b.id === mission.badgeId) : null
    });
  }),

  // ユーザーミッション関連API
  http.get('/api/user-missions', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'user1';
    const userMissions = mockUserMissions.filter(um => um.userId === userId);
    return HttpResponse.json({ userMissions });
  }),

  // プロフィール関連API
  http.get('/api/profile', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'user1';
    if (userId !== mockUserProfile.userId) {
      return new HttpResponse(JSON.stringify({ error: 'Profile not found' }), { status: 404 });
    }
    return HttpResponse.json({ profile: mockUserProfile });
  }),

  http.put('/api/profile', async ({ request }) => {
    const updates = await request.json() as Partial<UserProfile>;
    const updatedProfile = { ...mockUserProfile, ...updates };
    return HttpResponse.json({ profile: updatedProfile });
  }),

  // バッジ関連API
  http.get('/api/badges', () => {
    return HttpResponse.json({ badges: mockBadges });
  }),

  http.get('/api/user-badges', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'user1';
    const userBadges = mockUserBadges.filter(ub => ub.userId === userId);
    return HttpResponse.json({ userBadges });
  }),

  // チャレンジ関連API
  http.get('/api/challenges', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    let challenges = mockChallenges;
    
    if (type) {
      challenges = challenges.filter(c => c.type === type);
    }
    
    return HttpResponse.json({ challenges });
  }),

  http.post('/api/challenges/join', async ({ request }) => {
    const { challengeId } = await request.json() as { challengeId: string };
    const challenge = mockChallenges.find(c => c.id === challengeId);
    
    if (!challenge) {
      return new HttpResponse(JSON.stringify({ error: 'Challenge not found' }), { status: 404 });
    }

    const userChallenge: UserChallenge = {
      id: `user-challenge-${challengeId}`,
      userId: 'user1',
      challengeId,
      joinedAt: new Date(),
      progress: 0,
      isCompleted: false
    };

    return HttpResponse.json({ userChallenge });
  }),

  http.post('/api/challenges/leave', async ({ request }) => {
    const { challengeId } = await request.json() as { challengeId: string };
    return HttpResponse.json({ success: true, challengeId });
  }),

  http.get('/api/user-challenges', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'user1';
    const userChallenges = mockUserChallenges.filter(uc => uc.userId === userId);
    return HttpResponse.json({ userChallenges });
  }),

  // XP関連API
  http.post('/api/xp/add', async ({ request }) => {
    const { amount, reason, sourceType, sourceId } = await request.json() as {
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
      sourceType: sourceType as 'routine' | 'mission' | 'achievement' | 'challenge' | 'bonus',
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

    return HttpResponse.json({ 
      xpTransaction, 
      profile: updatedProfile,
      levelUp: newTotalXP >= mockUserProfile.totalXP + mockUserProfile.nextLevelXP - mockUserProfile.currentXP
    });
  }),

  // 通知関連API
  http.get('/api/notifications', () => {
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

    return HttpResponse.json({ notifications: mockNotifications });
  }),

  http.put('/api/notifications/:id/read', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({ success: true, notificationId: id });
  })
];