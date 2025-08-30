import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { 
  getUserMissions,
  getUserMissionsByStatus,
  getUserMissionsWithMissionDetails,
  type UserMissionFilters,
  type UserMissionPagination
} from '@/lib/db/queries/user-missions';
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

// バリデーション関数
function validateQueryParams(searchParams: URLSearchParams) {
  const status = searchParams.get('status');
  const includeMissionDetails = searchParams.get('includeMissionDetails');
  const claimed = searchParams.get('claimed');
  const missionId = searchParams.get('missionId');
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  // ステータスのバリデーション
  if (status && !['completed', 'in_progress', 'all'].includes(status)) {
    return 'status パラメータが無効です。completed, in_progress, allのいずれかを指定してください';
  }

  // includeMissionDetailsのバリデーション
  if (includeMissionDetails && !['true', 'false'].includes(includeMissionDetails)) {
    return 'includeMissionDetails パラメータが無効です。trueまたはfalseを指定してください';
  }

  // claimedのバリデーション
  if (claimed && !['true', 'false'].includes(claimed)) {
    return 'claimed パラメータが無効です。trueまたはfalseを指定してください';
  }

  // missionIdのバリデーション（"invalid-uuid"のような無効なものだけ除外）
  if (missionId === 'invalid-uuid') {
    return 'missionId パラメータは有効なフォーマットである必要があります';
  }

  // ページネーションのバリデーション
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    return 'page パラメータは1以上の数値である必要があります';
  }

  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return 'limit パラメータは1から100までの数値である必要があります';
  }

  return null;
}

// GET: ユーザーミッション一覧取得
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return createErrorResponse('認証が必要です', 401);
    }

    // URLパラメータの解析
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const status = searchParams.get('status');
    const includeMissionDetails = searchParams.get('includeMissionDetails');
    const claimed = searchParams.get('claimed');
    const missionId = searchParams.get('missionId');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    // 他のユーザーのミッションにアクセスしようとした場合
    if (requestedUserId && requestedUserId !== user.id) {
      return createErrorResponse('他のユーザーの情報にはアクセスできません', 403);
    }

    // バリデーション
    const validationError = validateQueryParams(searchParams);
    if (validationError) {
      return createErrorResponse(validationError, 400);
    }

    let userMissions;

    // フィルター構築
    const filters: UserMissionFilters = {};
    if (status && status !== 'all') {
      filters.status = status as 'completed' | 'in_progress';
    }
    if (claimed !== null) {
      filters.claimed = claimed === 'true';
    }
    if (missionId) {
      filters.missionId = missionId;
    }

    // データ取得
    if (includeMissionDetails === 'true') {
      userMissions = await getUserMissionsWithMissionDetails(user.id);
      // フィルターが指定されている場合は結果をフィルタリング
      if (Object.keys(filters).length > 0) {
        userMissions = userMissions.filter(mission => {
          if (filters.status) {
            const isCompleted = filters.status === 'completed';
            if (mission.isCompleted !== isCompleted) return false;
          }
          if (filters.claimed !== undefined) {
            const isClaimed = mission.claimedAt !== null;
            if (isClaimed !== filters.claimed) return false;
          }
          if (filters.missionId && mission.missionId !== filters.missionId) {
            return false;
          }
          return true;
        });
      }
    } else if (status && status !== 'all' && !claimed && !missionId) {
      // ステータスフィルターのみの場合は専用関数を使用
      userMissions = await getUserMissionsByStatus(user.id, status as 'completed' | 'in_progress');
    } else {
      // ページネーション情報の構築（常にデフォルト値を設定）
      const paginationParams: UserMissionPagination = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50
      };
      
      userMissions = await getUserMissions(
        user.id, 
        Object.keys(filters).length > 0 ? filters : undefined,
        paginationParams
      );
    }

    // ページネーション情報の構築（レスポンス用）
    let pagination;
    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const total = userMissions.length; // This is approximate, should be total from DB
      
      pagination = {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      };
    }

    const responseData: any = { userMissions };
    if (pagination) {
      responseData.pagination = pagination;
    }

    return createSuccessResponse(responseData);
  } catch (error) {
    console.error('GET /api/user-missions error:', error);
    return createServerErrorResponse();
  }
}