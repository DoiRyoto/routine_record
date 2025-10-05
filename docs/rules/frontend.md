# フロントエンド実装ルール

## 1. 型定義の統一

### スキーマベース型定義
- データベーススキーマを単一の信頼できる情報源（Single Source of Truth）とする
- 型は手動定義せず、スキーマから推論する
- `null` と `undefined` の使い分けを明確にする
  - データベースから取得される値: `null`
  - フロントエンドでのオプショナルプロパティ: `undefined`

### 型の推論と再利用
```typescript
// ✅ 推奨: スキーマから型を推論
import type { Entity } from '@/lib/db/schema';

// ❌ 非推奨: 手動での型定義
interface Entity {
  id: string;
  name: string;
  // ...
}
```

### Insert型とSelect型の使い分け
```typescript
// データベース挿入時
import type { InsertEntity } from '@/lib/db/schema';
const newEntity: InsertEntity = {
  userId: 'user1',
  name: 'Entity Name',
  // デフォルト値が設定されるフィールドは省略可能
};

// データベース取得時
import type { Entity } from '@/lib/db/schema';
const entities: Entity[] = await getEntities();
```

## 2. APIクライアント実装

### エラーハンドリング
- 全てのAPI呼び出しで try-catch を使用
- エラー発生時は適切なエラーメッセージを表示
- ユーザーフレンドリーなエラー表示を実装
- **エラー時にMockデータを返してはいけない**

```typescript
// ✅ 推奨パターン
try {
  const data = await apiClient.get('/endpoint');
  return data;
} catch (error) {
  console.error('Failed to fetch data:', error);
  throw error; // または適切なエラーハンドリング
}

// ❌ 非推奨パターン
try {
  const data = await apiClient.get('/endpoint');
  return data;
} catch (error) {
  return mockData; // エラー時にMockデータを返すのは禁止
}
```

### 認証処理
- 認証が必要な処理はサーバーサイドで実行
- 未認証時は適切にサインインページへ誘導
- Server Actionsを活用して認証処理を実装

## 3. データフェッチパターン

### Server Side Rendering (SSR)
- Page コンポーネントでデータフェッチを実行
- エラー時は適切なエラー表示を実装
- ローディング状態とエラー状態を適切にハンドリング

```typescript
// Page Component
export default async function Page() {
  try {
    const data = await fetchData();
    return <PageComponent data={data} />;
  } catch (error) {
    return <ErrorComponent />;
  }
}
```

### Client Side との切り分け
- **初期表示データ**: SSR
- **インタラクティブな操作**: Client Side
- **リアルタイム更新が必要**: Client Side

## 4. コンポーネント設計

### Props設計原則
- 必要最小限のPropsを定義
- オプションハンドラーは適切にデフォルト処理を提供
- TypeScript で型安全性を確保

```typescript
// ✅ 推奨: 明確な型定義
interface ComponentProps {
  title: string;
  onSubmit?: (data: FormData) => void;
  isLoading?: boolean;
}

// ❌ 非推奨: 曖昧な型定義
interface ComponentProps {
  data: any;
  handler?: Function;
}
```

### UIコンポーネント分離
- プレゼンテーション層とロジック層を分離
- UIコンポーネントは純粋な表示に専念
- ビジネスロジックはカスタムフックやServer Actionsに集約

## 5. ファイル構成ルール

### ページコンポーネント
```
app/
├── page.tsx              # Next.js Page (SSR, データフェッチ)
└── PageComponent.tsx     # UIコンポーネント (プレゼンテーション)
```

### API Routes
```
app/api/
├── [resource]/
│   ├── route.ts          # 基本的なCRUD
│   └── [id]/
│       └── route.ts      # 個別リソース操作
```

### データベースクエリ
```
lib/db/
├── schema.ts             # スキーマ定義
└── queries/
    └── [resource].ts     # クエリ関数
```

## 6. Next.js フレームワーク対応

### 動的パラメータ処理（Next.js 15+）
```typescript
// API Route
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // 実装...
}

// Page Component
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  // 実装...
}
```

## 7. Mockシステム（開発時のみ）

### 基本原則
- Mockシステムは開発時のAPI interceptのみに使用
- 本番環境では使用しない
- エラーハンドリングやフォールバック機能として使用しない

### Mock用途
- ✅ 開発環境でのAPI動作確認
- ✅ Storybookでのコンポーネント表示
- ✅ E2Eテストでのデータ一貫性確保
- ❌ 本番環境での使用
- ❌ エラー時のフォールバック

### Mockデータの型整合性
- Mockデータはスキーマから推論された型と完全一致させる
- 手動での型変換は避ける

```typescript
// ✅ 推奨: スキーマ型に一致
import type { Entity } from '@/lib/db/schema';

export const mockEntities: Entity[] = [
  {
    id: 'entity-1',
    userId: 'user-1',
    name: 'Mock Entity',
    createdAt: new Date('2024-01-01'),
    // すべてのフィールドがスキーマと一致
  }
];

// ❌ 非推奨: 型不一致
export const mockEntities = [
  {
    id: 'entity-1',
    invalidField: 'value', // スキーマに存在しないフィールド
  }
];
```

## 8. TypeScript厳格ルール

### コンパイラ指示の禁止
- `@ts-ignore` は絶対に使用禁止
- `@ts-expect-error` も原則禁止（例外的な場合のみ）
- 型エラーは根本的な型定義修正で解決する

### 型安全性確保手順
1. スキーマベースの型定義を最優先
2. コンポーネントプロパティの型を厳密に定義
3. `any`型の使用を避け、具体的な型を指定
4. 型エラー発生時は型定義の見直しから始める

```typescript
// ❌ 非推奨
// @ts-ignore
const value = someFunction();

// ✅ 推奨: 適切な型定義
const value: ExpectedType = someFunction();
```

## 9. アーキテクチャ分離

### 責任の分離
- **Page Components**: レンダリング、初期データの取得（API経由）
- **API Routes**: 認証、バリデーション、ビジネスロジック、データベース操作
- **Database Queries**: 純粋なデータ操作、型安全性

### データアクセスパターン
```typescript
// ❌ 非推奨: Page Componentで直接DBクエリ
import { getEntities } from '@/lib/db/queries/entities';
const entities = await getEntities(userId);

// ✅ 推奨: API Routes経由
const response = await fetch('/api/entities');
const entities = await response.json();
```

## 10. よくある型エラーと解決方法

### Mockデータの誤用
```typescript
// ❌ 非推奨: データ取得失敗時にMockデータを使用
const data = fetchedData || mockData;

// ✅ 推奨: 適切なエラー表示
if (!fetchedData) {
  return <ErrorComponent message="データを読み込めませんでした" />;
}
```

### 必須フィールドの欠損
```typescript
// ❌ 非推奨: 必須フィールドが欠損
await createEntity({
  name: 'Entity Name',
  // userIdが欠損
});

// ✅ 推奨: すべての必須フィールドを含める
await createEntity({
  userId: 'user-1',
  name: 'Entity Name',
});
```

## 11. Storybook対応

### データソースの統一
- StorybookのストーリーでMockデータを使用
- Mockデータの型はスキーマと完全一致
- コンポーネントの全バリエーションをカバー

```typescript
// Component.stories.tsx
import { mockEntities } from '@/mocks/data/entities';

export const Default: Story = {
  args: {
    entities: mockEntities,
  },
};
```

## 12. 品質チェック

### 実装完了時の必須確認
1. `npm run type-check` - TypeScript型チェック
2. `npm run lint` - ESLint実行（警告含む全て解消）
3. 基本的な動作確認

### コミット前チェックリスト
- [ ] 型エラーがない
- [ ] Lintエラー・警告が0個
- [ ] ts-ignore系コメントが存在しない
- [ ] Page ComponentでDBクエリ直接呼び出しがない
- [ ] エラー時にMockデータを返していない
- [ ] 必須フィールドがすべて含まれている
