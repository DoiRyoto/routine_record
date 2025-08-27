import { NextRequest, NextResponse } from 'next/server';

import {
  getActiveMissions,
  getUserMissions,
  startMission,
  updateMissionProgress,
  claimMissionReward,
  getAllBadges,
  getUserNotifications,
  createNotification,
  markNotificationAsRead,
  getUnreadNotificationCount,
  getUserStats
} from '@/lib/db/queries/gamification';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    switch (type) {
      case 'missions':
        const missions = await getActiveMissions();
        return NextResponse.json(missions);

      case 'user-missions':
        if (!userId) {
          return NextResponse.json(
            { error: 'userIdが必要です' },
            { status: 400 }
          );
        }
        const userMissions = await getUserMissions(userId);
        return NextResponse.json(userMissions);

      case 'badges':
        const badges = await getAllBadges();
        return NextResponse.json(badges);

      case 'notifications':
        if (!userId) {
          return NextResponse.json(
            { error: 'userIdが必要です' },
            { status: 400 }
          );
        }
        const limit = parseInt(searchParams.get('limit') || '50');
        const notifications = await getUserNotifications(userId, limit);
        return NextResponse.json(notifications);

      case 'unread-count':
        if (!userId) {
          return NextResponse.json(
            { error: 'userIdが必要です' },
            { status: 400 }
          );
        }
        const unreadCount = await getUnreadNotificationCount(userId);
        return NextResponse.json({ count: unreadCount });

      case 'stats':
        if (!userId) {
          return NextResponse.json(
            { error: 'userIdが必要です' },
            { status: 400 }
          );
        }
        const stats = await getUserStats(userId);
        return NextResponse.json(stats);

      default:
        return NextResponse.json(
          { error: '不正なtypeパラメータです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GET /api/gamification error:', error);
    return NextResponse.json(
      { error: 'ゲーミフィケーション情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, ...data } = body;

    switch (action) {
      case 'start-mission':
        const { missionId } = data;
        if (!userId || !missionId) {
          return NextResponse.json(
            { error: 'userIdとmissionIdが必要です' },
            { status: 400 }
          );
        }

        const userMission = await startMission(userId, missionId);
        return NextResponse.json(userMission);

      case 'update-mission-progress':
        const { missionId: updateMissionId, progress } = data;
        if (!userId || !updateMissionId || progress === undefined) {
          return NextResponse.json(
            { error: 'userId, missionId, progressが必要です' },
            { status: 400 }
          );
        }

        const updatedMission = await updateMissionProgress(userId, updateMissionId, progress);
        return NextResponse.json(updatedMission);

      case 'claim-mission-reward':
        const { missionId: claimMissionId } = data;
        if (!userId || !claimMissionId) {
          return NextResponse.json(
            { error: 'userIdとmissionIdが必要です' },
            { status: 400 }
          );
        }

        const claimedMission = await claimMissionReward(userId, claimMissionId);
        return NextResponse.json(claimedMission);

      case 'create-notification':
        const { type, title, message, notificationData } = data;
        if (!userId || !type || !title || !message) {
          return NextResponse.json(
            { error: 'userId, type, title, messageが必要です' },
            { status: 400 }
          );
        }

        const notification = await createNotification({
          userId,
          type,
          title,
          message,
          data: notificationData ? JSON.stringify(notificationData) : undefined
        });
        return NextResponse.json(notification);

      case 'mark-notification-read':
        const { notificationId } = data;
        if (!notificationId) {
          return NextResponse.json(
            { error: 'notificationIdが必要です' },
            { status: 400 }
          );
        }

        await markNotificationAsRead(notificationId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: '不正なアクションです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/gamification error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'ゲーミフィケーション処理に失敗しました' },
      { status: 500 }
    );
  }
}