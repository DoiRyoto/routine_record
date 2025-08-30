# 技術スタック

## フロントエンド
- **Next.js**: 15.4.5 (App Router)
- **React**: 19.1.0
- **TypeScript**: ^5 (strict mode有効)
- **Tailwind CSS**: ^4
- **Radix UI**: コンポーネントライブラリ (@radix-ui/react-*)

## バックエンド・データベース
- **Supabase**: 認証・データベース・リアルタイム機能
- **Drizzle ORM**: 0.44.4 (PostgreSQLアクセス)
- **PostgreSQL**: Supabaseでホスト

## 開発ツール・テスト
- **ESLint**: コード品質管理 (Next.js + TypeScript設定)
- **Prettier**: コード整形
- **Jest**: 30.1.1 (ユニットテスト)
- **Testing Library**: React コンポーネントテスト
- **Playwright**: E2Eテスト
- **Storybook**: コンポーネントカタログ

## アーキテクチャパターン
- **Clean Architecture**: ドメイン駆動設計
- **Dependency Injection**: Inversify.js使用
- **Value Objects**: ドメインモデル
- **Repository Pattern**: データアクセス抽象化

## フォント・UI
- **Noto Sans JP**: 日本語フォント
- **Roboto**: 英数字フォント
- **CSS Variables**: テーマ・ダークモード対応

## その他
- **Zod**: バリデーション
- **React Hook Form**: フォーム管理
- **Class Transformer/Validator**: DTOバリデーション