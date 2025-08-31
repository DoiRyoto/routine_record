'use client';

import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import { signInSchema, type SignInFormData } from '@/lib/validations/auth';

import { Button } from '@/common/components/ui/Button';
import { Card } from '@/common/components/ui/Card';
import { Input } from '@/common/components/ui/Input';
import { Label } from '@/common/components/ui/Label';
import { useAuth } from '@/common/context/AuthContext';


export default function SignInPageImproved() {
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignInFormData) => {
    setError(null);

    const { error: signInError } = await signIn(data.email, data.password);

    if (signInError) {
      setError(signInError.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray dark:bg-dark-gray py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray dark:text-white">
            サインイン
          </h1>
          <p className="mt-2 text-center text-sm text-gray/70 dark:text-gray/90">
            アカウントをお持ちでない方は{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-blue hover:text-dark-blue dark:text-blue dark:hover:text-blue focus:outline-none focus:underline"
            >
              こちらから登録
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
                  autoComplete="current-password"
                  placeholder="パスワードを入力"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
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

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !isValid}
                aria-describedby={error ? 'global-error' : undefined}
              >
                {isSubmitting ? (
                  <>
                    <span className="sr-only">サインイン中</span>
                    <span aria-hidden="true">サインイン中...</span>
                  </>
                ) : (
                  'サインイン'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}