import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export interface AuthResult {
  user: AuthenticatedUser | null;
  error: NextResponse | null;
}

export async function authenticateRequest(_request: NextRequest): Promise<AuthResult> {
  try {
    // Create Supabase client
    const cookieStore = cookies();
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

    // Get user from authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        user: null,
        error: NextResponse.json(
          {
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid or expired authentication token'
            }
          },
          { status: 401 }
        )
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email
      },
      error: null
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      user: null,
      error: NextResponse.json(
        {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Authentication failed'
          }
        },
        { status: 500 }
      )
    };
  }
}

export function createErrorResponse(
  code: string,
  message: string,
  status: number,
  additional?: Record<string, any>
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...additional
      }
    },
    { status }
  );
}