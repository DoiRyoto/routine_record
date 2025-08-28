import { NextRequest, NextResponse } from 'next/server';

import { createChallenge, getActiveChallenges, joinChallenge } from '@/lib/db/queries/challenges';
import { createUserProfile, getUserProfile } from '@/lib/db/queries/user-profiles';

export async function GET() {
  try {
    const challenges = await getActiveChallenges();
    return NextResponse.json(challenges);
  } catch (error) {
    console.error('GET /api/challenges error:', error);
    return NextResponse.json({ error: 'チャレンジの取得に失敗しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, challengeId, challengeData } = body;

    switch (action) {
      case 'join':
        if (!userId || !challengeId) {
          return NextResponse.json({ error: 'userIdとchallengeIdが必要です' }, { status: 400 });
        }

        // ユーザープロフィールが存在しない場合は作成
        let userProfile = await getUserProfile(userId);
        if (!userProfile) {
          userProfile = await createUserProfile({
            userId,
            level: 1,
            totalXP: 0,
            currentXP: 0,
            nextLevelXP: 100,
            streak: 0,
            longestStreak: 0,
            totalRoutines: 0,
            totalExecutions: 0,
          });
        }

        const userChallenge = await joinChallenge(userId, challengeId);
        return NextResponse.json(userChallenge);

      case 'create':
        if (!challengeData) {
          return NextResponse.json({ error: 'challengeDataが必要です' }, { status: 400 });
        }

        const { requirements = [], rewards = [], ...challenge } = challengeData;
        const newChallenge = await createChallenge(challenge, requirements, rewards);
        return NextResponse.json(newChallenge);

      default:
        return NextResponse.json({ error: '不正なアクションです' }, { status: 400 });
    }
  } catch (error) {
    console.error('POST /api/challenges error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'チャレンジの処理に失敗しました' }, { status: 500 });
  }
}
