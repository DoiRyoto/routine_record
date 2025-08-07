import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { users, userSettings } from '@/lib/db/schema';
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

      // デフォルトカテゴリの自動作成は削除
    } catch (error) {
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
