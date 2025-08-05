'use client';

import { useEffect } from 'react';
import Button from '@/components/Common/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            エラーが発生しました
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            予期しないエラーが発生しました。しばらく時間をおいて再度お試しください。
          </p>
          {/* 開発環境でのみエラー詳細を表示 */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                開発者向け詳細情報
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={reset}
            className="w-full"
          >
            再試行
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
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