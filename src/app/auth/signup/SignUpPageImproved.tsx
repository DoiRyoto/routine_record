'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/context/AuthContext';
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth';

export default function SignUpPageImproved() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);

    const { error: signUpError } = await signUp(data.email, data.password);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray dark:bg-dark-gray py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="p-8">
            <div className="text-center">
              <div className="text-4xl mb-4" aria-hidden="true">✅</div>
              <h1 className="text-2xl font-bold text-gray dark:text-white mb-4">
                登録完了
              </h1>
              <p className="text-gray dark:text-gray mb-6">
                確認メールを送信しました。
                <br />
                メール内のリンクをクリックしてアカウントを有効化してください。
              </p>
              <Link href="/auth/signin">
                <Button className="w-full">サインインページへ</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray dark:bg-dark-gray py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray dark:text-white">
            アカウント登録
          </h1>
          <p className="mt-2 text-center text-sm text-gray/70 dark:text-gray/90">
            すでにアカウントをお持ちの方は{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-blue hover:text-dark-blue dark:text-blue dark:hover:text-blue focus:outline-none focus:underline"
            >
              こちらからサインイン
            </Link>
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Global Error Message */}
            {error && (
              <div 
                className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-6"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm text-red-800 dark:text-red-200" id="global-error">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  メールアドレス
                </Label>
                <Input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="メールアドレスを入力"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p 
                    id="email-error" 
                    className="text-sm text-red-600 dark:text-red-400" 
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  パスワード
                </Label>
                <Input
                  {...register('password')}
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="パスワードを入力（6文字以上、大文字・小文字・数字を含む）"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error password-help' : 'password-help'}
                />
                <p id="password-help" className="text-xs text-gray/60 dark:text-gray/80">
                  大文字、小文字、数字を含む6文字以上で入力してください
                </p>
                {errors.password && (
                  <p 
                    id="password-error" 
                    className="text-sm text-red-600 dark:text-red-400" 
                    role="alert"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  パスワード確認
                </Label>
                <Input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="パスワードを再入力"
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                />
                {errors.confirmPassword && (
                  <p 
                    id="confirm-password-error" 
                    className="text-sm text-red-600 dark:text-red-400" 
                    role="alert"
                  >
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !isValid}
                aria-describedby={error ? 'global-error' : undefined}
              >
                {isSubmitting ? (
                  <>
                    <span className="sr-only">登録中</span>
                    <span aria-hidden="true">登録中...</span>
                  </>
                ) : (
                  'アカウント登録'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}