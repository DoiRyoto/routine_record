import { eq, and, gte } from 'drizzle-orm';

import { db } from '../index';
import { habits, habitLogs, type InsertHabit, type Habit } from '../schema';

export async function getHabits(userId: string): Promise<Habit[]> {
  return await db.select().from(habits).where(eq(habits.userId, userId));
}

export async function createHabit(habitData: InsertHabit): Promise<Habit> {
  const [newHabit] = await db.insert(habits).values(habitData).returning();
  return newHabit;
}

export async function getHabitLogs(userId: string, habitId?: string) {
  if (habitId) {
    return await db.select().from(habitLogs).where(eq(habitLogs.habitId, habitId));
  }
  
  return await db.select().from(habitLogs);
}

export async function createHabitLog(habitId: string): Promise<void> {
  await db.insert(habitLogs).values({
    habitId,
    doneAt: new Date(),
  });
}

// 今週/今月の実行記録を取得
export async function getHabitLogsForPeriod(habitId: string, startDate: Date) {
  return await db.select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, habitId),
        gte(habitLogs.doneAt, startDate)
      )
    );
}