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

#### Mockデータの誤用（重要）
```typescript
// ❌ 間違い - データが取得できない場合にMockデータを使用
const mockUserProfile: UserProfile = userProfile || {
  userId: 'user1',
  level: 8,
  // ...
};

// ❌ 間違い - Page ComponentでAPI実装の代わりにmockDataを返す
async function getProfileData(userId?: string) {
  // 現在はモックデータを返す（API実装まで）
  const mockProfile = { userId, level: 1, /* ... */ };
  return { userProfile: mockProfile };
}

// ✅ 正しい - データが取得できない場合は適切なエラー表示
if (!userProfile) {
  return <ErrorComponent message="ユーザープロフィールを読み込めませんでした" />;
}

// ✅ 正しい - API Routes経由でデータ取得
const userProfileResponse = await serverTypedGet(
  `/api/user-profiles?userId=${user.id}`, 
  UserProfileGetResponseSchema
);
```

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

## 10. アーキテクチャ分離ルール

### Page Components と Database の分離
- **Page Components から直接データベースクエリを呼び出してはいけない**
- **絶対に`lib/db/queries`を Page Component で直接 import・使用禁止**
- Page Components は必ずAPI Routes経由でデータを取得する
- サーバーサイドでは`serverTypedGet`を使用してcookieを含めた認証付きリクエストを実行

### 正しいデータフェッチパターン
```typescript
// ❌ 間違い - Page ComponentでDBクエリを直接呼び出し
import { getRoutines } from '@/lib/db/queries/routines';
const routines = await getRoutines(user.id);

// ✅ 正しい - API Routes経由でデータ取得
import { serverTypedGet } from '@/lib/api-client/server-fetch';
const response = await serverTypedGet('/api/routines', RoutinesGetResponseSchema);
```

### 責任分離の徹底
- **Page Components**: レンダリング、初期データの取得（API Routes経由）
- **API Routes**: 認証、バリデーション、ビジネスロジック、DB操作
- **Database Queries**: 純粋なデータ操作、型安全性

## 11. E2Eテスト実装ルール

### data-testid属性の必須追加
- 全てのテスト対象要素に`data-testid`属性を追加
- ケバブケース（kebab-case）で命名
- 詳細なルールは`docs/rules/e2e-testing.md`を参照

### テスト実装の原則
- **実装済み機能のみテストする**
- 未実装機能は`test.skip()`でスキップし、TODOコメント追加
- 実装完了時にスキップを解除

### data-testid命名例
```typescript
// ゲーミフィケーション要素
'gamification-header'    // ゲーミフィケーションヘッダー
'profile-avatar'         // プロフィールアバター
'user-level'            // ユーザーレベル
'level-indicator'       // レベルプログレスバー
'xp-counter'            // XPカウンター
'streak-counter'        // ストリークカウンター

// ルーティン要素
'routine-item'          // ルーティンアイテム
'progress-routine-item' // 進捗ルーティンアイテム
```

## 12. 品質チェック

### 実装完了時に必ず実行
1. `npm run type-check` - TypeScript型チェック
2. `npm run lint` - ESLint実行（警告含む全て解消）
3. `npm run test:e2e` - E2Eテスト実行

### コミット前チェック
- 型エラーがないことを確認
- **Lintエラー・警告が0個であることを確認**
- ts-ignore系コメントが存在しないことを確認
- Page ComponentでDBクエリ直接呼び出しがないことを確認
- 基本的な動作確認を実施
- **追加したdata-testid属性が正しく機能することを確認**