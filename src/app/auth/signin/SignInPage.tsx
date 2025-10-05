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
    <div className="bg-gray flex min-h-screen items-center justify-center px-4 py-12 dark:bg-gray sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-gray mt-6 text-center text-3xl font-extrabold dark:text-gray">
            サインイン
          </h2>
          <p className="text-gray mt-2 text-center text-sm dark:text-gray">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/auth/signup"
              className="text-blue font-medium hover:text-blue dark:text-blue"
            >
              こちらから登録
            </Link>
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="text-gray block text-sm font-medium dark:text-gray"
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
                className="border-gray placeholder-gray text-gray relative mt-1 block w-full appearance-none rounded-md border bg-white px-3 py-2 dark:border-dark-gray dark:placeholder-gray dark:text-gray dark:bg-dark-gray focus:ring-blue focus:border-blue focus:z-10 focus:outline-none sm:text-sm"
                placeholder="メールアドレスを入力"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-gray block text-sm font-medium dark:text-gray"
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
                className="border-gray placeholder-gray text-gray relative mt-1 block w-full appearance-none rounded-md border bg-white px-3 py-2 dark:border-dark-gray dark:placeholder-gray dark:text-gray dark:bg-dark-gray focus:ring-blue focus:border-blue focus:z-10 focus:outline-none sm:text-sm"
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
