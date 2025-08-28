import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { users, userSettings, userProfiles, categories, gameNotifications } from '@/lib/db/schema';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
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
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  try {
    const { email, password } = await request.json();

    // バリデーション
    if (!email || !password) {
      return NextResponse.json({ error: 'メールアドレスとパスワードが必要です' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上で入力してください' },
        { status: 400 }
      );
    }

    // Supabase Authでユーザー作成
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 開発環境では自動確認
    });

    if (error) {
      // ユーザー向けには安全なエラーメッセージのみ返す
      let userMessage = 'ユーザー登録に失敗しました';

      if (error.message?.includes('already registered')) {
        userMessage = 'このメールアドレスは既に登録されています';
      } else if (error.message?.includes('email')) {
        userMessage = 'メールアドレスの形式が正しくありません';
      } else if (error.message?.includes('password')) {
        userMessage = 'パスワードの形式が正しくありません';
      }

      return NextResponse.json({ error: userMessage }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: 'ユーザー作成に失敗しました' }, { status: 500 });
    }

    // データベースにユーザー情報と設定の初期データを作成
    try {
      // ユーザーテーブルにユーザー情報を挿入
      await db.insert(users).values({
        id: data.user.id,
        email: data.user.email!,
        emailVerified: data.user.email_confirmed_at ? true : false,
        timezone: 'Asia/Tokyo', // デフォルトタイムゾーンを日本時間に設定
        createdAt: new Date(data.user.created_at),
        updatedAt: new Date(),
      });

      // ユーザー設定テーブルに初期設定を挿入
      await db.insert(userSettings).values({
        userId: data.user.id,
        theme: 'auto',
        language: 'ja',
        timeFormat: '24h',
      });

      // ユーザープロフィール（ゲーミフィケーション）の初期データを作成
      await db.insert(userProfiles).values({
        userId: data.user.id,
        level: 1,
        totalXP: 0,
        currentXP: 0,
        nextLevelXP: 100,
        streak: 0,
        longestStreak: 0,
        totalRoutines: 0,
        totalExecutions: 0,
        joinedAt: new Date(),
        lastActiveAt: new Date(),
      });

      // デフォルトカテゴリを作成
      const defaultCategories = [
        { name: '健康', color: '#4CAF50' },
        { name: '学習', color: '#2196F3' },
        { name: '仕事', color: '#FF9800' },
        { name: '趣味', color: '#E91E63' },
      ];

      for (const category of defaultCategories) {
        await db.insert(categories).values({
          userId: data.user.id,
          name: category.name,
          color: category.color,
          isDefault: true,
          isActive: true,
        });
      }

      // TODO: 初心者向けミッション自動開始（missionsテーブルにデータが必要）
      // 現在は無効なmissionIdでエラーになるため一時的にコメントアウト
      // await db.insert(userMissions).values({
      //   userId: data.user.id,
      //   missionId: 'valid-uuid-here', // 実際のmissionのUUIDが必要
      //   progress: 0,
      //   isCompleted: false,
      //   startedAt: new Date(),
      //   completedAt: null,
      //   claimedAt: null,
      // });

      // ウェルカム通知を作成
      await db.insert(gameNotifications).values({
        userId: data.user.id,
        type: 'level_up',
        title: 'ルーチン記録へようこそ！',
        message: '習慣化の旅が始まります。最初のルーティンを作成してみましょう！',
        data: JSON.stringify({ welcomeMessage: true, level: 1 }),
        isRead: false,
      });
    } catch (settingsError) {
      console.error('User settings creation failed:', settingsError);
      // データベースエラーの場合、Supabaseのユーザーを削除
      try {
        await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      } catch {
        // クリーンアップに失敗
      }

      return NextResponse.json({ error: 'ユーザー情報の作成に失敗しました' }, { status: 500 });
    }

    // ユーザー作成成功後、自動的にサインインしてセッションを開始
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // サインインに失敗してもユーザー作成は成功しているので、成功として返す
      return NextResponse.json({
        success: true,
        message: 'ユーザー登録が完了しました。サインインページでログインしてください。',
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'ユーザー登録が完了しました',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch {
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
