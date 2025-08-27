import { NextRequest, NextResponse } from 'next/server';

import { getStreakData } from '@/lib/db/queries/gamification';
import { 
  getUserProfile, 
  createUserProfile, 
  updateUserProfile,
  getUserBadges,
  addXP,
  updateStreak,
  updateUserStats
} from '@/lib/db/queries/user-profiles';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeDetails = searchParams.get('includeDetails') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      );
    }

    const userProfile = await getUserProfile(userId);
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'ユーザープロフィールが見つかりません' },
        { status: 404 }
      );
    }

    if (includeDetails) {
      const [badges, streakData] = await Promise.all([
        getUserBadges(userId),
        getStreakData(userId)
      ]);

      return NextResponse.json({
        userProfile: {
          ...userProfile,
          badges
        },
        streakData
      });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('GET /api/user-profiles error:', error);
    return NextResponse.json(
      { error: 'ユーザープロフィールの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, ...data } = body;

    switch (action) {
      case 'create':
        const newProfile = await createUserProfile({
          userId,
          level: 1,
          totalXP: 0,
          currentXP: 0,
          nextLevelXP: 100,
          streak: 0,
          longestStreak: 0,
          totalRoutines: 0,
          totalExecutions: 0,
          ...data
        });
        return NextResponse.json(newProfile);

      case 'update':
        const updatedProfile = await updateUserProfile(userId, data);
        return NextResponse.json(updatedProfile);

      case 'addXP':
        const { amount, reason, sourceType, sourceId } = data;
        if (!amount || !reason || !sourceType) {
          return NextResponse.json(
            { error: 'amount, reason, sourceTypeが必要です' },
            { status: 400 }
          );
        }

        const xpResult = await addXP(userId, amount, reason, sourceType, sourceId);
        return NextResponse.json(xpResult);

      case 'updateStreak':
        const { streak } = data;
        if (streak === undefined) {
          return NextResponse.json(
            { error: 'streakが必要です' },
            { status: 400 }
          );
        }

        const updatedStreakProfile = await updateStreak(userId, streak);
        return NextResponse.json(updatedStreakProfile);

      case 'updateStats':
        const statsProfile = await updateUserStats(userId, data);
        return NextResponse.json(statsProfile);

      default:
        return NextResponse.json(
          { error: '不正なアクションです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/user-profiles error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'ユーザープロフィールの処理に失敗しました' },
      { status: 500 }
    );
  }
}