import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import {
  createExecutionRecord,
  getExecutionRecords,
  getExecutionRecordsByDateRange,
} from '@/lib/db/queries/execution-records';
import { getServerErrorMessage } from '@/utils/errorHandler';

// GET: 実行記録一覧取得
export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let records;
    if (startDate && endDate) {
      records = await getExecutionRecordsByDateRange(
        new Date(startDate),
        new Date(endDate),
        user.id
      );
    } else {
      records = await getExecutionRecords(user.id);
    }

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}

// POST: 実行記録作成
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
      return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 });
    }

    const { routineId, executedAt, duration, memo, isCompleted } = await request.json();

    // バリデーション
    if (!routineId) {
      return NextResponse.json({ error: 'ルーチンIDが必要です' }, { status: 400 });
    }

    const newRecord = await createExecutionRecord({
      routineId,
      userId: user.id,
      executedAt: executedAt ? new Date(executedAt) : new Date(),
      duration: duration || null,
      memo: memo || null,
      isCompleted: isCompleted !== undefined ? isCompleted : false,
    });

    return NextResponse.json({
      success: true,
      message: '実行記録が作成されました',
      data: newRecord,
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}
