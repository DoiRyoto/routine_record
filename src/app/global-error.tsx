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
        <div className="min-h-screen flex items-center justify-center bg-gray py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue hover:bg-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
              >
                再試行
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full flex justify-center py-2 px-4 border border-gray rounded-md shadow-sm text-sm font-medium text-gray bg-white hover:bg-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue"
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
