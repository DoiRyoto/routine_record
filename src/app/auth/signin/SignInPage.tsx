'use client';

import Link from 'next/link';
import React, { useState } from 'react';


import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
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
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-black dark:text-white">
            サインイン
          </h2>
          <p className="mt-2 text-center text-sm text-black dark:text-white">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-black underline dark:text-white"
            >
              こちらから登録
            </Link>
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md border border-black p-4 dark:border-white">
                  <p className="text-sm text-black dark:text-white">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="メールアドレスを入力"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                />
              </div>

              <div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'サインイン中...' : 'サインイン'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
