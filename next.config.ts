import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // セキュリティ設定
  poweredByHeader: false, // X-Powered-By ヘッダーを無効化
  
  // 本番環境でのエラー処理
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: {
        exclude: ['error'], // エラーログのみ残す
      },
    },
  }),
  
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
