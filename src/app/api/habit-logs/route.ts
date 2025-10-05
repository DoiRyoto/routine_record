import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { createHabitLog, getHabitLogs } from '@/lib/db/queries/habits';
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
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('habitId');

    const logs = await getHabitLogs(user.id, habitId || undefined);

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}

// POST: 習慣実行記録（+ボタン）
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

    const { habitId } = await request.json();

    // バリデーション
    if (!habitId) {
      return NextResponse.json({ error: '習慣IDが必要です' }, { status: 400 });
    }

    await createHabitLog(habitId);

    return NextResponse.json({
      success: true,
      message: '実行記録が追加されました',
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}