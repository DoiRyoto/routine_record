import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { 
  getXPHistory,
  getXPHistoryByDateRange,
  getXPHistoryBySource,
  getXPSummary
} from '@/lib/db/queries/xp-transactions';
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

//日付フォーマットバリデーション
function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.includes('T');
}

// GET: XP取引履歴取得
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('認証が必要です', 401);
    }

    // URLパラメータの解析
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const source = searchParams.get('source');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pageStr = searchParams.get('page');
    const limitStr = searchParams.get('limit');

    // userIdのバリデーション（他のユーザーのXP履歴にはアクセスできない）
    if (requestedUserId !== null && requestedUserId !== user.id) {
      return createErrorResponse('他のユーザーの情報にはアクセスできません', 403);
    }

    // ページングのバリデーション
    const page = pageStr ? parseInt(pageStr) : 1;
    const limit = limitStr ? parseInt(limitStr) : 50;

    if (pageStr && (isNaN(page) || page < 1)) {
      return createErrorResponse('page は1以上の整数で指定してください', 400);
    }

    if (limitStr && (isNaN(limit) || limit < 1 || limit > 100)) {
      return createErrorResponse('limit は1から100の間で指定してください', 400);
    }

    // sourceのバリデーション
    const validSources = ['routine_completion', 'streak_bonus', 'mission_completion', 'challenge_completion', 'daily_bonus', 'achievement_unlock'];
    if (source && !validSources.includes(source)) {
      return createErrorResponse('無効なXP取得源です', 400);
    }

    // 日付のバリデーション
    if ((startDate && !isValidISODate(startDate)) || (endDate && !isValidISODate(endDate))) {
      return createErrorResponse('日付はISO 8601形式で指定してください', 400);
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return createErrorResponse('開始日は終了日より前である必要があります', 400);
    }

    const offset = (page - 1) * limit;

    // XP履歴取得
    let xpTransactions;
    let total = 0;

    if (startDate && endDate) {
      const result = await getXPHistoryByDateRange(
        user.id,
        new Date(startDate),
        new Date(endDate),
        limit,
        offset,
        source
      );
      xpTransactions = result.transactions;
      total = result.total;
    } else if (source) {
      const result = await getXPHistoryBySource(user.id, source, limit, offset);
      xpTransactions = result.transactions;
      total = result.total;
    } else {
      const result = await getXPHistory(user.id, limit, offset);
      xpTransactions = result.transactions;
      total = result.total;
    }

    // サマリー情報取得（期間指定があれば期間内のサマリー、なければ全期間）
    const summary = await getXPSummary(
      user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    // ページング情報構築
    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      pages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    return createSuccessResponse({
      xpTransactions,
      pagination,
      summary
    });

  } catch (error) {
    console.error('GET /api/xp-transactions error:', error);
    return createServerErrorResponse();
  }
}