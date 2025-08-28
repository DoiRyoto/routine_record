import { NextRequest, NextResponse } from 'next/server';

import { 
  getUserNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationsByType
} from '@/lib/db/queries/game-notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const notificationType = searchParams.get('notificationType') as 'level_up' | 'badge_unlocked' | 'mission_completed' | 'challenge_completed' | 'streak_milestone' | 'xp_milestone' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      );
    }

    if (unreadOnly) {
      const notifications = await getUnreadNotifications(userId);
      return NextResponse.json(notifications);
    }

    if (notificationType) {
      const notifications = await getNotificationsByType(userId, notificationType, limit);
      return NextResponse.json(notifications);
    }

    const notifications = await getUserNotifications(userId, limit, offset);
    return NextResponse.json(notifications);

  } catch (error) {
    console.error('GET /api/game-notifications error:', error);
    return NextResponse.json(
      { error: 'ゲーム通知の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, notificationId } = body;

    switch (action) {
      case 'markAsRead':
        if (!userId || !notificationId) {
          return NextResponse.json(
            { error: 'userIdとnotificationIdが必要です' },
            { status: 400 }
          );
        }
        const updatedNotification = await markNotificationAsRead(notificationId, userId);
        return NextResponse.json(updatedNotification);

      case 'markAllAsRead':
        if (!userId) {
          return NextResponse.json(
            { error: 'userIdが必要です' },
            { status: 400 }
          );
        }
        await markAllNotificationsAsRead(userId);
        return NextResponse.json({ message: '全通知を既読にしました' });

      case 'delete':
        if (!userId || !notificationId) {
          return NextResponse.json(
            { error: 'userIdとnotificationIdが必要です' },
            { status: 400 }
          );
        }
        await deleteNotification(notificationId, userId);
        return NextResponse.json({ message: '通知を削除しました' });

      default:
        return NextResponse.json(
          { error: '不正なアクションです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/game-notifications error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'ゲーム通知の処理に失敗しました' },
      { status: 500 }
    );
  }
}