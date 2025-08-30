import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { 
  getUserBadges,
  getUserBadgesByCategory,
  getUserBadgesByRarity,
  getNewUserBadges,
  awardBadge,
  markBadgeAsViewed,
  markAllBadgesAsViewed as _markAllBadgesAsViewed
} from '@/lib/db/queries/user-badges';
import {
  createSuccessResponse,
  createErrorResponse,
  createServerErrorResponse,
} from '@/lib/routines/responses';

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

// GET: ユーザーバッジ取得
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('認証が必要です', 401);
    }

    // URLパラメータの解析
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const isNew = searchParams.get('isNew');

    // userIdのバリデーション（他のユーザーのバッジにはアクセスできない）
    if (requestedUserId !== null && requestedUserId !== user.id) {
      return createErrorResponse('他のユーザーの情報にはアクセスできません', 403);
    }

    // フィルタリングに応じてバッジ取得
    let userBadges;
    
    if (isNew === 'true') {
      userBadges = await getNewUserBadges(user.id);
    } else if (category) {
      userBadges = await getUserBadgesByCategory(user.id, category);
    } else if (rarity) {
      userBadges = await getUserBadgesByRarity(user.id, rarity);
    } else {
      userBadges = await getUserBadges(user.id);
    }

    return createSuccessResponse({
      userBadges
    });
  } catch (error) {
    console.error('GET /api/user-badges error:', error);
    return createServerErrorResponse();
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