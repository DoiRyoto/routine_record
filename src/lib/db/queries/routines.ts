import { db } from '../index';
import { routines } from '../schema';
import { eq, and, desc } from 'drizzle-orm';
import type { InsertRoutine } from '../schema';

// ルーチン一覧を取得
export async function getRoutines(userId: string) {
  return await db.select().from(routines)
    .where(and(eq(routines.userId, userId), eq(routines.isActive, true)))
    .orderBy(desc(routines.createdAt));
}

// ルーチンをIDで取得
export async function getRoutineById(id: string) {
  const result = await db.select().from(routines).where(eq(routines.id, id)).limit(1);
  return result[0] || null;
}

// ルーチンを作成
export async function createRoutine(routine: InsertRoutine) {
  const result = await db.insert(routines).values(routine).returning();
  return result[0];
}

// ルーチンを更新
export async function updateRoutine(id: string, updates: Partial<InsertRoutine>) {
  const result = await db.update(routines).set(updates).where(eq(routines.id, id)).returning();
  return result[0];
}

// ルーチンを削除
export async function deleteRoutine(id: string) {
  await db.update(routines).set({ isActive: false }).where(eq(routines.id, id));
}