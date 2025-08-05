import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getExecutionRecords, updateExecutionRecord, deleteExecutionRecord } from '@/lib/db/queries/execution-records';
import { getServerErrorMessage } from '@/utils/errorHandler';

// PUT: 実行記録更新
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
    
    // 実行記録の存在確認とユーザー権限チェック
    const userRecords = await getExecutionRecords(user.id);
    const record = userRecords.find(r => r.id === resolvedParams.id);

    if (!record) {
      return NextResponse.json(
        { error: '実行記録が見つかりません' },
        { status: 404 }
      );
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

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: getServerErrorMessage() },
      { status: 500 }
    );
  }
}

// DELETE: 実行記録削除
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
    
    // 実行記録の存在確認とユーザー権限チェック
    const userRecords = await getExecutionRecords(user.id);
    const record = userRecords.find(r => r.id === resolvedParams.id);

    if (!record) {
      return NextResponse.json(
        { error: '実行記録が見つかりません' },
        { status: 404 }
      );
    }

    await deleteExecutionRecord(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: '実行記録が削除されました',
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: getServerErrorMessage() },
      { status: 500 }
    );
  }
}