import { eq } from 'drizzle-orm';

import { db } from '../index';
import { userSettings, users, type InsertUserSetting, type UserSetting } from '../schema';

// ユーザー設定にタイムゾーン情報を含めた型
export type UserSettingWithTimezone = UserSetting & {
  timezone: string | null;
};

// ユーザー設定を取得（タイムゾーン情報を含む）
export async function getUserSettings(userId: string): Promise<UserSettingWithTimezone | null> {
  const result = await db
    .select({
      id: userSettings.id,
      userId: userSettings.userId,
      theme: userSettings.theme,
      language: userSettings.language,
      timeFormat: userSettings.timeFormat,
      dailyGoal: userSettings.dailyGoal,
      weeklyGoal: userSettings.weeklyGoal,
      monthlyGoal: userSettings.monthlyGoal,
      createdAt: userSettings.createdAt,
      updatedAt: userSettings.updatedAt,
      timezone: users.timezone,
    })
    .from(userSettings)
    .leftJoin(users, eq(userSettings.userId, users.id))
    .where(eq(userSettings.userId, userId))
    .limit(1);
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
export async function getOrCreateUserSettings(userId: string): Promise<UserSettingWithTimezone> {
  let settings = await getUserSettings(userId);

  if (!settings) {
    const newSettings = await createUserSettings({
      userId,
      theme: 'auto',
      language: 'ja',
      timeFormat: '24h',
      dailyGoal: 3,
      weeklyGoal: 21,
      monthlyGoal: 90,
    });

    // 新規作成後、タイムゾーン情報も含めて再取得
    settings = await getUserSettings(userId);
    if (!settings) {
      // フォールバック: タイムゾーン情報なしでも動作するように
      return {
        ...newSettings,
        timezone: 'Asia/Tokyo',
      };
    }
  }

  return settings;
}
