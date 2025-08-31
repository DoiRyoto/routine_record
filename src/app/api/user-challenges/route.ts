import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest } from 'next/server';

import {
  createSuccessResponse,
  createErrorResponse,
  createServerErrorResponse,
} from '@/lib/routines/responses';

import {
  getUserChallenges,
  getUserChallengesByStatus,
  getUserChallengesWithDetails,
  getUserChallengeByChallenge as _getUserChallengeByChallenge,
} from '@/server/lib/db/queries/user-challenges';

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

// バリデーション関数
function validateQueryParams(searchParams: URLSearchParams) {
  const status = searchParams.get('status');
  const challengeId = searchParams.get('challengeId');
  const joinedAfter = searchParams.get('joinedAfter');
  const joinedBefore = searchParams.get('joinedBefore');
  const includeChallengeDetails = searchParams.get('includeChallengeDetails');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  // statusのバリデーション
  if (status && !['completed', 'in_progress'].includes(status)) {
    return 'status パラメータが無効です。completed, in_progressのいずれかを指定してください';
  }

  // challengeIdのバリデーション（基本的な形式チェック）
  if (challengeId) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const uuidLikeRegex = /^[0-9a-f-]+$/i; // UUID風の文字列（数字、英字、ハイフンのみ）
    
    if (challengeId.trim() === '' || challengeId.length < 3) {
      return 'challengeId パラメータが無効です。3文字以上の値を指定してください';
    }
    
    // UUID風だが不正な形式の場合はエラー
    if (uuidLikeRegex.test(challengeId) && challengeId.includes('-') && !uuidRegex.test(challengeId)) {
      return 'challengeId パラメータが無効です。有効なUUID形式を指定してください';
    }
    
    // 一般的な文字列の場合の基本チェック
    const generalIdRegex = /^[a-zA-Z0-9-_]+$/;
    if (!generalIdRegex.test(challengeId)) {
      return 'challengeId パラメータが無効です。英数字、ハイフン、アンダースコアのみ使用できます';
    }
  }

  // 日付のバリデーション
  if (joinedAfter) {
    const date = new Date(joinedAfter);
    if (isNaN(date.getTime())) {
      return 'joinedAfter パラメータが無効です。有効なISO日付文字列を指定してください';
    }
  }

  if (joinedBefore) {
    const date = new Date(joinedBefore);
    if (isNaN(date.getTime())) {
      return 'joinedBefore パラメータが無効です。有効なISO日付文字列を指定してください';
    }
  }

  // 日付範囲のバリデーション
  if (joinedAfter && joinedBefore) {
    const afterDate = new Date(joinedAfter);
    const beforeDate = new Date(joinedBefore);
    if (afterDate >= beforeDate) {
      return 'joinedAfter は joinedBefore より前の日付を指定してください';
    }
  }

  // includeChallengeDetailsのバリデーション
  if (includeChallengeDetails && !['true', 'false'].includes(includeChallengeDetails)) {
    return 'includeChallengeDetails パラメータが無効です。trueまたはfalseを指定してください';
  }

  // sortByのバリデーション
  if (sortBy && !['progress', 'joinedAt', 'completedAt', 'rank'].includes(sortBy)) {
    return 'sortBy パラメータが無効です。progress, joinedAt, completedAt, rankのいずれかを指定してください';
  }

  // sortOrderのバリデーション
  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    return 'sortOrder パラメータが無効です。ascまたはdescを指定してください';
  }

  return null;
}

// ソート関数
function sortUserChallenges(userChallenges: any[], sortBy?: string, sortOrder?: string) {
  if (!sortBy) return userChallenges;

  const order = sortOrder === 'desc' ? -1 : 1;

  return [...userChallenges].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // 日付の場合は日付オブジェクトとして比較
    if (sortBy === 'joinedAt' || sortBy === 'completedAt') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }

    if (aValue < bValue) return -1 * order;
    if (aValue > bValue) return 1 * order;
    return 0;
  });
}

// フィルタ関数
function filterUserChallenges(userChallenges: any[], filters: {
  joinedAfter?: string;
  joinedBefore?: string;
}) {
  return userChallenges.filter(userChallenge => {
    // 参加日範囲フィルタ
    if (filters.joinedAfter || filters.joinedBefore) {
      const joinedAt = new Date(userChallenge.joinedAt);
      
      if (filters.joinedAfter) {
        const afterDate = new Date(filters.joinedAfter);
        if (joinedAt < afterDate) {
          return false;
        }
      }
      
      if (filters.joinedBefore) {
        const beforeDate = new Date(filters.joinedBefore);
        if (joinedAt > beforeDate) {
          return false;
        }
      }
    }

    return true;
  });
}

// GET: ユーザーのチャレンジ一覧取得
export async function GET(request: NextRequest) {
  try {
    // 認証確認
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('認証が必要です', 401);
    }

    const { searchParams } = new URL(request.url);
    
    // バリデーション
    const validationError = validateQueryParams(searchParams);
    if (validationError) {
      return createErrorResponse(validationError, 400);
    }

    const requestedUserId = searchParams.get('userId');
    const status = searchParams.get('status') as 'completed' | 'in_progress' | null;
    const challengeId = searchParams.get('challengeId');
    const joinedAfter = searchParams.get('joinedAfter');
    const joinedBefore = searchParams.get('joinedBefore');
    const includeChallengeDetails = searchParams.get('includeChallengeDetails') === 'true';
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');
    
    // ページネーションパラメータ
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 認可チェック：userIdが指定されている場合、自分のIDと一致するかチェック
    if (requestedUserId && requestedUserId !== user.id) {
      return createErrorResponse('他のユーザーの情報にはアクセスできません', 403);
    }

    const userId = requestedUserId || user.id;

    let userChallenges;

    // パラメータに基づいてクエリ選択
    if (includeChallengeDetails) {
      // 詳細情報付きで取得
      userChallenges = await getUserChallengesWithDetails(userId);
    } else if (status) {
      // ステータスでフィルタリング
      userChallenges = await getUserChallengesByStatus(userId, status);
    } else {
      // 基本取得（challengeIdフィルタも含む）
      const filters = challengeId ? { challengeId } : null;
      const pagination = { page, limit };
      userChallenges = await getUserChallenges(userId, filters, pagination);
    }

    // 日付フィルタリング
    if (joinedAfter || joinedBefore) {
      userChallenges = filterUserChallenges(userChallenges, { 
        joinedAfter: joinedAfter || undefined, 
        joinedBefore: joinedBefore || undefined 
      });
    }

    // ソート
    if (sortBy) {
      userChallenges = sortUserChallenges(userChallenges, sortBy, sortOrder as 'asc' | 'desc' | undefined);
    }

    // レスポンスデータの構築
    const responseData: any = { userChallenges };
    
    // ページネーション情報の追加
    if (page > 1 || limit !== 20) {
      responseData.pagination = {
        page,
        limit,
        total: userChallenges.length,
        hasNext: userChallenges.length === limit,
        hasPrev: page > 1
      };
    }

    return createSuccessResponse(responseData);
  } catch (error) {
    console.error('GET /api/user-challenges error:', error);
    return createServerErrorResponse();
  }
}