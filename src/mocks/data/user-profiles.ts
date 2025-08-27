import type { UserProfile, UserBadge, Badge, XPTransaction } from '@/lib/db/schema';

// モックバッジデータ
export const mockBadges: Badge[] = [
  {
    id: 'badge1',
    name: '習慣マスター',
    description: '10個のルーティンを完了',
    iconUrl: '/badges/habit-master.png',
    rarity: 'rare',
    category: '実績',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'badge2',
    name: 'ストリークキング',
    description: '30日連続実行',
    iconUrl: '/badges/streak-king.png',
    rarity: 'epic',
    category: 'ストリーク',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'badge3',
    name: '伝説の継続者',
    description: '100日連続実行',
    iconUrl: '/badges/legendary-streak.png',
    rarity: 'legendary',
    category: 'ストリーク',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockUserBadges: (UserBadge & { badge: Badge })[] = [
  {
    id: '1',
    userId: 'user1',
    badgeId: 'badge1',
    unlockedAt: new Date(),
    isNew: true,
    createdAt: new Date(),
    badge: mockBadges[0],
  },
  {
    id: '2',
    userId: 'user1',
    badgeId: 'badge2',
    unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isNew: false,
    createdAt: new Date(),
    badge: mockBadges[1],
  },
  {
    id: '3',
    userId: 'user1',
    badgeId: 'badge3',
    unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isNew: false,
    createdAt: new Date(),
    badge: mockBadges[2],
  }
];

export const mockUserProfiles: UserProfile[] = [
  {
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockXPTransactions: XPTransaction[] = [
  {
    id: 'xp-1',
    userId: 'user1',
    amount: 50,
    reason: '朝のルーティン完了',
    sourceType: 'routine_completion',
    sourceId: 'routine-1',
    createdAt: new Date(),
  },
  {
    id: 'xp-2',
    userId: 'user1',
    amount: 100,
    reason: '7日ストリーク達成',
    sourceType: 'streak_bonus',
    sourceId: 'streak-7',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

// Mock関数 - lib/db/queries/user-profiles.ts に対応
export const getMockUserProfile = (userId: string): UserProfile | null => {
  return mockUserProfiles.find(p => p.userId === userId) || null;
};

export const mockCreateUserProfile = (profileData: Omit<UserProfile, 'createdAt' | 'updatedAt'>): UserProfile => {
  const newProfile: UserProfile = {
    ...profileData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockUserProfiles.push(newProfile);
  return newProfile;
};

export const mockUpdateUserProfile = (
  userId: string, 
  updates: Partial<Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>>
): UserProfile => {
  const profile = mockUserProfiles.find(p => p.userId === userId);
  if (!profile) {
    throw new Error('ユーザープロフィールが見つかりません');
  }
  
  Object.assign(profile, updates, { updatedAt: new Date() });
  return profile;
};

export const getMockUserBadges = (userId: string): (UserBadge & { badge: Badge })[] => {
  return mockUserBadges.filter(ub => ub.userId === userId);
};

export const mockAwardBadge = (userId: string, badgeId: string): UserBadge => {
  // すでに持っているかチェック
  const existingBadge = mockUserBadges.find(ub => 
    ub.userId === userId && ub.badgeId === badgeId
  );
  
  if (existingBadge) {
    throw new Error('このバッジは既に取得済みです');
  }
  
  const badge = mockBadges.find(b => b.id === badgeId);
  if (!badge) {
    throw new Error('指定されたバッジが見つかりません');
  }
  
  const newUserBadge: UserBadge & { badge: Badge } = {
    id: `user-badge-${userId}-${badgeId}-${Date.now()}`,
    userId,
    badgeId,
    unlockedAt: new Date(),
    isNew: true,
    createdAt: new Date(),
    badge,
  };
  
  mockUserBadges.push(newUserBadge);
  return newUserBadge;
};

export const mockMarkBadgeAsViewed = (userId: string, badgeId: string): void => {
  const userBadge = mockUserBadges.find(ub => 
    ub.userId === userId && ub.badgeId === badgeId
  );
  
  if (userBadge) {
    userBadge.isNew = false;
  }
};

export const mockAddXP = (
  userId: string,
  amount: number,
  reason: string,
  sourceType: 'routine_completion' | 'streak_bonus' | 'mission_completion' | 'challenge_completion' | 'daily_bonus' | 'achievement_unlock',
  sourceId?: string
): { newLevel: number; leveledUp: boolean; newTotalXP: number } => {
  const profile = mockUserProfiles.find(p => p.userId === userId);
  if (!profile) {
    throw new Error('ユーザープロフィールが見つかりません');
  }
  
  // XPトランザクション記録
  const xpTransaction: XPTransaction = {
    id: `xp-${Date.now()}`,
    userId,
    amount,
    reason,
    sourceType,
    sourceId: sourceId || null,
    createdAt: new Date(),
  };
  mockXPTransactions.push(xpTransaction);
  
  // 新しいXPを計算
  const newTotalXP = profile.totalXP + amount;
  const newCurrentXP = profile.currentXP + amount;
  
  // レベルアップ計算（100XPごとにレベルアップ）
  let level = profile.level;
  let currentXP = newCurrentXP;
  let nextLevelXP = profile.nextLevelXP;
  let leveledUp = false;
  
  while (currentXP >= nextLevelXP) {
    currentXP -= nextLevelXP;
    level += 1;
    leveledUp = true;
    // 次のレベルに必要なXPを計算（レベルが上がるほど必要XPが増加）
    nextLevelXP = Math.floor(100 * Math.pow(1.1, level - 1));
  }
  
  // プロフィール更新
  profile.level = level;
  profile.totalXP = newTotalXP;
  profile.currentXP = currentXP;
  profile.nextLevelXP = nextLevelXP;
  profile.lastActiveAt = new Date();
  profile.updatedAt = new Date();
  
  return {
    newLevel: level,
    leveledUp,
    newTotalXP
  };
};

export const getMockXPHistory = (userId: string, limit = 50): XPTransaction[] => {
  return mockXPTransactions
    .filter(tx => tx.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
};

export const mockUpdateStreak = (userId: string, newStreak: number): UserProfile => {
  const profile = mockUserProfiles.find(p => p.userId === userId);
  if (!profile) {
    throw new Error('ユーザープロフィールが見つかりません');
  }
  
  const longestStreak = Math.max(profile.longestStreak, newStreak);
  
  profile.streak = newStreak;
  profile.longestStreak = longestStreak;
  profile.lastActiveAt = new Date();
  profile.updatedAt = new Date();
  
  return profile;
};

export const mockUpdateUserStats = (
  userId: string,
  statsUpdate: {
    totalRoutines?: number;
    totalExecutions?: number;
  }
): UserProfile => {
  const profile = mockUserProfiles.find(p => p.userId === userId);
  if (!profile) {
    throw new Error('ユーザープロフィールが見つかりません');
  }
  
  if (statsUpdate.totalRoutines !== undefined) {
    profile.totalRoutines = statsUpdate.totalRoutines;
  }
  if (statsUpdate.totalExecutions !== undefined) {
    profile.totalExecutions = statsUpdate.totalExecutions;
  }
  
  profile.lastActiveAt = new Date();
  profile.updatedAt = new Date();
  
  return profile;
};