'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // セキュリティのため詳細なエラー情報は記録しない
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray dark:text-gray">
            エラーが発生しました
          </h2>
          <p className="mt-2 text-sm text-gray dark:text-gray">
            予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={reset} className="w-full">
            再試行
          </Button>

          <Button
            onClick={() => (window.location.href = '/')}
            variant="secondary"
            className="w-full"
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
