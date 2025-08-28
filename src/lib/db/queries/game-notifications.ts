import { eq, desc, and } from 'drizzle-orm';

import { db } from '../index';
import {
  gameNotifications,
  type GameNotification,
  type InsertGameNotification,
} from '../schema';

// ユーザーの通知取得
export async function getUserNotifications(
  userId: string,
  limit = 50,
  offset = 0
): Promise<GameNotification[]> {
  try {
    const notifications = await db
      .select()
      .from(gameNotifications)
      .where(eq(gameNotifications.userId, userId))
      .orderBy(desc(gameNotifications.createdAt))
      .limit(limit)
      .offset(offset);

    return notifications;
  } catch (error) {
    console.error('Failed to get user notifications:', error);
    throw new Error('ユーザー通知の取得に失敗しました');
  }
}

// 未読通知取得
export async function getUnreadNotifications(userId: string): Promise<GameNotification[]> {
  try {
    const notifications = await db
      .select()
      .from(gameNotifications)
      .where(
        and(
          eq(gameNotifications.userId, userId),
          eq(gameNotifications.isRead, false)
        )
      )
      .orderBy(desc(gameNotifications.createdAt));

    return notifications;
  } catch (error) {
    console.error('Failed to get unread notifications:', error);
    throw new Error('未読通知の取得に失敗しました');
  }
}

// 通知作成
export async function createNotification(
  notificationData: InsertGameNotification
): Promise<GameNotification> {
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
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<GameNotification> {
  try {
    const [updatedNotification] = await db
      .update(gameNotifications)
      .set({ isRead: true })
      .where(
        and(
          eq(gameNotifications.id, notificationId),
          eq(gameNotifications.userId, userId)
        )
      )
      .returning();

    if (!updatedNotification) {
      throw new Error('通知が見つからません');
    }

    return updatedNotification;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('通知の既読処理に失敗しました');
  }
}

// 全通知を既読にする
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    await db
      .update(gameNotifications)
      .set({ isRead: true })
      .where(
        and(
          eq(gameNotifications.userId, userId),
          eq(gameNotifications.isRead, false)
        )
      );
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw new Error('全通知の既読処理に失敗しました');
  }
}

// 通知削除
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<void> {
  try {
    const result = await db
      .delete(gameNotifications)
      .where(
        and(
          eq(gameNotifications.id, notificationId),
          eq(gameNotifications.userId, userId)
        )
      );

    if (result.count === 0) {
      throw new Error('通知が見つかりません');
    }
  } catch (error) {
    console.error('Failed to delete notification:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('通知の削除に失敗しました');
  }
}

// 通知タイプ別取得
export async function getNotificationsByType(
  userId: string,
  type: 'level_up' | 'badge_unlocked' | 'mission_completed' | 'challenge_completed' | 'streak_milestone' | 'xp_milestone',
  limit = 20
): Promise<GameNotification[]> {
  try {
    const notifications = await db
      .select()
      .from(gameNotifications)
      .where(
        and(
          eq(gameNotifications.userId, userId),
          eq(gameNotifications.type, type)
        )
      )
      .orderBy(desc(gameNotifications.createdAt))
      .limit(limit);

    return notifications;
  } catch (error) {
    console.error('Failed to get notifications by type:', error);
    throw new Error('タイプ別通知の取得に失敗しました');
  }
}

// レベルアップ通知作成
export async function createLevelUpNotification(
  userId: string,
  newLevel: number,
  totalXP: number
): Promise<GameNotification> {
  const notificationData: InsertGameNotification = {
    userId,
    type: 'level_up',
    title: 'レベルアップ！',
    message: `レベル ${newLevel} に到達しました！`,
    data: JSON.stringify({ level: newLevel, totalXP }),
    isRead: false
  };

  return createNotification(notificationData);
}

// バッジ取得通知作成
export async function createBadgeUnlockedNotification(
  userId: string,
  badgeId: string,
  badgeName: string
): Promise<GameNotification> {
  const notificationData: InsertGameNotification = {
    userId,
    type: 'badge_unlocked',
    title: '新しいバッジを獲得！',
    message: `${badgeName} のバッジを獲得しました！`,
    data: JSON.stringify({ badgeId, badgeName }),
    isRead: false
  };

  return createNotification(notificationData);
}