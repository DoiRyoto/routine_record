import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

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
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

    // Supabase Authでサインイン
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: sanitizedPassword,
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: '認証情報が正しくありません'
      }, { status: 401 });
    }

    if (!data.user || !data.session) {
      return NextResponse.json({ 
        success: false,
        error: '認証情報が正しくありません' 
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'サインインに成功しました',
    });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ 
      success: false,
      error: '一時的なエラーが発生しました。しばらく経ってから再度お試しください' 
    }, { status: 500 });
  }
}
