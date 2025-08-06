import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  // セキュリティ設定
  poweredByHeader: false, // X-Powered-By ヘッダーを無効化

  // エラー処理とコンソール設定
  compiler: {
    removeConsole: true, // 全てのコンソールログを削除
  },

  // Next.jsのエラーページを無効化して詳細情報を隠す
  productionBrowserSourceMaps: false,

  // レスポンスヘッダーのセキュリティ設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
