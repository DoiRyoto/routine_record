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
- エラー発生時は適切なエラーメッセージを表示
- ユーザーフレンドリーなエラー表示を実装
- **絶対にエラー時にMockデータを返してはいけない**

### MSW機能（開発時のみ）
- 開発環境でのAPI interceptのためのMSWを使用
- 本番環境・エラー時にはMockデータを返さない
- MSWは開発時のテスト・開発効率向上のみに使用
- 詳細は`docs/rules/msw-mock-system.md`を参照

### 認証
- `getCurrentUser()` でユーザー認証状態を確認
- 未認証時は適切にサインインページへ誘導
- Server Actions で認証が必要な処理を実行

## 3. データフェッチパターン

### Server Side Rendering (SSR)
- Page コンポーネントでデータフェッチを実行
- エラー時は適切なエラー表示を実装
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
- Mockデータは`src/mocks/data/`から取得して共通化
- MSWハンドラーとの整合性を保つ
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

### Mock System
- `/src/mocks/handlers/[resource].ts` - lib/db/queries/[resource].ts に1対1対応
- `/src/mocks/data/[resource].ts` - モックデータ管理
- MSWによるAPI呼び出しインターセプト
- 詳細構造は`docs/rules/msw-mock-system.md`参照

## 6. Mock から実データへの移行手順

1. データベースクエリ関数を実装
2. APIルートを実装
3. Page コンポーネントを実データに切り替え
4. エラーハンドリングを確認
5. 型チェック・Lint を実行
6. E2Eテストで動作確認

## 7. Next.js 15 対応ルール

### API Route パラメータ型定義
```typescript
// Next.js 15では params が Promise 型になる
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // 実装...
}
```

### ページコンポーネントでのパラメータ処理
```typescript
// Page コンポーネントでも同様
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  // 実装...
}
```

## 8. 型システム統一ルール

### スキーマベース型定義
- 全ての型定義は`@/lib/db/schema.ts`から取得する
- `@/types/*` モジュールは使用しない
- 型変換は行わず、スキーマから直接型を推論する

### 型インポートパターン
```typescript
// 正しい型インポート
import type { Routine, ExecutionRecord, UserSetting } from '@/lib/db/schema';

// 間違い - 使用しない
import type { Routine } from '@/types/routine';
```

### Mock データの型整合性
- Mock データは必ずスキーマ型と完全一致させる
- `typeof schema.$inferSelect` で推論された型を使用
- 手動での型変換は禁止

### API レスポンス型
```typescript
// API Response は schema の型をそのまま使用
export async function GET(): Promise<Response> {
  const routines: Routine[] = await getRoutines();
  return Response.json(routines);
}
```

## 9. 品質チェック

### 実装完了時に必ず実行
1. `npm run type-check` - TypeScript型チェック
2. `npm run lint` - ESLint実行
3. `npm run test:e2e` - E2Eテスト実行

### コミット前チェック
- 型エラーがないことを確認
- Lintエラーがないことを確認
- 基本的な動作確認を実施