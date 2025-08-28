import { NextRequest, NextResponse } from 'next/server';

import { 
  getXPHistory,
  getXPHistoryByDateRange,
  getXPHistoryBySource,
  getDailyXPStats,
  getTotalXPEarned
} from '@/lib/db/queries/xp-transactions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'history';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'history':
        const history = await getXPHistory(userId, limit, offset);
        return NextResponse.json(history);

      case 'dateRange':
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDateとendDateが必要です' },
            { status: 400 }
          );
        }

        const rangeHistory = await getXPHistoryByDateRange(
          userId,
          new Date(startDate),
          new Date(endDate)
        );
        return NextResponse.json(rangeHistory);

      case 'source':
        const sourceType = searchParams.get('sourceType') as 'routine_completion' | 'streak_bonus' | 'mission_completion' | 'challenge_completion' | 'daily_bonus' | 'achievement_unlock' | null;
        
        if (!sourceType) {
          return NextResponse.json(
            { error: 'sourceTypeが必要です' },
            { status: 400 }
          );
        }

        const sourceHistory = await getXPHistoryBySource(userId, sourceType, limit);
        return NextResponse.json(sourceHistory);

      case 'dailyStats':
        const days = parseInt(searchParams.get('days') || '30');
        const dailyStats = await getDailyXPStats(userId, days);
        return NextResponse.json(dailyStats);

      case 'total':
        const totalXP = await getTotalXPEarned(userId);
        return NextResponse.json({ totalXP });

      default:
        return NextResponse.json(
          { error: '不正なtypeです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GET /api/xp-transactions error:', error);
    return NextResponse.json(
      { error: 'XPトランザクションの取得に失敗しました' },
      { status: 500 }
    );
  }
}