import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { createHabit, getHabits } from '@/lib/db/queries/habits';
import { getServerErrorMessage } from '@/utils/errorHandler';

// GET: 習慣一覧取得
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

    const userHabits = await getHabits(user.id);

    return NextResponse.json({
      success: true,
      data: userHabits,
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}

// POST: 習慣作成
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

    const habitData = await request.json();
    const { name, frequencyType, targetCount } = habitData;

    // バリデーション
    if (!name || !frequencyType || !targetCount) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    if (targetCount < 1) {
      return NextResponse.json({ error: '目標回数は1以上にしてください' }, { status: 400 });
    }

    const newHabit = await createHabit({
      userId: user.id,
      name,
      frequencyType,
      targetCount,
    });

    return NextResponse.json({
      success: true,
      message: '習慣が作成されました',
      data: newHabit,
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}