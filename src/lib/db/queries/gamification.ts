import { eq, desc, asc, and, sql, count, gte, lte, isNull } from 'drizzle-orm';

import { db } from '../index';
import type {
  Mission,
  UserMission,
  Badge,
  UserBadge,
  GameNotification,
  InsertMission,
  InsertUserMission,
  InsertBadge,
  InsertGameNotification,
} from '../schema';
import {
  missions,
  userMissions,
  badges,
  userBadges,
  gameNotifications,
  userProfiles,
  executionRecords
} from '../schema';

// === MISSIONS ===

// アクティブなミッション一覧取得
export async function getActiveMissions(): Promise<Mission[]> {
  try {
    const missionList = await db
      .select()
      .from(missions)
      .where(eq(missions.isActive, true))
      .orderBy(asc(missions.difficulty), desc(missions.createdAt));

    return missionList;
  } catch (error) {
    console.error('Failed to get active missions:', error);
    throw new Error('ミッション一覧の取得に失敗しました');
  }
}

// ユーザーのミッション進捗取得
export async function getUserMissions(userId: string): Promise<(UserMission & { mission: Mission })[]> {
  try {
    const userMissionList = await db
      .select({
        id: userMissions.id,
        userId: userMissions.userId,
        missionId: userMissions.missionId,
        progress: userMissions.progress,
        isCompleted: userMissions.isCompleted,
        startedAt: userMissions.startedAt,
        completedAt: userMissions.completedAt,
        claimedAt: userMissions.claimedAt,
        createdAt: userMissions.createdAt,
        updatedAt: userMissions.updatedAt,
        mission: {
          id: missions.id,
          title: missions.title,
          description: missions.description,
          type: missions.type,
          targetValue: missions.targetValue,
          xpReward: missions.xpReward,
          badgeId: missions.badgeId,
          difficulty: missions.difficulty,
          isActive: missions.isActive,
          createdAt: missions.createdAt,
          updatedAt: missions.updatedAt
        }
      })
      .from(userMissions)
      .innerJoin(missions, eq(userMissions.missionId, missions.id))
      .where(eq(userMissions.userId, userId))
      .orderBy(desc(userMissions.startedAt));

    return userMissionList;
  } catch (error) {
    console.error('Failed to get user missions:', error);
    throw new Error('ユーザーミッションの取得に失敗しました');
  }
}

// ミッション開始
export async function startMission(userId: string, missionId: string): Promise<UserMission> {
  try {
    // すでに開始しているかチェック
    const existingUserMission = await db
      .select()
      .from(userMissions)
      .where(and(
        eq(userMissions.userId, userId),
        eq(userMissions.missionId, missionId)
      ))
      .limit(1);

    if (existingUserMission.length > 0) {
      throw new Error('このミッションは既に開始済みです');
    }

    // ミッションが存在し、アクティブかチェック
    const [mission] = await db
      .select()
      .from(missions)
      .where(and(
        eq(missions.id, missionId),
        eq(missions.isActive, true)
      ))
      .limit(1);

    if (!mission) {
      throw new Error('ミッションが見つからないか、利用できません');
    }

    // ミッション開始
    const [newUserMission] = await db
      .insert(userMissions)
      .values({
        userId,
        missionId,
        progress: 0,
        isCompleted: false
      })
      .returning();

    return newUserMission;
  } catch (error) {
    console.error('Failed to start mission:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('ミッションの開始に失敗しました');
  }
}

// ミッション進捗更新
export async function updateMissionProgress(
  userId: string,
  missionId: string,
  progress: number
): Promise<UserMission> {
  try {
    const [updatedUserMission] = await db
      .update(userMissions)
      .set({
        progress,
        updatedAt: new Date(),
        ...(progress >= 100 ? { isCompleted: true, completedAt: new Date() } : {})
      })
      .where(and(
        eq(userMissions.userId, userId),
        eq(userMissions.missionId, missionId)
      ))
      .returning();

    return updatedUserMission;
  } catch (error) {
    console.error('Failed to update mission progress:', error);
    throw new Error('ミッション進捗の更新に失敗しました');
  }
}

// ミッション報酬受け取り
export async function claimMissionReward(userId: string, missionId: string): Promise<UserMission> {
  try {
    const [updatedUserMission] = await db
      .update(userMissions)
      .set({
        claimedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(userMissions.userId, userId),
        eq(userMissions.missionId, missionId),
        eq(userMissions.isCompleted, true),
        isNull(userMissions.claimedAt)
      ))
      .returning();

    if (!updatedUserMission) {
      throw new Error('報酬を受け取れません');
    }

    return updatedUserMission;
  } catch (error) {
    console.error('Failed to claim mission reward:', error);
    throw new Error('ミッション報酬の受け取りに失敗しました');
  }
}

// === BADGES ===

// 全バッジ一覧取得
export async function getAllBadges(): Promise<Badge[]> {
  try {
    const badgeList = await db
      .select()
      .from(badges)
      .orderBy(badges.rarity, desc(badges.createdAt));

    return badgeList;
  } catch (error) {
    console.error('Failed to get all badges:', error);
    throw new Error('バッジ一覧の取得に失敗しました');
  }
}

// バッジ作成（管理者用）
export async function createBadge(badgeData: InsertBadge): Promise<Badge> {
  try {
    const [newBadge] = await db
      .insert(badges)
      .values(badgeData)
      .returning();

    return newBadge;
  } catch (error) {
    console.error('Failed to create badge:', error);
    throw new Error('バッジの作成に失敗しました');
  }
}

// === NOTIFICATIONS ===

// ユーザー通知一覧取得
export async function getUserNotifications(userId: string, limit = 50): Promise<GameNotification[]> {
  try {
    const notificationList = await db
      .select()
      .from(gameNotifications)
      .where(eq(gameNotifications.userId, userId))
      .orderBy(desc(gameNotifications.createdAt))
      .limit(limit);

    return notificationList;
  } catch (error) {
    console.error('Failed to get user notifications:', error);
    throw new Error('通知一覧の取得に失敗しました');
  }
}

// 通知作成
export async function createNotification(notificationData: InsertGameNotification): Promise<GameNotification> {
  try {
    const [newNotification] = await db
      .insert(gameNotifications)
      .values(notificationData)
      .returning();

    return newNotification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw new Error('通知の作成に失敗しました');
  }
}

// 通知を既読にする
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await db
      .update(gameNotifications)
      .set({ isRead: true })
      .where(eq(gameNotifications.id, notificationId));
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw new Error('通知の既読処理に失敗しました');
  }
}

// ユーザーの未読通知数取得
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const [{ count: unreadCount }] = await db
      .select({ count: count() })
      .from(gameNotifications)
      .where(and(
        eq(gameNotifications.userId, userId),
        eq(gameNotifications.isRead, false)
      ));

    return unreadCount;
  } catch (error) {
    console.error('Failed to get unread notification count:', error);
    throw new Error('未読通知数の取得に失敗しました');
  }
}

// === STATISTICS ===

// ユーザーの統計情報取得
export async function getUserStats(userId: string) {
  try {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      throw new Error('ユーザープロフィールが見つかりません');
    }

    // 今日の実行回数
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [{ todayExecutions }] = await db
      .select({ todayExecutions: count() })
      .from(executionRecords)
      .where(and(
        eq(executionRecords.userId, userId),
        gte(executionRecords.executedAt, today),
        lte(executionRecords.executedAt, tomorrow)
      ));

    // 今週の実行回数
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [{ weekExecutions }] = await db
      .select({ weekExecutions: count() })
      .from(executionRecords)
      .where(and(
        eq(executionRecords.userId, userId),
        gte(executionRecords.executedAt, weekStart),
        lte(executionRecords.executedAt, weekEnd)
      ));

    // 完了したミッション数
    const [{ completedMissions }] = await db
      .select({ completedMissions: count() })
      .from(userMissions)
      .where(and(
        eq(userMissions.userId, userId),
        eq(userMissions.isCompleted, true)
      ));

    // 獲得バッジ数
    const [{ totalBadges }] = await db
      .select({ totalBadges: count() })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    return {
      ...profile,
      todayExecutions,
      weekExecutions,
      completedMissions,
      totalBadges
    };
  } catch (error) {
    console.error('Failed to get user stats:', error);
    throw new Error('ユーザー統計の取得に失敗しました');
  }
}

// === STREAK DATA ===

// ストリークデータ取得
export async function getStreakData(userId: string) {
  try {
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      throw new Error('ユーザープロフィールが見つかりません');
    }

    // 最後の実行日取得
    const [lastExecution] = await db
      .select({ executedAt: executionRecords.executedAt })
      .from(executionRecords)
      .where(eq(executionRecords.userId, userId))
      .orderBy(desc(executionRecords.executedAt))
      .limit(1);

    return {
      current: profile[0].streak,
      longest: profile[0].longestStreak,
      lastExecutionDate: lastExecution?.executedAt || null,
      freezesUsed: 0, // TODO: ストリークフリーズ機能実装時に追加
      freezesAvailable: 3 // TODO: ストリークフリーズ機能実装時に追加
    };
  } catch (error) {
    console.error('Failed to get streak data:', error);
    throw new Error('ストリークデータの取得に失敗しました');
  }
}