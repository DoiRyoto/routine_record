import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest } from 'next/server';

import {
  createSuccessResponse,
  createErrorResponse,
  createServerErrorResponse,
} from '@/lib/routines/responses';

import { 
  getAllChallenges,
  getActiveChallenges,
  getChallengesByType,
  getChallengesWithDetails
} from '@/server/lib/db/queries/challenges';

// 認証ユーザー取得のヘルパー関数
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const isActive = searchParams.get('isActive');
  const type = searchParams.get('type');
  const joinable = searchParams.get('joinable');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const includeDetails = searchParams.get('includeDetails');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  // isActiveのバリデーション
  if (isActive && !['true', 'false'].includes(isActive)) {
    return 'isActive パラメータが無効です。trueまたはfalseを指定してください';
  }

  // typeのバリデーション
  if (type && !['daily', 'weekly', 'monthly', 'special'].includes(type)) {
    return 'type パラメータが無効です。daily, weekly, monthly, specialのいずれかを指定してください';
  }

  // joinableのバリデーション
  if (joinable && !['true', 'false'].includes(joinable)) {
    return 'joinable パラメータが無効です。trueまたはfalseを指定してください';
  }

  // startDateのバリデーション
  if (startDate) {
    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      return 'startDate パラメータが無効です。有効なISO日付文字列を指定してください';
    }
  }

  // endDateのバリデーション
  if (endDate) {
    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) {
      return 'endDate パラメータが無効です。有効なISO日付文字列を指定してください';
    }
  }

  // 日付範囲のバリデーション
  if (startDate && endDate) {
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    if (parsedStartDate >= parsedEndDate) {
      return 'startDate は endDate より前の日付を指定してください';
    }
  }

  // includeDetailsのバリデーション
  if (includeDetails && !['true', 'false'].includes(includeDetails)) {
    return 'includeDetails パラメータが無効です。trueまたはfalseを指定してください';
  }

  // sortByのバリデーション
  if (sortBy && !['startDate', 'endDate', 'participants', 'createdAt'].includes(sortBy)) {
    return 'sortBy パラメータが無効です。startDate, endDate, participants, createdAtのいずれかを指定してください';
  }

  // sortOrderのバリデーション
  if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
    return 'sortOrder パラメータが無効です。ascまたはdescを指定してください';
  }

  return null;
}

// ソート関数
function sortChallenges(challenges: any[], sortBy?: string, sortOrder?: string) {
  if (!sortBy) return challenges;

  const order = sortOrder === 'desc' ? -1 : 1;

  return [...challenges].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // 日付の場合は日付オブジェクトとして比較
    if (sortBy === 'startDate' || sortBy === 'endDate' || sortBy === 'createdAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return -1 * order;
    if (aValue > bValue) return 1 * order;
    return 0;
  });
}

// フィルタ関数
function filterChallenges(challenges: any[], filters: { 
  isActive?: string; 
  type?: string;
  joinable?: string;
  startDate?: string;
  endDate?: string;
}) {
  return challenges.filter(challenge => {
    // isActiveフィルタ
    if (filters.isActive !== undefined) {
      const isActiveFilter = filters.isActive === 'true';
      if (challenge.isActive !== isActiveFilter) {
        return false;
      }
    }

    // typeフィルタ
    if (filters.type && challenge.type !== filters.type) {
      return false;
    }

    // joinableフィルタ（参加可能かどうか）
    if (filters.joinable === 'true') {
      // 満員チェック
      if (challenge.participants >= challenge.maxParticipants) {
        return false;
      }
      // 期間チェック（開始前または終了後は参加不可）
      const now = new Date();
      const startDate = new Date(challenge.startDate);
      const endDate = new Date(challenge.endDate);
      if (now < startDate || now > endDate) {
        return false;
      }
      // 非アクティブは参加不可
      if (!challenge.isActive) {
        return false;
      }
    }

    // 日付範囲フィルタ
    if (filters.startDate || filters.endDate) {
      const challengeStart = new Date(challenge.startDate);
      const challengeEnd = new Date(challenge.endDate);
      
      if (filters.startDate) {
        const filterStart = new Date(filters.startDate);
        if (challengeEnd < filterStart) {
          return false;
        }
      }
      
      if (filters.endDate) {
        const filterEnd = new Date(filters.endDate);
        if (challengeStart > filterEnd) {
          return false;
        }
      }
    }

    return true;
  });
}

// GET: チャレンジ一覧取得
export async function GET(request: NextRequest) {
  try {
    // チャレンジは公開情報なので認証は不要
    // const user = await getAuthenticatedUser();

    // URLパラメータの解析
    const { searchParams } = new URL(request.url);
    
    // バリデーション
    const validationError = validateQueryParams(searchParams);
    if (validationError) {
      return createErrorResponse(validationError, 400);
    }

    const isActive = searchParams.get('isActive');
    const type = searchParams.get('type');
    const joinable = searchParams.get('joinable');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const includeDetails = searchParams.get('includeDetails');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');
    
    // ページネーションパラメータ
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let challenges;

    // クエリパラメータに応じてデータ取得
    if (includeDetails === 'true') {
      challenges = await getChallengesWithDetails();
    } else if (isActive === 'true' && !type && !joinable && !startDate && !endDate) {
      challenges = await getActiveChallenges();
    } else if (type && !isActive && !joinable && !startDate && !endDate) {
      challenges = await getChallengesByType(type as 'weekly' | 'monthly' | 'seasonal' | 'special');
    } else {
      // 複数フィルタがある場合やページネーション対応のためgetAllChallengesを使用
      challenges = await getAllChallenges();
    }

    // フィルタリング（データベースクエリで取得していないフィルタのみ適用）
    const filters: any = {};
    
    // データベースクエリで既に適用されていないフィルタを追加
    const usedActiveChallengesQuery = (isActive === 'true' && !type && !joinable && !startDate && !endDate);
    const usedTypeChallengesQuery = (type && !isActive && !joinable && !startDate && !endDate);
    
    if (!usedActiveChallengesQuery && isActive) {
      filters.isActive = isActive;
    }
    if (!usedTypeChallengesQuery && type) {
      filters.type = type;
    }
    
    // joinable、日付フィルタは常に後処理で適用
    if (joinable) filters.joinable = joinable;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    
    const hasFilters = Object.keys(filters).length > 0;
    
    if (hasFilters) {
      challenges = filterChallenges(challenges, filters);
    }

    // ソート
    if (sortBy) {
      challenges = sortChallenges(challenges, sortBy, sortOrder as 'asc' | 'desc' | undefined);
    }

    // レスポンスデータの構築
    const responseData: any = { challenges };
    
    // ページネーション情報の追加
    if (page > 1 || limit !== 20) {
      responseData.pagination = {
        page,
        limit,
        total: challenges.length,
        hasNext: challenges.length === limit,
        hasPrev: page > 1
      };
    }

    return createSuccessResponse(responseData);
  } catch (error) {
    console.error('GET /api/challenges error:', error);
    return createServerErrorResponse();
  }
}