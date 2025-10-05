'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8 dark:bg-black">
          <div className="w-full max-w-md space-y-8 text-center">
            <div>
              <h2 className="mt-6 text-3xl font-extrabold text-black dark:text-white">システムエラー</h2>
              <p className="mt-2 text-sm text-black dark:text-white">
                申し訳ございません。システムで問題が発生しました。
                サポートまでお問い合わせください。
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={reset}
                className="flex w-full justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-lg focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none dark:bg-white dark:text-black dark:focus:ring-white"
              >
                再試行
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="flex w-full justify-center rounded-md border border-black bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:shadow-lg focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none dark:border-white dark:bg-black dark:text-white dark:focus:ring-white"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
