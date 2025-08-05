import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { updateUserSettings, getOrCreateUserSettings } from '@/lib/db/queries/user-settings';
import { getServerErrorMessage } from '@/utils/errorHandler';

// GET: ユーザー設定取得
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

    const settings = await getOrCreateUserSettings(user.id);

    return NextResponse.json({
      success: true,
      data: settings,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: getServerErrorMessage() },
      { status: 500 }
    );
  }
}

// PUT: ユーザー設定更新
export async function PUT(request: NextRequest) {
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

    const updates = await request.json();
    
    // バリデーション
    const allowedFields = [
      'theme', 'language', 'timeFormat', 
      'dailyGoal', 'weeklyGoal', 'monthlyGoal'
    ];
    
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: Record<string, unknown>, key) => {
        obj[key] = updates[key as keyof typeof updates];
        return obj;
      }, {});

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: '更新可能なフィールドが指定されていません' },
        { status: 400 }
      );
    }

    const updatedSettings = await updateUserSettings(user.id, filteredUpdates);

    return NextResponse.json({
      success: true,
      message: 'ユーザー設定が更新されました',
      data: updatedSettings,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: getServerErrorMessage() },
      { status: 500 }
    );
  }
}