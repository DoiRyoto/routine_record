import { NextRequest, NextResponse } from 'next/server';

import { getUserChallenges } from '@/lib/db/queries/challenges';

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

    const userChallenges = await getUserChallenges(userId);
    return NextResponse.json(userChallenges);
  } catch (error) {
    console.error('GET /api/user-challenges error:', error);
    return NextResponse.json(
      { error: 'ユーザーチャレンジの取得に失敗しました' },
      { status: 500 }
    );
  }
}