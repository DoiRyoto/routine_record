import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { users, userSettings, userProfiles, categories, gameNotifications } from '@/lib/db/schema';
import { supabaseAdmin } from '@/lib/supabase/server';

// バリデーション関数
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
  return password && password.length >= 8;
}

function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '');
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ 
      success: false,
      error: '一時的なエラーが発生しました。しばらく経ってから再度お試しください' 
    }, { status: 500 });
  }

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
            cookiesToSet.forEach(({ name, value, options }) => {
              const secureOptions = {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                path: '/',
              };
              cookieStore.set(name, value, secureOptions);
            });
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

    // 入力値のサニタイズ
    const sanitizedEmail = email ? sanitizeInput(email.trim()) : '';
    const sanitizedPassword = password ? sanitizeInput(password) : '';

    // バリデーション
    if (!sanitizedEmail) {
      return NextResponse.json({ 
        success: false,
        error: '入力内容に誤りがあります: emailが必要です' 
      }, { status: 400 });
    }

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ 
        success: false,
        error: '入力内容に誤りがあります: email形式が正しくありません' 
      }, { status: 400 });
    }

    if (!sanitizedPassword) {
      return NextResponse.json({ 
        success: false,
        error: '入力内容に誤りがあります: passwordが必要です' 
      }, { status: 400 });
    }

    if (!validatePassword(sanitizedPassword)) {
      return NextResponse.json({ 
        success: false,
        error: '入力内容に誤りがあります: passwordは8文字以上である必要があります' 
      }, { status: 400 });
    }

    // Supabase Authでユーザー作成
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: sanitizedEmail,
      password: sanitizedPassword,
      email_confirm: true, // 開発環境では自動確認
    });

    if (error) {
      // ユーザー向けには安全なエラーメッセージのみ返す
      if (error.message?.includes('already registered')) {
        return NextResponse.json({ 
          success: false,
          error: 'このメールアドレスは既に登録されています' 
        }, { status: 409 });
      }
      
      return NextResponse.json({ 
        success: false,
        error: '一時的なエラーが発生しました。しばらく経ってから再度お試しください' 
      }, { status: 500 });
    }

    if (!data.user) {
      return NextResponse.json({ 
        success: false,
        error: '一時的なエラーが発生しました。しばらく経ってから再度お試しください' 
      }, { status: 500 });
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

      return NextResponse.json({ 
        success: false,
        error: '一時的なエラーが発生しました。しばらく経ってから再度お試しください' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'アカウントが作成されました。確認メールをご確認ください。',
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ 
      success: false,
      error: '一時的なエラーが発生しました。しばらく経ってから再度お試しください' 
    }, { status: 500 });
  }
}
