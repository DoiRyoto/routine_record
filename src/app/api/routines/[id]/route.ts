import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getRoutineById, updateRoutine, deleteRoutine } from '@/lib/db/queries/routines';
import { getServerErrorMessage } from '@/utils/errorHandler';

// GET: 個別ルーチン取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const routine = await getRoutineById(resolvedParams.id);

    if (!routine) {
      return NextResponse.json(
        { error: 'ルーチンが見つかりません' },
        { status: 404 }
      );
    }

    // ユーザーが所有者かチェック
    if (routine.userId !== user.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: routine,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: getServerErrorMessage() },
      { status: 500 }
    );
  }
}

// PUT: ルーチン更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const routine = await getRoutineById(resolvedParams.id);

    if (!routine) {
      return NextResponse.json(
        { error: 'ルーチンが見つかりません' },
        { status: 404 }
      );
    }

    // ユーザーが所有者かチェック
    if (routine.userId !== user.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    const updates = await request.json();
    const updatedRoutine = await updateRoutine(resolvedParams.id, {
      ...updates,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'ルーチンが更新されました',
      data: updatedRoutine,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: getServerErrorMessage() },
      { status: 500 }
    );
  }
}

// DELETE: ルーチン削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証に失敗しました' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const routine = await getRoutineById(resolvedParams.id);

    if (!routine) {
      return NextResponse.json(
        { error: 'ルーチンが見つかりません' },
        { status: 404 }
      );
    }

    // ユーザーが所有者かチェック
    if (routine.userId !== user.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    await deleteRoutine(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'ルーチンが削除されました',
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: getServerErrorMessage() },
      { status: 500 }
    );
  }
}