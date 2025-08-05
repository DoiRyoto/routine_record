import { eq, and, desc } from 'drizzle-orm';
import { db } from '../index';
import { routines, executionRecords } from '../schema';
import type { Routine } from '../../../types/routine';

export async function getUserRoutines(userId: string): Promise<Routine[]> {
  const result = await db
    .select()
    .from(routines)
    .where(and(eq(routines.userId, userId), eq(routines.isActive, true)))
    .orderBy(desc(routines.createdAt));

  return result.map(r => ({
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category,
    targetFrequency: r.targetFrequency as 'daily' | 'weekly' | 'monthly',
    targetCount: r.targetCount || undefined,
    createdAt: r.createdAt,
    isActive: r.isActive,
  }));
}

export async function createRoutine(userId: string, routine: Omit<Routine, 'id' | 'createdAt'>): Promise<Routine> {
  const [result] = await db
    .insert(routines)
    .values({
      userId,
      name: routine.name,
      description: routine.description,
      category: routine.category,
      targetFrequency: routine.targetFrequency,
      targetCount: routine.targetCount,
      isActive: routine.isActive,
    })
    .returning();

  return {
    id: result.id,
    name: result.name,
    description: result.description,
    category: result.category,
    targetFrequency: result.targetFrequency as 'daily' | 'weekly' | 'monthly',
    targetCount: result.targetCount || undefined,
    createdAt: result.createdAt,
    isActive: result.isActive,
  };
}

export async function updateRoutine(userId: string, routineId: string, updates: Partial<Omit<Routine, 'id' | 'createdAt'>>): Promise<Routine | null> {
  const [result] = await db
    .update(routines)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(routines.id, routineId), eq(routines.userId, userId)))
    .returning();

  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    description: result.description,
    category: result.category,
    targetFrequency: result.targetFrequency as 'daily' | 'weekly' | 'monthly',
    targetCount: result.targetCount || undefined,
    createdAt: result.createdAt,
    isActive: result.isActive,
  };
}

export async function deleteRoutine(userId: string, routineId: string): Promise<boolean> {
  const [result] = await db
    .update(routines)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(routines.id, routineId), eq(routines.userId, userId)))
    .returning();

  return !!result;
}