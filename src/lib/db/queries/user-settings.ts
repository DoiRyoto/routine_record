import { eq } from 'drizzle-orm';
import { db } from '../index';
import { userSettings } from '../schema';
import type { UserSettings } from '../../../types/routine';

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const [result] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId));

  if (!result) return null;

  return {
    displaySettings: {
      theme: result.theme as 'light' | 'dark' | 'auto',
      language: result.language as 'ja' | 'en',
      timeFormat: result.timeFormat as '12h' | '24h',
    },
    goalSettings: {
      dailyGoal: result.dailyGoal,
      weeklyGoal: result.weeklyGoal,
      monthlyGoal: result.monthlyGoal,
    },
  };
}

export async function createUserSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
  const [result] = await db
    .insert(userSettings)
    .values({
      userId,
      theme: settings.displaySettings.theme,
      language: settings.displaySettings.language,
      timeFormat: settings.displaySettings.timeFormat,
      dailyGoal: settings.goalSettings.dailyGoal,
      weeklyGoal: settings.goalSettings.weeklyGoal,
      monthlyGoal: settings.goalSettings.monthlyGoal,
    })
    .returning();

  return {
    displaySettings: {
      theme: result.theme as 'light' | 'dark' | 'auto',
      language: result.language as 'ja' | 'en',
      timeFormat: result.timeFormat as '12h' | '24h',
    },
    goalSettings: {
      dailyGoal: result.dailyGoal,
      weeklyGoal: result.weeklyGoal,
      monthlyGoal: result.monthlyGoal,
    },
  };
}

export async function updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | null> {
  const updateData: any = { updatedAt: new Date() };

  if (updates.displaySettings) {
    if (updates.displaySettings.theme) updateData.theme = updates.displaySettings.theme;
    if (updates.displaySettings.language) updateData.language = updates.displaySettings.language;
    if (updates.displaySettings.timeFormat) updateData.timeFormat = updates.displaySettings.timeFormat;
  }

  if (updates.goalSettings) {
    if (updates.goalSettings.dailyGoal !== undefined) updateData.dailyGoal = updates.goalSettings.dailyGoal;
    if (updates.goalSettings.weeklyGoal !== undefined) updateData.weeklyGoal = updates.goalSettings.weeklyGoal;
    if (updates.goalSettings.monthlyGoal !== undefined) updateData.monthlyGoal = updates.goalSettings.monthlyGoal;
  }

  const [result] = await db
    .update(userSettings)
    .set(updateData)
    .where(eq(userSettings.userId, userId))
    .returning();

  if (!result) return null;

  return {
    displaySettings: {
      theme: result.theme as 'light' | 'dark' | 'auto',
      language: result.language as 'ja' | 'en',
      timeFormat: result.timeFormat as '12h' | '24h',
    },
    goalSettings: {
      dailyGoal: result.dailyGoal,
      weeklyGoal: result.weeklyGoal,
      monthlyGoal: result.monthlyGoal,
    },
  };
}