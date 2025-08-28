import { http, HttpResponse } from 'msw';

import {
  getMockGameNotifications,
  getMockUnreadNotifications,
  mockCreateNotification,
  mockMarkNotificationAsRead,
  mockMarkAllNotificationsAsRead,
  mockDeleteNotification,
} from '../data/game-notifications';

export const gameNotificationsHandlers = [
  // GET: ゲーム通知一覧取得
  http.get('/api/game-notifications', ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
      
      if (!userId) {
        return HttpResponse.json(
          { error: 'userIdが必要です' },
          { status: 400 }
        );
      }

      let notifications;
      if (unreadOnly) {
        notifications = getMockUnreadNotifications(userId);
      } else {
        notifications = getMockGameNotifications(userId);
      }

      return HttpResponse.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error('GET /api/game-notifications mock error:', error);
      return HttpResponse.json(
        { error: 'ゲーム通知の取得に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // POST: ゲーム通知操作
  http.post('/api/game-notifications', async ({ request }) => {
    try {
      const body = await request.json() as {
        action: 'create' | 'markRead' | 'markAllRead' | 'delete';
        notificationId?: string;
        userId?: string;
        type?: 'level_up' | 'badge_unlocked' | 'mission_completed' | 'challenge_completed' | 'streak_milestone' | 'xp_milestone';
        title?: string;
        message?: string;
        data?: string;
      };
      
      const { action, notificationId, userId, ...notificationData } = body;

      switch (action) {
        case 'create':
          if (!userId || !notificationData.type || !notificationData.title || !notificationData.message) {
            return HttpResponse.json(
              { error: 'userId, type, title, messageが必要です' },
              { status: 400 }
            );
          }

          const newNotification = mockCreateNotification({
            userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            data: notificationData.data || null,
            isRead: false,
          });

          return HttpResponse.json({
            success: true,
            data: newNotification,
          });

        case 'markRead':
          if (!notificationId) {
            return HttpResponse.json(
              { error: 'notificationIdが必要です' },
              { status: 400 }
            );
          }

          const updatedNotification = mockMarkNotificationAsRead(notificationId);
          return HttpResponse.json({
            success: true,
            data: updatedNotification,
          });

        case 'markAllRead':
          if (!userId) {
            return HttpResponse.json(
              { error: 'userIdが必要です' },
              { status: 400 }
            );
          }

          mockMarkAllNotificationsAsRead(userId);
          return HttpResponse.json({
            success: true,
            message: '全ての通知を既読にしました',
          });

        case 'delete':
          if (!notificationId) {
            return HttpResponse.json(
              { error: 'notificationIdが必要です' },
              { status: 400 }
            );
          }

          mockDeleteNotification(notificationId);
          return HttpResponse.json({
            success: true,
            message: '通知を削除しました',
          });

        default:
          return HttpResponse.json(
            { error: '不正なアクションです' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('POST /api/game-notifications mock error:', error);
      
      if (error instanceof Error) {
        return HttpResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return HttpResponse.json(
        { error: 'ゲーム通知の処理に失敗しました' },
        { status: 500 }
      );
    }
  }),
];