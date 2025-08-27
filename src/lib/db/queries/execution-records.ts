import { and, desc, eq, gte, isNull, lte } from 'drizzle-orm';

import type { ExecutionRecord } from '@/lib/db/schema';

import { db } from '../index';
import { executionRecords, routines, type InsertExecutionRecord } from '../schema';

// データベースから取得した生データをExecutionRecord型に変換
function transformExecutionRecord(rawRecord: {
  id: string;
  routineId: string;
  executedAt: Date | string;
  duration: number | null;
  memo: string | null;
  isCompleted: boolean;
  routineName?: string | null;
}): ExecutionRecord {
  return {
    ...rawRecord,
    executedAt:
      rawRecord.executedAt instanceof Date ? rawRecord.executedAt : new Date(rawRecord.executedAt),
  };
}

// 実行記録一覧を取得（ソフトデリートされていないルーチンのもののみ）
export async function getExecutionRecords(userId: string): Promise<ExecutionRecord[]> {
  const rawRecords = await db
    .select({
      id: executionRecords.id,
      routineId: executionRecords.routineId,
      executedAt: executionRecords.executedAt,
      duration: executionRecords.duration,
      memo: executionRecords.memo,
      isCompleted: executionRecords.isCompleted,
      routineName: routines.name,
    })
    .from(executionRecords)
    .leftJoin(routines, eq(executionRecords.routineId, routines.id))
    .where(
      and(
        eq(executionRecords.userId, userId),
        isNull(routines.deletedAt) // ソフトデリートされていないルーチンのみ
      )
    )
    .orderBy(desc(executionRecords.executedAt));

  return rawRecords.map(transformExecutionRecord);
}

// 特定のルーチンの実行記録を取得（ソフトデリートされていない場合のみ）
export async function getExecutionRecordsByRoutineId(routineId: string, userId: string) {
  return await db
    .select({
      id: executionRecords.id,
      routineId: executionRecords.routineId,
      userId: executionRecords.userId,
      executedAt: executionRecords.executedAt,
      duration: executionRecords.duration,
      memo: executionRecords.memo,
      isCompleted: executionRecords.isCompleted,
      createdAt: executionRecords.createdAt,
      updatedAt: executionRecords.updatedAt,
    })
    .from(executionRecords)
    .leftJoin(routines, eq(executionRecords.routineId, routines.id))
    .where(
      and(
        eq(executionRecords.routineId, routineId),
        eq(executionRecords.userId, userId),
        isNull(routines.deletedAt) // ソフトデリートされていないルーチンのみ
      )
    )
    .orderBy(desc(executionRecords.executedAt));
}

// 日付範囲で実行記録を取得（ソフトデリートされていないルーチンのもののみ）
export async function getExecutionRecordsByDateRange(
  startDate: Date,
  endDate: Date,
  userId: string
) {
  return await db
    .select({
      id: executionRecords.id,
      routineId: executionRecords.routineId,
      executedAt: executionRecords.executedAt,
      duration: executionRecords.duration,
      memo: executionRecords.memo,
      isCompleted: executionRecords.isCompleted,
      routineName: routines.name,
    })
    .from(executionRecords)
    .leftJoin(routines, eq(executionRecords.routineId, routines.id))
    .where(
      and(
        eq(executionRecords.userId, userId),
        gte(executionRecords.executedAt, startDate),
        lte(executionRecords.executedAt, endDate),
        isNull(routines.deletedAt) // ソフトデリートされていないルーチンのみ
      )
    )
    .orderBy(desc(executionRecords.executedAt));
}

// 実行記録を作成
export async function createExecutionRecord(record: InsertExecutionRecord) {
  const result = await db.insert(executionRecords).values(record).returning();
  return result[0];
}

// 実行記録を更新
export async function updateExecutionRecord(id: string, updates: Partial<InsertExecutionRecord>) {
  const result = await db
    .update(executionRecords)
    .set(updates)
    .where(eq(executionRecords.id, id))
    .returning();
  return result[0];
}

// 実行記録を削除
export async function deleteExecutionRecord(id: string) {
  await db.delete(executionRecords).where(eq(executionRecords.id, id));
}
