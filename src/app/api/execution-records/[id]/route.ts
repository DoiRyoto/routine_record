import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import {
  deleteExecutionRecord,
  getExecutionRecords,
  updateExecutionRecord,
} from '@/lib/db/queries/execution-records';
import { getServerErrorMessage } from '@/utils/errorHandler';

// PUT: 実行記録更新
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

    // 実行記録の存在確認とユーザー権限チェック
    const userRecords = await getExecutionRecords(user.id);
    const record = userRecords.find((r) => r.id === resolvedParams.id);

    if (!record) {
      return NextResponse.json({ error: '実行記録が見つかりません' }, { status: 404 });
    }

    const updates = await request.json();
    const updatedRecord = await updateExecutionRecord(resolvedParams.id, {
      ...updates,
      executedAt: updates.executedAt ? new Date(updates.executedAt) : undefined,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: '実行記録が更新されました',
      data: updatedRecord,
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}

// DELETE: 実行記録削除
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

    // 実行記録の存在確認とユーザー権限チェック
    const userRecords = await getExecutionRecords(user.id);
    const record = userRecords.find((r) => r.id === resolvedParams.id);

    if (!record) {
      return NextResponse.json({ error: '実行記録が見つかりません' }, { status: 404 });
    }

    await deleteExecutionRecord(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: '実行記録が削除されました',
    });
  } catch {
    return NextResponse.json({ error: getServerErrorMessage() }, { status: 500 });
  }
}
