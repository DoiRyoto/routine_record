import { eq, and, desc } from 'drizzle-orm';

import { db } from '../index';
import {
  userBadges,
  badges,
  type UserBadge,
  type Badge,
} from '../schema';

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

// カテゴリ別ユーザーバッジ取得
export async function getUserBadgesByCategory(userId: string, category: string): Promise<(UserBadge & { badge: Badge })[]> {
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
      .where(and(
        eq(userBadges.userId, userId),
        eq(badges.category, category)
      ))
      .orderBy(desc(userBadges.unlockedAt));

    return userBadgeList;
  } catch (error) {
    console.error('Failed to get user badges by category:', error);
    throw new Error('カテゴリ別ユーザーバッジの取得に失敗しました');
  }
}

// レアリティ別ユーザーバッジ取得
export async function getUserBadgesByRarity(userId: string, rarity: typeof badges.rarity.enumValues[number]): Promise<(UserBadge & { badge: Badge })[]> {
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
      .where(and(
        eq(userBadges.userId, userId),
        eq(badges.rarity, rarity)
      ))
      .orderBy(desc(userBadges.unlockedAt));

    return userBadgeList;
  } catch (error) {
    console.error('Failed to get user badges by rarity:', error);
    throw new Error('レアリティ別ユーザーバッジの取得に失敗しました');
  }
}

// 新着ユーザーバッジ取得
export async function getNewUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
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
      .where(and(
        eq(userBadges.userId, userId),
        eq(userBadges.isNew, true)
      ))
      .orderBy(desc(userBadges.unlockedAt));

    return userBadgeList;
  } catch (error) {
    console.error('Failed to get new user badges:', error);
    throw new Error('新着ユーザーバッジの取得に失敗しました');
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

// 全ての新着フラグを解除
export async function markAllBadgesAsViewed(userId: string): Promise<void> {
  try {
    await db
      .update(userBadges)
      .set({ isNew: false })
      .where(and(
        eq(userBadges.userId, userId),
        eq(userBadges.isNew, true)
      ));
  } catch (error) {
    console.error('Failed to mark all badges as viewed:', error);
    throw new Error('全バッジの既読処理に失敗しました');
  }
}