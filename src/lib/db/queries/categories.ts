import { and, desc, eq } from 'drizzle-orm';

import { db } from '../index';
import { categories, type Category, type InsertCategory } from '../schema';

// ユーザーのカテゴリを全て取得
export async function getUserCategories(userId: string): Promise<Category[]> {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(desc(categories.isDefault), categories.name);

  return result;
}

// アクティブなカテゴリのみ取得
export async function getActiveUserCategories(userId: string): Promise<Category[]> {
  const result = await db
    .select()
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.isActive, true)))
    .orderBy(desc(categories.isDefault), categories.name);

  return result;
}

// カテゴリを作成
export async function createCategory(
  category: Omit<InsertCategory, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Category> {
  const result = await db
    .insert(categories)
    .values({
      ...category,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result[0];
}

// カテゴリを更新
export async function updateCategory(
  categoryId: string,
  updates: Partial<Pick<Category, 'name' | 'color' | 'isActive'>>
): Promise<Category | null> {
  const result = await db
    .update(categories)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, categoryId))
    .returning();

  return result[0] || null;
}

// カテゴリを削除（ソフトデリート）
export async function deleteCategory(categoryId: string): Promise<void> {
  await db
    .update(categories)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, categoryId));
}

// カテゴリを完全削除
export async function hardDeleteCategory(categoryId: string): Promise<void> {
  await db.delete(categories).where(eq(categories.id, categoryId));
}

// ユーザーのカテゴリ名一覧を取得（CategorySelectorで使用）
export async function getUserCategoryNames(userId: string): Promise<string[]> {
  const result = await db
    .select({ name: categories.name })
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.isActive, true)))
    .orderBy(desc(categories.isDefault), categories.name);

  return result.map((r) => r.name);
}
