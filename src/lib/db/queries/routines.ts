import { and, desc, eq, isNull } from 'drizzle-orm';

import type { Routine } from '@/types/routine';

import { db } from '../index';
import { routines, type InsertRoutine } from '../schema';

// データベースから取得した生データをRoutine型に変換
function transformRoutine(rawRoutine: {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string;
  goalType?: 'frequency_based' | 'schedule_based' | null;
  targetCount: number | null;
  targetPeriod?: string | null;
  recurrenceType?: 'daily' | 'weekly' | 'monthly' | 'custom' | null;
  recurrenceInterval?: number | null;
  monthlyType?: 'day_of_month' | 'day_of_week' | null;
  dayOfMonth?: number | null;
  weekOfMonth?: number | null;
  dayOfWeek?: number | null;
  daysOfWeek?: string | null;
  startDate?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  isActive: boolean;
  deletedAt?: Date | string | null;
}): Routine {
  return {
    ...rawRoutine,
    // 新しいフィールドのデフォルト値を設定
    goalType: rawRoutine.goalType || 'schedule_based',
    targetPeriod: rawRoutine.targetPeriod || null,
    recurrenceType: rawRoutine.recurrenceType || 'daily',
    recurrenceInterval: rawRoutine.recurrenceInterval || 1,
    monthlyType: rawRoutine.monthlyType || null,
    dayOfMonth: rawRoutine.dayOfMonth || null,
    weekOfMonth: rawRoutine.weekOfMonth || null,
    dayOfWeek: rawRoutine.dayOfWeek || null,
    daysOfWeek: rawRoutine.daysOfWeek || null,
    startDate: rawRoutine.startDate
      ? rawRoutine.startDate instanceof Date
        ? rawRoutine.startDate
        : new Date(rawRoutine.startDate)
      : null,
    createdAt:
      rawRoutine.createdAt instanceof Date ? rawRoutine.createdAt : new Date(rawRoutine.createdAt),
    updatedAt:
      rawRoutine.updatedAt instanceof Date ? rawRoutine.updatedAt : new Date(rawRoutine.updatedAt),
    deletedAt: rawRoutine.deletedAt
      ? rawRoutine.deletedAt instanceof Date
        ? rawRoutine.deletedAt
        : new Date(rawRoutine.deletedAt)
      : null,
  };
}

// ルーチン一覧を取得（削除されていないもののみ）
export async function getRoutines(userId: string): Promise<Routine[]> {
  const rawRoutines = await db
    .select()
    .from(routines)
    .where(and(eq(routines.userId, userId), isNull(routines.deletedAt)))
    .orderBy(desc(routines.createdAt));

  return rawRoutines.map(transformRoutine);
}

// ルーチンをIDで取得
export async function getRoutineById(id: string): Promise<Routine | null> {
  const result = await db.select().from(routines).where(eq(routines.id, id)).limit(1);
  return result[0] ? transformRoutine(result[0]) : null;
}

// ルーチンを作成
export async function createRoutine(routine: InsertRoutine): Promise<Routine> {
  const result = await db.insert(routines).values(routine).returning();
  return transformRoutine(result[0]);
}

// ルーチンを更新
export async function updateRoutine(id: string, updates: Partial<InsertRoutine>): Promise<Routine> {
  const result = await db.update(routines).set(updates).where(eq(routines.id, id)).returning();

  if (!result || result.length === 0) {
    throw new Error('ルーチンが見つかりません');
  }

  return transformRoutine(result[0]);
}

// ルーチンをソフトデリート
export async function softDeleteRoutine(id: string): Promise<Routine> {
  const result = await db
    .update(routines)
    .set({ deletedAt: new Date() })
    .where(eq(routines.id, id))
    .returning();
  return transformRoutine(result[0]);
}

// ルーチンを復元（ソフトデリートを取り消し）
export async function restoreRoutine(id: string): Promise<Routine> {
  const result = await db
    .update(routines)
    .set({ deletedAt: null })
    .where(eq(routines.id, id))
    .returning();
  return transformRoutine(result[0]);
}

// ルーチンを完全削除（物理削除）- 管理者用
export async function deleteRoutinePermanently(id: string) {
  await db.delete(routines).where(eq(routines.id, id));
}
