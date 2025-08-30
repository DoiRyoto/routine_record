import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { createRoutine, getRoutines, type GetRoutinesOptions } from '@/lib/db/queries/routines';
import { 
  validateRoutineInput, 
  sanitizeRoutineInput, 
  type RoutineInput 
} from '@/lib/routines/validation';
import {
  createSuccessResponse,
  createAuthErrorResponse,
  createValidationErrorResponse,
  createServerErrorResponse,
} from '@/lib/routines/responses';
import { logRoutineError, logRoutineSuccess, logRoutinePerformance } from '@/lib/routines/logging';

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

// GET: ルーチン一覧取得
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      logRoutineError(
        { action: 'GET_ROUTINES', timestamp: new Date() },
        'Unauthenticated access attempt'
      );
      return createAuthErrorResponse();
    }

    userId = user.id;

    // URLパラメータの解析
    const { searchParams } = new URL(request.url);
    const options: GetRoutinesOptions = {
      category: searchParams.get('category') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '50'), 100), // 最大100件制限
    };

    const routines = await getRoutines(user.id, options);

    const duration = Date.now() - startTime;
    logRoutinePerformance(
      { userId: user.id, action: 'GET_ROUTINES' },
      'get_routines',
      duration
    );

    logRoutineSuccess(
      { userId: user.id, action: 'GET_ROUTINES' },
      `Retrieved ${routines.length} routines`
    );

    return createSuccessResponse(routines);
  } catch (error) {
    const duration = Date.now() - startTime;
    logRoutineError(
      { 
        userId, 
        action: 'GET_ROUTINES', 
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: new Date()
      },
      'Failed to retrieve routines'
    );
    return createServerErrorResponse();
  }
}

// POST: ルーチン作成
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  let requestData: any;

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      logRoutineError(
        { action: 'CREATE_ROUTINE', timestamp: new Date() },
        'Unauthenticated routine creation attempt'
      );
      return createAuthErrorResponse();
    }

    userId = user.id;
    requestData = await request.json();

    // 入力値のサニタイズ
    const sanitizedData = sanitizeRoutineInput(requestData);

    // バリデーション
    const validationResult = validateRoutineInput(sanitizedData);
    if (!validationResult.isValid) {
      logRoutineError(
        { 
          userId: user.id, 
          action: 'CREATE_ROUTINE',
          requestData: sanitizedData,
          timestamp: new Date()
        },
        `Validation failed: ${validationResult.error}`
      );
      return createValidationErrorResponse(validationResult.error!);
    }

    // ルーチン作成
    const newRoutine = await createRoutine({
      ...sanitizedData,
      userId: user.id,
    });

    const duration = Date.now() - startTime;
    logRoutinePerformance(
      { userId: user.id, routineId: newRoutine.id, action: 'CREATE_ROUTINE' },
      'create_routine',
      duration
    );

    logRoutineSuccess(
      { userId: user.id, routineId: newRoutine.id, action: 'CREATE_ROUTINE' },
      `Routine created: ${newRoutine.name}`
    );

    return createSuccessResponse(
      { routine: newRoutine },
      'ルーチンが作成されました',
      201
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    logRoutineError(
      { 
        userId,
        action: 'CREATE_ROUTINE',
        requestData,
        error: error instanceof Error ? error : new Error(String(error)),
        timestamp: new Date()
      },
      'Failed to create routine'
    );
    return createServerErrorResponse();
  }
}
