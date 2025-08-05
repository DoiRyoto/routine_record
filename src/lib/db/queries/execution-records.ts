import { db } from '../index';
import { executionRecords, routines } from '../schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import type { InsertExecutionRecord } from '../schema';

// 実行記録一覧を取得
export async function getExecutionRecords(userId: string) {
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
    .where(eq(executionRecords.userId, userId))
    .orderBy(desc(executionRecords.executedAt));
}

// 特定のルーチンの実行記録を取得
export async function getExecutionRecordsByRoutineId(routineId: string, userId: string) {
  return await db
    .select()
    .from(executionRecords)
    .where(and(eq(executionRecords.routineId, routineId), eq(executionRecords.userId, userId)))
    .orderBy(desc(executionRecords.executedAt));
}

// 日付範囲で実行記録を取得
export async function getExecutionRecordsByDateRange(startDate: Date, endDate: Date, userId: string) {
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
        lte(executionRecords.executedAt, endDate)
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
  const result = await db.update(executionRecords).set(updates).where(eq(executionRecords.id, id)).returning();
  return result[0];
}

// 実行記録を削除
export async function deleteExecutionRecord(id: string) {
  await db.delete(executionRecords).where(eq(executionRecords.id, id));
}