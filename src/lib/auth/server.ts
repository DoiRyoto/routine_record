import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * サーバーサイドでSupabaseクライアントを作成
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
}

/**
 * 現在認証済みのユーザーを取得
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

/**
 * 認証が必要なページで使用。未認証の場合はサインインページにリダイレクト
 */
export async function requireAuth(redirectTo?: string): Promise<User> {
  // E2Eテストモード: 認証をスキップし、ダミーユーザーを返す
  if (process.env.E2E_TEST_MODE === 'true') {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
    } as User;
  }

  const user = await getCurrentUser();

  if (!user) {
    const params = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';
    redirect(`/auth/signin${params}`);
  }

  return user;
}

/**
 * セッションとユーザー情報を同時に取得
 */
export async function getServerSession() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return { session: null, user: null };
    }

    return { session, user: session.user };
  } catch {
    return { session: null, user: null };
  }
}

/**
 * サーバーサイドでのサインアウト
 */
export async function serverSignOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/auth/signin');
}
