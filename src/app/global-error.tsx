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
        <div className="flex min-h-screen items-center justify-center bg-gray px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8 text-center">
            <div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray">システムエラー</h2>
              <p className="mt-2 text-sm text-gray">
                申し訳ございません。システムで問題が発生しました。
                サポートまでお問い合わせください。
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={reset}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue focus:ring-2 focus:ring-blue focus:ring-offset-2 focus:outline-none"
              >
                再試行
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="flex w-full justify-center rounded-md border border-gray bg-white px-4 py-2 text-sm font-medium text-gray shadow-sm hover:bg-gray focus:ring-2 focus:ring-blue focus:ring-offset-2 focus:outline-none"
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
