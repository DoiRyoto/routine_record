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
      <div className="bg-gray flex min-h-screen items-center justify-center px-4 py-12 dark:bg-gray sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Card>
            <div className="text-center">
              <h2 className="text-gray mb-4 text-2xl font-bold dark:text-gray">✅ 登録完了</h2>
              <p className="text-gray mb-6 dark:text-gray">
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
    <div className="bg-gray flex min-h-screen items-center justify-center px-4 py-12 dark:bg-gray sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-gray mt-6 text-center text-3xl font-extrabold dark:text-gray">
            アカウント登録
          </h2>
          <p className="text-gray mt-2 text-center text-sm dark:text-gray">
            すでにアカウントをお持ちの方は{' '}
            <Link
              href="/auth/signin"
              className="text-blue font-medium hover:text-blue dark:text-blue"
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray placeholder-gray text-gray relative mt-1 block w-full appearance-none rounded-md border bg-white px-3 py-2 dark:border-dark-gray dark:placeholder-gray dark:text-gray dark:bg-dark-gray focus:ring-blue focus:border-blue focus:z-10 focus:outline-none sm:text-sm"
                placeholder="パスワードを入力（6文字以上）"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-gray block text-sm font-medium dark:text-gray"
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
                className="border-gray placeholder-gray text-gray relative mt-1 block w-full appearance-none rounded-md border bg-white px-3 py-2 dark:border-dark-gray dark:placeholder-gray dark:text-gray dark:bg-dark-gray focus:ring-blue focus:border-blue focus:z-10 focus:outline-none sm:text-sm"
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
