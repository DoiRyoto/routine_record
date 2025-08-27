import { eq, desc, and, sql } from 'drizzle-orm';

import { db } from '../index';
import type {
  UserProfile,
  UserBadge,
  Badge,
  XPTransaction,
  InsertUserProfile,
  InsertUserBadge,
  InsertXPTransaction,
} from '../schema';
import {
  userProfiles,
  userBadges,
  badges,
  xpTransactions,
  users
} from '../schema';

// ユーザープロフィール取得
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    return profile || null;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    throw new Error('ユーザープロフィールの取得に失敗しました');
  }
}

// ユーザープロフィール作成
export async function createUserProfile(profileData: InsertUserProfile): Promise<UserProfile> {
  try {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profileData)
      .returning();

    return newProfile;
  } catch (error) {
    console.error('Failed to create user profile:', error);
    throw new Error('ユーザープロフィールの作成に失敗しました');
  }
}

// ユーザープロフィール更新
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UserProfile> {
  try {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.userId, userId))
      .returning();

    return updatedProfile;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw new Error('ユーザープロフィールの更新に失敗しました');
  }
}

// ユーザーバッジ一覧取得（バッジ詳細も含む）
export async function getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
  try {
    const userBadgeList = await db
      .select({
        id: userBadges.id,
        userId: userBadges.userId,
        badgeId: userBadges.badgeId,
        unlockedAt: userBadges.unlockedAt,
        isNew: userBadges.isNew,
        createdAt: userBadges.createdAt,
        badge: {
          id: badges.id,
          name: badges.name,
          description: badges.description,
          iconUrl: badges.iconUrl,
          rarity: badges.rarity,
          category: badges.category,
          createdAt: badges.createdAt,
          updatedAt: badges.updatedAt
        }
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.unlockedAt));

    return userBadgeList;
  } catch (error) {
    console.error('Failed to get user badges:', error);
    throw new Error('ユーザーバッジの取得に失敗しました');
  }
}

// バッジ付与
export async function awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
  try {
    // すでに持っているかチェック
    const existingBadge = await db
      .select()
      .from(userBadges)
      .where(and(
        eq(userBadges.userId, userId),
        eq(userBadges.badgeId, badgeId)
      ))
      .limit(1);

    if (existingBadge.length > 0) {
      throw new Error('このバッジは既に取得済みです');
    }

    // バッジが存在するかチェック
    const [badge] = await db
      .select()
      .from(badges)
      .where(eq(badges.id, badgeId))
      .limit(1);

    if (!badge) {
      throw new Error('指定されたバッジが見つかりません');
    }

    // バッジを付与
    const [newUserBadge] = await db
      .insert(userBadges)
      .values({
        userId,
        badgeId,
        isNew: true
      })
      .returning();

    return newUserBadge;
  } catch (error) {
    console.error('Failed to award badge:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('バッジの付与に失敗しました');
  }
}

// バッジの新着フラグを解除
export async function markBadgeAsViewed(userId: string, badgeId: string): Promise<void> {
  try {
    await db
      .update(userBadges)
      .set({ isNew: false })
      .where(and(
        eq(userBadges.userId, userId),
        eq(userBadges.badgeId, badgeId)
      ));
  } catch (error) {
    console.error('Failed to mark badge as viewed:', error);
    throw new Error('バッジの既読処理に失敗しました');
  }
}

// XP追加とレベルアップ処理
export async function addXP(
  userId: string,
  amount: number,
  reason: string,
  sourceType: 'routine_completion' | 'streak_bonus' | 'mission_completion' | 'challenge_completion' | 'daily_bonus' | 'achievement_unlock',
  sourceId?: string
): Promise<{ newLevel: number; leveledUp: boolean; newTotalXP: number }> {
  try {
    // 現在のプロフィール取得
    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('ユーザープロフィールが見つかりません');
    }

    // XPトランザクション記録
    await db.insert(xpTransactions).values({
      userId,
      amount,
      reason,
      sourceType,
      sourceId
    });

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
    await updateUserProfile(userId, {
      level,
      totalXP: newTotalXP,
      currentXP,
      nextLevelXP,
      lastActiveAt: new Date()
    });

    return {
      newLevel: level,
      leveledUp,
      newTotalXP
    };
  } catch (error) {
    console.error('Failed to add XP:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('XPの追加に失敗しました');
  }
}

// XP履歴取得
export async function getXPHistory(userId: string, limit = 50): Promise<XPTransaction[]> {
  try {
    const transactions = await db
      .select()
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, userId))
      .orderBy(desc(xpTransactions.createdAt))
      .limit(limit);

    return transactions;
  } catch (error) {
    console.error('Failed to get XP history:', error);
    throw new Error('XP履歴の取得に失敗しました');
  }
}

// ストリーク更新
export async function updateStreak(userId: string, newStreak: number): Promise<UserProfile> {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('ユーザープロフィールが見つかりません');
    }

    const longestStreak = Math.max(profile.longestStreak, newStreak);

    const updatedProfile = await updateUserProfile(userId, {
      streak: newStreak,
      longestStreak,
      lastActiveAt: new Date()
    });

    return updatedProfile;
  } catch (error) {
    console.error('Failed to update streak:', error);
    throw new Error('ストリークの更新に失敗しました');
  }
}

// 統計情報の更新
export async function updateUserStats(
  userId: string,
  statsUpdate: {
    totalRoutines?: number;
    totalExecutions?: number;
  }
): Promise<UserProfile> {
  try {
    const updatedProfile = await updateUserProfile(userId, {
      ...statsUpdate,
      lastActiveAt: new Date()
    });

    return updatedProfile;
  } catch (error) {
    console.error('Failed to update user stats:', error);
    throw new Error('ユーザー統計の更新に失敗しました');
  }
}