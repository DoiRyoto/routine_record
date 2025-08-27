import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import {
  getRoutineById,
  restoreRoutine,
  softDeleteRoutine,
  updateRoutine,
} from '@/lib/db/queries/routines';
import { getServerErrorMessage } from '@/utils/errorHandler';

// GET: 個別ルーチン取得
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await params;
    const routine = await getRoutineById(resolvedParams.id);

    if (!routine) {
      return NextResponse.json({ error: 'ルーチンが見つかりません' }, { status: 404 });
    }

    // ユーザーが所有者かチェック
    if (routine.userId !== user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: routine,
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}

// PUT: ルーチン更新
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await params;
    const routine = await getRoutineById(resolvedParams.id);

    if (!routine) {
      return NextResponse.json({ error: 'ルーチンが見つかりません' }, { status: 404 });
    }

    // ユーザーが所有者かチェック
    if (routine.userId !== user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    const updates = await request.json();

    // 更新可能なフィールドのみを抽出
    const allowedFields = {
      name: updates.name,
      description: updates.description,
      category: updates.category,
      goalType: updates.goalType,
      targetCount: updates.targetCount,
      targetPeriod: updates.targetPeriod,
      recurrenceType: updates.recurrenceType,
      recurrenceInterval: updates.recurrenceInterval,
      monthlyType: updates.monthlyType,
      dayOfMonth: updates.dayOfMonth,
      weekOfMonth: updates.weekOfMonth,
      dayOfWeek: updates.dayOfWeek,
      daysOfWeek: updates.daysOfWeek,
      startDate: updates.startDate,
      isActive: updates.isActive,
      updatedAt: new Date(),
    };

    // undefinedの値を除去
    const filteredUpdates = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, value]) => value !== undefined)
    );

    const updatedRoutine = await updateRoutine(resolvedParams.id, filteredUpdates);

    return NextResponse.json({
      success: true,
      message: 'ルーチンが更新されました',
      data: updatedRoutine,
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}

// DELETE: ルーチン削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const routine = await getRoutineById(resolvedParams.id);

    if (!routine) {
      return NextResponse.json({ error: 'ルーチンが見つかりません' }, { status: 404 });
    }

    // ユーザーが所有者かチェック
    if (routine.userId !== user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    await softDeleteRoutine(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'ルーチンが削除されました',
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}

// PATCH: ルーチン復元
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await params;

    // 削除されたルーチンを復元
    const restoredRoutine = await restoreRoutine(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'ルーチンが復元されました',
      data: restoredRoutine,
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}
