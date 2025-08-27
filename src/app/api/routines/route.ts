import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { createRoutine, getRoutines } from '@/lib/db/queries/routines';
import { getServerErrorMessage } from '@/utils/errorHandler';

// GET: ルーチン一覧取得
export async function GET(_request: NextRequest) {
  try {
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
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const routines = await getRoutines(user.id);

    return NextResponse.json({
      success: true,
      data: routines,
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}

// POST: ルーチン作成
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const routineData = await request.json();
    const { name, description, category, goalType, targetCount, targetPeriod, recurrenceType } = routineData;

    // バリデーション
    if (!name || !category || !goalType || !recurrenceType) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    // 頻度ベースの場合は targetCount と targetPeriod が必要
    if (goalType === 'frequency_based' && (!targetCount || !targetPeriod)) {
      return NextResponse.json({ error: '頻度ベースミッションには目標回数と期間が必要です' }, { status: 400 });
    }

    const newRoutine = await createRoutine({
      ...routineData,
      userId: user.id,
      description: description || null,
      targetCount: targetCount || null,
    });

    return NextResponse.json({
      success: true,
      message: 'ルーチンが作成されました',
      data: newRoutine,
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}
