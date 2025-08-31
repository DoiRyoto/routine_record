import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
  createSuccessResponse,
  createErrorResponse,
  createServerErrorResponse,
} from '@/lib/routines/responses';

import { 
  getUserNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationsByType,
  getUnreadCount
} from '@/server/lib/db/queries/game-notifications';

// 認証ユーザー取得のヘルパー関数
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  return user;
}

// GET: ゲーム通知取得
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('認証が必要です', 401);
    }

    // URLパラメータの解析
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');
    const limitStr = searchParams.get('limit');

    // userIdのバリデーション（他のユーザーの通知にはアクセスできない）
    if (requestedUserId !== null && requestedUserId !== user.id) {
      return createErrorResponse('他のユーザーの情報にはアクセスできません', 403);
    }

    // limitのバリデーション
    const limit = limitStr ? parseInt(limitStr) : 20;
    if (limitStr && (isNaN(limit) || limit < 1 || limit > 50)) {
      return createErrorResponse('limit は1から50の間で指定してください', 400);
    }

    // typeのバリデーション
    const validTypes = ['level_up', 'badge_unlocked', 'mission_completed', 'challenge_completed', 'streak_milestone', 'xp_milestone'];
    if (type && !validTypes.includes(type)) {
      return createErrorResponse('無効な通知タイプです', 400);
    }

    // 通知取得
    let notifications;
    
    if (type) {
      notifications = await getNotificationsByType(user.id, type as 'level_up' | 'badge_unlocked' | 'mission_completed' | 'challenge_completed' | 'streak_milestone' | 'xp_milestone', limit);
    } else if (isRead === 'false') {
      notifications = await getUnreadNotifications(user.id);
    } else {
      notifications = await getUserNotifications(user.id, limit);
    }

    // 未読数も取得
    const unreadCount = await getUnreadCount(user.id);

    return createSuccessResponse({
      notifications,
      unreadCount
    });

  } catch (error) {
    console.error('GET /api/game-notifications error:', error);
    return createServerErrorResponse();
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