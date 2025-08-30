import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
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
                // Cookie をクリア
                const clearOptions = {
                  ...options,
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax' as const,
                  path: '/',
                  maxAge: 0, // Cookie をクリア
                };
                cookieStore.set(name, '', clearOptions);
              });
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    );

    // サーバーサイドでサインアウト実行
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'サインアウトしました',
    });
  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json({ 
      success: false,
      error: '一時的なエラーが発生しました。しばらく経ってから再度お試しください' 
    }, { status: 500 });
  }
}
