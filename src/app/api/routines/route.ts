import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getRoutines, createRoutine } from '@/lib/db/queries/routines';
import { getServerErrorMessage } from '@/utils/errorHandler';

// GET: ルーチン一覧取得
export async function GET(request: NextRequest) {
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

    const routines = await getRoutines(user.id);

    return NextResponse.json({
      success: true,
      data: routines,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: getServerErrorMessage() },
      { status: 500 }
    );
  }
}

// POST: ルーチン作成
export async function POST(request: NextRequest) {
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

    const { name, description, category, targetFrequency, targetCount } = await request.json();

    // バリデーション
    if (!name || !description || !category || !targetFrequency) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    const newRoutine = await createRoutine({
      userId: user.id,
      name,
      description,
      category,
      targetFrequency,
      targetCount: targetCount || null,
    });

    return NextResponse.json({
      success: true,
      message: 'ルーチンが作成されました',
      data: newRoutine,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: getServerErrorMessage() },
      { status: 500 }
    );
  }
}