import { db } from '../index';
import { userSettings } from '../schema';
import { eq } from 'drizzle-orm';
import type { InsertUserSetting } from '../schema';

// ユーザー設定を取得
export async function getUserSettings(userId: string) {
  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  return result[0] || null;
}

// ユーザー設定を作成
export async function createUserSettings(settings: InsertUserSetting) {
  const result = await db.insert(userSettings).values(settings).returning();
  return result[0];
}

// ユーザー設定を更新
export async function updateUserSettings(userId: string, updates: Partial<InsertUserSetting>) {
  const result = await db
    .update(userSettings)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(userSettings.userId, userId))
    .returning();
  return result[0];
}

// ユーザー設定を取得または作成
export async function getOrCreateUserSettings(userId: string) {
  let settings = await getUserSettings(userId);
  
  if (!settings) {
    settings = await createUserSettings({
      userId,
      theme: 'auto',
      language: 'ja',
      timeFormat: '24h',
      dailyGoal: 3,
      weeklyGoal: 21,
      monthlyGoal: 90,
    });
  }
  
  return settings;
}