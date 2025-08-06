'use client';

import type { AuthError, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase/client';
import { getNetworkErrorMessage, sanitizeApiError } from '@/utils/errorHandler';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期認証状態の取得
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const safeMessage = sanitizeApiError(data.error);
        return { error: { message: safeMessage } as AuthError };
      }

      // サインイン成功後、middlewareが適切にリダイレクト処理を行う
      // 少し待機してからページを再読み込みして、サーバーサイドの認証状態を反映
      setTimeout(() => {
        window.location.href = '/';
      }, 100);

      return { error: null };
    } catch {
      return {
        error: {
          message: getNetworkErrorMessage(),
        } as AuthError,
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const safeMessage = sanitizeApiError(data.error);
        return { error: { message: safeMessage } as AuthError };
      }

      return { error: null };
    } catch {
      return {
        error: {
          message: getNetworkErrorMessage(),
        } as AuthError,
      };
    }
  };

  const signOut = async () => {
    try {
      // クライアントサイドでのサインアウト
      await supabase.auth.signOut();

      // サーバーサイドのセッションもクリア
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // サインインページにリダイレクト
      window.location.href = '/auth/signin';
    } catch {
      // エラーが発生してもサインインページにリダイレクト
      window.location.href = '/auth/signin';
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
