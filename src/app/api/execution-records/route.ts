import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getExecutionRecords, createExecutionRecord, getExecutionRecordsByDateRange } from '@/lib/db/queries/execution-records';
import { getServerErrorMessage } from '@/utils/errorHandler';

// GET: 実行記録一覧取得
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

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: getServerErrorMessage() },
      { status: 500 }
    );
  }
}

// POST: 実行記録作成
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

    const { routineId, executedAt, duration, memo, isCompleted } = await request.json();

    // バリデーション
    if (!routineId) {
      return NextResponse.json(
        { error: 'ルーチンIDが必要です' },
        { status: 400 }
      );
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

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: getServerErrorMessage() },
      { status: 500 }
    );
  }
}