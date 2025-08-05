import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';
import { db } from '../index';
import { executionRecords, routines } from '../schema';
import type { ExecutionRecord } from '../../../types/routine';

export async function createExecutionRecord(
  userId: string,
  record: Omit<ExecutionRecord, 'id'>
): Promise<ExecutionRecord> {
  const [result] = await db
    .insert(executionRecords)
    .values({
      userId,
      routineId: record.routineId,
      executedAt: record.executedAt,
      duration: record.duration,
      memo: record.memo,
      isCompleted: record.isCompleted,
    })
    .returning();

  return {
    id: result.id,
    routineId: result.routineId,
    executedAt: result.executedAt,
    duration: result.duration || undefined,
    memo: result.memo || undefined,
    isCompleted: result.isCompleted,
  };
}

export async function getUserExecutionRecords(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ExecutionRecord[]> {
  let query = db
    .select()
    .from(executionRecords)
    .where(eq(executionRecords.userId, userId));

  if (startDate && endDate) {
    query = query.where(
      and(
        eq(executionRecords.userId, userId),
        gte(executionRecords.executedAt, startDate),
        lte(executionRecords.executedAt, endDate)
      )
    );
  }

  const result = await query.orderBy(desc(executionRecords.executedAt));

  return result.map(r => ({
    id: r.id,
    routineId: r.routineId,
    executedAt: r.executedAt,
    duration: r.duration || undefined,
    memo: r.memo || undefined,
    isCompleted: r.isCompleted,
  }));
}

export async function getRoutineExecutionRecords(
  userId: string,
  routineId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ExecutionRecord[]> {
  let query = db
    .select()
    .from(executionRecords)
    .where(
      and(
        eq(executionRecords.userId, userId),
        eq(executionRecords.routineId, routineId)
      )
    );

  if (startDate && endDate) {
    query = query.where(
      and(
        eq(executionRecords.userId, userId),
        eq(executionRecords.routineId, routineId),
        gte(executionRecords.executedAt, startDate),
        lte(executionRecords.executedAt, endDate)
      )
    );
  }

  const result = await query.orderBy(desc(executionRecords.executedAt));

  return result.map(r => ({
    id: r.id,
    routineId: r.routineId,
    executedAt: r.executedAt,
    duration: r.duration || undefined,
    memo: r.memo || undefined,
    isCompleted: r.isCompleted,
  }));
}

export async function updateExecutionRecord(
  userId: string,
  recordId: string,
  updates: Partial<Omit<ExecutionRecord, 'id' | 'routineId'>>
): Promise<ExecutionRecord | null> {
  const [result] = await db
    .update(executionRecords)
    .set(updates)
    .where(
      and(
        eq(executionRecords.id, recordId),
        eq(executionRecords.userId, userId)
      )
    )
    .returning();

  if (!result) return null;

  return {
    id: result.id,
    routineId: result.routineId,
    executedAt: result.executedAt,
    duration: result.duration || undefined,
    memo: result.memo || undefined,
    isCompleted: result.isCompleted,
  };
}

export async function deleteExecutionRecord(userId: string, recordId: string): Promise<boolean> {
  const result = await db
    .delete(executionRecords)
    .where(
      and(
        eq(executionRecords.id, recordId),
        eq(executionRecords.userId, userId)
      )
    );

  return result.rowCount > 0;
}