import { NextRequest, NextResponse } from 'next/server';

import { 
  getAllBadges, 
  getBadgesByCategory,
  createBadge,
  updateBadge,
  deleteBadge 
} from '@/lib/db/queries/badges';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let badges;
    if (category) {
      badges = await getBadgesByCategory(category);
    } else {
      badges = await getAllBadges();
    }

    return NextResponse.json(badges);
  } catch (error) {
    console.error('GET /api/badges error:', error);
    return NextResponse.json(
      { error: 'バッジの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, badgeId, ...badgeData } = body;

    switch (action) {
      case 'create':
        const newBadge = await createBadge(badgeData);
        return NextResponse.json(newBadge);

      case 'update':
        if (!badgeId) {
          return NextResponse.json(
            { error: 'badgeIdが必要です' },
            { status: 400 }
          );
        }
        const updatedBadge = await updateBadge(badgeId, badgeData);
        return NextResponse.json(updatedBadge);

      case 'delete':
        if (!badgeId) {
          return NextResponse.json(
            { error: 'badgeIdが必要です' },
            { status: 400 }
          );
        }
        await deleteBadge(badgeId);
        return NextResponse.json({ message: 'バッジが削除されました' });

      default:
        return NextResponse.json(
          { error: '不正なアクションです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/badges error:', error);
    
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