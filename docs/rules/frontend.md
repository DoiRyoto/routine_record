# フロントエンド実装ルール

## 1. 型定義の統一

### データベーススキーマとフロントエンド型の整合性
- データベーススキーマ (`src/lib/db/schema.ts`) を用いる
- `null` と `undefined` の使い分けを明確にする
  - データベースから取得: `null`
  - フロントエンドでのオプション: `undefined`
- 必須プロパティを明確に定義する

### 型エクスポートルール
- データベーススキーマから自動生成される型を活用する
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

## 6. 型システム統一の手順

1. 全 `@/types/*` インポートを `@/lib/db/schema` に置換
2. Mock データをスキーマ型に完全一致させる
3. TypeScript エラーを段階的に解決
4. Handler での型不整合を修正
5. 最終的な type-check と lint 実行

### 段階的エラー解決手順
```bash
# 1. 型チェック実行
npm run type-check

# 2. 主要なエラーから順番に修正
# - Missing properties (userId, createdAt, updatedAt など)
# - Invalid enum values (theme: 'system' → 'auto')  
# - Non-existent fields (dailyGoal, description など)

# 3. Lint 実行
npm run lint

# 4. 最終確認
npm run type-check
```

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

### Mock データ型整合性ルール
- Mock データはスキーマ定義と完全一致させる
- Enum値は schema で定義されている値のみ使用
```typescript
// 正しい例
theme: 'auto', // schema の themeEnum に存在
language: 'ja', // schema の languageEnum に存在

// 間違い例
theme: 'system', // schema に存在しない値
```
- 存在しないフィールドは削除する
- 必須フィールドは必ず追加する

### よくある型エラーと解決方法

#### ExecutionRecord の使い分け
```typescript
// データベース挿入時
import type { InsertExecutionRecord } from '@/lib/db/schema';
const record: InsertExecutionRecord = {
  userId: 'user1',
  routineId: routine.id,
  executedAt: new Date(),
  // ...
};

// データベース取得時
import type { ExecutionRecord } from '@/lib/db/schema';
const records: ExecutionRecord[] = await getExecutionRecords();
```

#### API呼び出し時のユーザーID
```typescript
// 正しい例 - userIdを含める
await onComplete({
  userId: routine.userId,
  routineId: routine.id,
  executedAt: new Date(),
  // ...
});

// 間違い例 - userIdが欠損
await onComplete({
  routineId: routine.id, // userId が無い
  executedAt: new Date(),
});
```

### スキーマ更新時の影響範囲チェック
1. Mock データファイル (`src/mocks/data/*.ts`) の更新
2. Handler ファイル (`src/mocks/handlers/*.ts`) の型チェック
3. Schema に存在しないフィールドの削除

## 9. TypeScript厳格ルール

### ts-ignore禁止ルール
- **@ts-ignore は絶対に使用禁止**
- **@ts-expect-error も原則禁止** （どうしても必要な場合のみ例外的に使用）
- 型エラーは必ず根本的な型定義修正で解決する
- 型アサーション（as）も最小限に留め、適切な型定義を優先する

### 型安全性確保手順
1. スキーマベースの型定義を最優先
2. コンポーネントプロパティの型を厳密に定義
3. any型の使用を禁止し、具体的な型を指定
4. 型エラー発生時は型定義の見直しから始める

## 10. 品質チェック

### 実装完了時に必ず実行
1. `npm run type-check` - TypeScript型チェック
2. `npm run lint` - ESLint実行（警告含む全て解消）
3. `npm run test:e2e` - E2Eテスト実行

### コミット前チェック
- 型エラーがないことを確認
- **Lintエラー・警告が0個であることを確認**
- ts-ignore系コメントが存在しないことを確認
- 基本的な動作確認を実施