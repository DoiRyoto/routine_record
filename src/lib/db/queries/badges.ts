import { eq } from 'drizzle-orm';

import { db } from '../index';
import {
  badges,
  type Badge,
  type InsertBadge,
} from '../schema';

// 全バッジ取得
export async function getAllBadges(): Promise<Badge[]> {
  try {
    const badgeList = await db
      .select()
      .from(badges)
      .orderBy(badges.createdAt);

    return badgeList;
  } catch (error) {
    console.error('Failed to get all badges:', error);
    throw new Error('バッジ一覧の取得に失敗しました');
  }
}

// カテゴリ別バッジ取得
export async function getBadgesByCategory(category: string): Promise<Badge[]> {
  try {
    const badgeList = await db
      .select()
      .from(badges)
      .where(eq(badges.category, category))
      .orderBy(badges.createdAt);

    return badgeList;
  } catch (error) {
    console.error('Failed to get badges by category:', error);
    throw new Error('カテゴリ別バッジの取得に失敗しました');
  }
}

// バッジ作成
export async function createBadge(badgeData: InsertBadge): Promise<Badge> {
  try {
    const [newBadge] = await db
      .insert(badges)
      .values(badgeData)
      .returning();

    return newBadge;
  } catch (error) {
    console.error('Failed to create badge:', error);
    throw new Error('バッジの作成に失敗しました');
  }
}

// バッジ更新
export async function updateBadge(
  id: string,
  updates: Partial<Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Badge> {
  try {
    const [updatedBadge] = await db
      .update(badges)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(badges.id, id))
      .returning();

    if (!updatedBadge) {
      throw new Error('バッジが見つかりません');
    }

    return updatedBadge;
  } catch (error) {
    console.error('Failed to update badge:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('バッジの更新に失敗しました');
  }
}

// バッジ削除
export async function deleteBadge(id: string): Promise<void> {
  try {
    const result = await db
      .delete(badges)
      .where(eq(badges.id, id));

    if (result.count === 0) {
      throw new Error('バッジが見つかりません');
    }
  } catch (error) {
    console.error('Failed to delete badge:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('バッジの削除に失敗しました');
  }
}

// バッジID取得
export async function getBadgeById(id: string): Promise<Badge | null> {
  try {
    const [badge] = await db
      .select()
      .from(badges)
      .where(eq(badges.id, id))
      .limit(1);

    return badge || null;
  } catch (error) {
    console.error('Failed to get badge by id:', error);
    throw new Error('バッジの取得に失敗しました');
  }
}