import { NextRequest, NextResponse } from 'next/server';

import { 
  getUserBadges,
  awardBadge,
  markBadgeAsViewed
} from '@/lib/db/queries/user-profiles';

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

    const badges = await getUserBadges(userId);
    return NextResponse.json(badges);
  } catch (error) {
    console.error('GET /api/user-badges error:', error);
    return NextResponse.json(
      { error: 'ユーザーバッジの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, badgeId } = body;

    switch (action) {
      case 'award':
        if (!userId || !badgeId) {
          return NextResponse.json(
            { error: 'userIdとbadgeIdが必要です' },
            { status: 400 }
          );
        }

        const newUserBadge = await awardBadge(userId, badgeId);
        return NextResponse.json(newUserBadge);

      case 'markViewed':
        if (!userId || !badgeId) {
          return NextResponse.json(
            { error: 'userIdとbadgeIdが必要です' },
            { status: 400 }
          );
        }

        await markBadgeAsViewed(userId, badgeId);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: '不正なアクションです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/user-badges error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'バッジの処理に失敗しました' },
      { status: 500 }
    );
  }
}