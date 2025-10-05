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
    <div className="bg-gray flex min-h-screen items-center justify-center px-4 py-12 dark:bg-gray sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="text-gray mt-6 text-3xl font-extrabold dark:text-gray">
            エラーが発生しました
          </h2>
          <p className="text-gray mt-2 text-sm dark:text-gray">
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
