'use client';

import Link from 'next/link';
import React, { useState } from 'react';


import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
    // サインイン成功時、AuthContextでリダイレクトされる
    // エラーがない場合はローディング状態を維持してリダイレクトを待つ
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray dark:text-gray">
            サインイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray dark:text-gray">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-blue hover:text-blue dark:text-blue"
            >
              こちらから登録
            </Link>
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 rounded-md p-4 dark:bg-red-900/20">
                <p className="text-red-800 text-sm dark:text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray dark:text-gray"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dark:border-dark-gray dark:bg-dark-gray dark:text-gray dark:placeholder-gray relative mt-1 block w-full appearance-none rounded-md border border-gray bg-white px-3 py-2 text-gray placeholder-gray focus:z-10 focus:border-blue focus:ring-blue focus:outline-none sm:text-sm"
                placeholder="メールアドレスを入力"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray dark:text-gray"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dark:border-dark-gray dark:bg-dark-gray dark:text-gray dark:placeholder-gray relative mt-1 block w-full appearance-none rounded-md border border-gray bg-white px-3 py-2 text-gray placeholder-gray focus:z-10 focus:border-blue focus:ring-blue focus:outline-none sm:text-sm"
                placeholder="パスワードを入力"
              />
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'サインイン中...' : 'サインイン'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
