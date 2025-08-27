# フロントエンド実装ルール

## 1. 型定義の統一

### データベーススキーマとフロントエンド型の整合性
- データベーススキーマ (`src/lib/db/schema.ts`) とフロントエンド型定義 (`src/types/`) を統一する
- `null` と `undefined` の使い分けを明確にする
  - データベースから取得: `null`
  - フロントエンドでのオプション: `undefined`
- 必須プロパティを明確に定義する

### 型エクスポートルール
- データベーススキーマから自動生成される型を活用する
- フロントエンド独自の型は `src/types/` 配下で管理
- APIレスポンス型とUI型を分離する

## 2. APIクライアント実装

### エラーハンドリング
- 全てのAPI呼び出しで try-catch を使用
- エラー時はMockデータにフォールバック
- ユーザーフレンドリーなエラーメッセージを表示

### 認証
- `getCurrentUser()` でユーザー認証状態を確認
- 未認証時は適切にサインインページへ誘導
- Server Actions で認証が必要な処理を実行

## 3. データフェッチパターン

### Server Side Rendering (SSR)
- Page コンポーネントでデータフェッチを実行
- エラー時はMockデータまたは適切なフォールバック
- ローディング状態とエラー状態を適切にハンドリング

### Client Side との切り分け
- 初期表示データ: SSR
- インタラクティブな操作: Client Side
- リアルタイム更新が必要: Client Side

## 4. コンポーネント設計

### Props設計
- 必要最小限のPropsを定義
- オプションハンドラーは適切にデフォルト処理を提供
- TypeScript で型安全性を確保

### Storybook対応
- 全ページコンポーネントにStorybookを用意
- Mockデータはstorybook用とPage用で共通化
- 型定義と整合性を保つ

## 5. ファイル構成ルール

### API Routes
- `/api/[resource]/route.ts` - 基本的なCRUD
- `/api/[resource]/[id]/route.ts` - 個別リソース操作
- 適切なHTTPメソッド (GET, POST, PATCH, DELETE) を使用

### Page Components
- `page.tsx` - Next.js Page (SSR, データフェッチ)
- `ComponentPage.tsx` - UIコンポーネント
- Server Actions は `page.tsx` 内で定義

### Database Queries
- `/lib/db/queries/[resource].ts` で管理
- エラーハンドリングを統一
- 型安全性を確保

## 6. Mock から実データへの移行手順

1. データベースクエリ関数を実装
2. APIルートを実装
3. Page コンポーネントを実データに切り替え
4. エラーハンドリングを確認
5. 型チェック・Lint を実行
6. E2Eテストで動作確認

## 7. 品質チェック

### 実装完了時に必ず実行
1. `npm run type-check` - TypeScript型チェック
2. `npm run lint` - ESLint実行
3. `npm run test:e2e` - E2Eテスト実行

### コミット前チェック
- 型エラーがないことを確認
- Lintエラーがないことを確認
- 基本的な動作確認を実施