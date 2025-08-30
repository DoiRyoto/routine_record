# MSW・Mockシステム実装ルール

## 1. 基本方針

### Mock使用の前提
- E2Eテストでのみ使用する
- `lib/db/queries`の各関数に1対1で対応するMockハンドラーを作成

## 2. ディレクトリ構造

```
src/mocks/
├── handlers/
│   ├── challenges.ts      # src/lib/db/queries/challenges.ts対応
│   ├── user-profiles.ts   # src/lib/db/queries/user-profiles.ts対応
│   ├── routines.ts        # src/lib/db/queries/routines.ts対応
│   ├── categories.ts      # src/lib/db/queries/categories.ts対応
│   ├── execution-records.ts # src/lib/db/queries/execution-records.ts対応
│   ├── user-settings.ts   # src/lib/db/queries/user-settings.ts対応
│   └── index.ts          # 全ハンドラー統合
├── data/                 # モックデータ管理
│   ├── challenges.ts
│   ├── user-profiles.ts
│   ├── routines.ts
│   ├── categories.ts
│   ├── execution-records.ts
│   └── user-settings.ts
└── browser.ts           # MSW初期化・セットアップ
```

## 3. 実装ルール

### 3.1 Handlerファイルの命名・構造

**ファイル名**: `src/lib/db/queries/[filename].ts` → `src/mocks/handlers/[filename].ts`

**基本構造**:
```typescript
import { http, HttpResponse } from 'msw';
import { mockData } from '../data/[filename]';

export const [filename]Handlers = [
  // GET: データ取得
  http.get('/api/[resource]', ({ request }) => {
    // クエリパラメータ処理
    // 対応するmock関数の結果を返す
    return HttpResponse.json(result);
  }),
  
  // POST: データ作成・更新
  http.post('/api/[resource]', async ({ request }) => {
    const body = await request.json();
    // 処理実行
    return HttpResponse.json(result);
  }),
  
  // その他のHTTPメソッド対応
];
```

### 3.2 Mockデータの分離

**目的**: 
- ハンドラーロジックとデータを分離
- テスト・Storybook・開発で共通利用
- データの一元管理

**構造**:
```typescript
// src/mocks/data/challenges.ts
export const mockChallenges = [/* ... */];
export const mockUserChallenges = [/* ... */];

// 各query関数に対応するMock関数
export const getMockActiveChallenges = () => mockChallenges.filter(c => c.isActive);
export const getMockUserChallenges = (userId: string) => mockUserChallenges.filter(uc => uc.userId === userId);
```

### 3.3 型安全性の確保

- 全MockデータはDB schemaから生成された型を使用
- `src/lib/db/schema.ts`の型定義に準拠
- `src/types/gamification.ts`等のフロントエンド型も活用

## 4. MSW初期化設定

### 4.1 browser.tsの設定

```typescript
import { setupWorker } from 'msw/browser';
import { allHandlers } from './handlers';

export const worker = setupWorker(...allHandlers);

export const startWorker = async () => {
  if (process.env.NODE_ENV === 'development') {
    return worker.start({
      onUnhandledRequest: 'warn',
    });
  }
};
```

### 4.2 AppWrapper内での初期化

```typescript
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    import('@/mocks/browser').then(({ startWorker }) => {
      startWorker();
    });
  }
}, []);
```

## 5. エラーハンドリング原則

### 5.1 エラー発生時の対応
- 適切なエラー表示を行う
- エラーログを適切に出力
- ユーザーにわかりやすいエラーメッセージを表示

### 5.2 MSWの制限
- MSWは開発時のAPI interceptのみ
- エラー処理やフォールバック機能ではない
- 本番環境では使用しない

### 5.3 環境変数制御

```env
NEXT_PUBLIC_USE_MSW=true          # 開発環境でのMSW有効化のみ
```

## 6. テスト・Storybook連携

### 6.1 Storybook設定
- MockデータをStorybookで活用
- コンポーネントごとに必要なMockハンドラーを指定

### 6.2 E2Eテスト
- テスト環境ではMSWを有効化
- 一貫したテストデータでの動作検証

## 7. メンテナンス指針

### 7.1 lib/db/queriesの変更時
1. 対応するhandlerファイルを同時更新
2. Mockデータの整合性確認
3. 型定義の同期確認

### 7.2 新しいquery追加時
1. `src/mocks/handlers/[new-file].ts`作成
2. `src/mocks/data/[new-file].ts`作成
3. `src/mocks/handlers/index.ts`に統合
4. 型安全性確認

## 8. 品質チェック

### 8.1 実装完了時チェック
- 全queryに対応するhandlerが存在
- Mockデータの型安全性確認
- MSW初期化の動作確認
- **エラー時にMockデータを返していないことを確認**

### 8.2 デバッグ支援
- MSW DevToolsでAPI呼び出し確認
- 開発時のAPI intercept状況確認
- エラー時の適切なログ出力