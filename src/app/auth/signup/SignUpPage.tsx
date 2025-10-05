'use client';

import Link from 'next/link';
import React, { useState } from 'react';


import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(email, password);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      // サインアップ成功時、自動サインインされるためダッシュボードにリダイレクト
      // AuthContextのonAuthStateChangeで自動リダイレクトされるため、ここでは何もしない
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8 dark:bg-black">
        <div className="w-full max-w-md space-y-8">
          <Card>
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">✅ 登録完了</h2>
              <p className="mb-6 text-black dark:text-white">
                確認メールを送信しました。
                <br />
                メール内のリンクをクリックしてアカウントを有効化してください。
              </p>
              <Link href="/auth/signin">
                <Button>サインインページへ</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-black dark:text-white">
            アカウント登録
          </h2>
          <p className="mt-2 text-center text-sm text-black dark:text-white">
            すでにアカウントをお持ちの方は{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-black underline dark:text-white"
            >
              こちらからサインイン
            </Link>
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md border border-black p-4 dark:border-white">
                <p className="text-sm text-black dark:text-white">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black dark:text-white"
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
                className="relative mt-1 block w-full appearance-none rounded-md border border-black bg-white px-3 py-2 text-black focus:z-10 focus:border-black focus:ring-black focus:outline-none sm:text-sm dark:border-white dark:bg-black dark:text-white"
                placeholder="メールアドレスを入力"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-black dark:text-white"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative mt-1 block w-full appearance-none rounded-md border border-black bg-white px-3 py-2 text-black focus:z-10 focus:border-black focus:ring-black focus:outline-none sm:text-sm dark:border-white dark:bg-black dark:text-white"
                placeholder="パスワードを入力（6文字以上）"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-black dark:text-white"
              >
                パスワード確認
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="relative mt-1 block w-full appearance-none rounded-md border border-black bg-white px-3 py-2 text-black focus:z-10 focus:border-black focus:ring-black focus:outline-none sm:text-sm dark:border-white dark:bg-black dark:text-white"
                placeholder="パスワードを再入力"
              />
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '登録中...' : 'アカウント登録'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
