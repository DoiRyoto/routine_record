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
      <div className="flex min-h-screen items-center justify-center bg-gray px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray">
        <div className="w-full max-w-md space-y-8">
          <Card>
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray dark:text-gray">✅ 登録完了</h2>
              <p className="mb-6 text-gray dark:text-gray">
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
    <div className="flex min-h-screen items-center justify-center bg-gray px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray dark:text-gray">
            アカウント登録
          </h2>
          <p className="mt-2 text-center text-sm text-gray dark:text-gray">
            すでにアカウントをお持ちの方は{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-blue hover:text-blue dark:text-blue"
            >
              こちらからサインイン
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dark:border-dark-gray dark:bg-dark-gray dark:text-gray dark:placeholder-gray relative mt-1 block w-full appearance-none rounded-md border border-gray bg-white px-3 py-2 text-gray placeholder-gray focus:z-10 focus:border-blue focus:ring-blue focus:outline-none sm:text-sm"
                placeholder="パスワードを入力（6文字以上）"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray dark:text-gray"
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
                className="dark:border-dark-gray dark:bg-dark-gray dark:text-gray dark:placeholder-gray relative mt-1 block w-full appearance-none rounded-md border border-gray bg-white px-3 py-2 text-gray placeholder-gray focus:z-10 focus:border-blue focus:ring-blue focus:outline-none sm:text-sm"
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
