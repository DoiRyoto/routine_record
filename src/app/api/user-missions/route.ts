import { NextRequest, NextResponse } from 'next/server';

import { 
  getUserMissions,
  startMission,
  updateMissionProgress,
  completeMission
} from '@/lib/db/queries/missions';
import { addXP } from '@/lib/db/queries/user-profiles';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      );
    }

    const userMissions = await getUserMissions(userId);
    return NextResponse.json(userMissions);
  } catch (error) {
    console.error('GET /api/user-missions error:', error);
    return NextResponse.json(
      { error: 'ユーザーミッションの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, missionId, progress } = body;

    if (!userId || !missionId) {
      return NextResponse.json(
        { error: 'userIdとmissionIdが必要です' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'start':
        const startedMission = await startMission(userId, missionId);
        return NextResponse.json(startedMission);

      case 'updateProgress':
        if (progress === undefined) {
          return NextResponse.json(
            { error: 'progressが必要です' },
            { status: 400 }
          );
        }
        const updatedMission = await updateMissionProgress(userId, missionId, progress);
        return NextResponse.json(updatedMission);

      case 'complete':
        const { userMission, xpReward } = await completeMission(userId, missionId);
        
        // XP付与
        if (xpReward > 0) {
          await addXP(
            userId,
            xpReward,
            `ミッション完了: ${missionId}`,
            'mission_completion',
            missionId
          );
        }

        return NextResponse.json({
          userMission,
          xpReward,
          message: 'ミッションが完了しました！'
        });

      default:
        return NextResponse.json(
          { error: '不正なアクションです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/user-missions error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'ユーザーミッションの処理に失敗しました' },
      { status: 500 }
    );
  }
}