import { NextRequest, NextResponse } from 'next/server';

import { leaveChallenge, updateChallengeProgress, getChallengeLeaderboard } from '@/lib/db/queries/challenges';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      );
    }

    await leaveChallenge(userId, challengeId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/challenges/[id] error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'チャレンジからの脱退に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'leaderboard') {
      const leaderboard = await getChallengeLeaderboard(challengeId);
      return NextResponse.json(leaderboard);
    }

    // その他のGET操作があればここに追加
    return NextResponse.json({ error: '不正なアクションです' }, { status: 400 });
  } catch (error) {
    console.error('GET /api/challenges/[id] error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'チャレンジの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: challengeId } = await params;
    const { userId, progress } = await request.json();

    if (!userId || progress === undefined) {
      return NextResponse.json(
        { error: 'userIdとprogressが必要です' },
        { status: 400 }
      );
    }

    const updatedUserChallenge = await updateChallengeProgress(userId, challengeId, progress);
    
    return NextResponse.json(updatedUserChallenge);
  } catch (error) {
    console.error('PATCH /api/challenges/[id] error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'チャレンジ進捗の更新に失敗しました' },
      { status: 500 }
    );
  }
}