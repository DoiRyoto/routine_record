# E2Eテスト実装ルール

## 1. 基本方針

### テストの対象
- 実装済みの機能のみテストする
- 未実装の機能は`test.skip()`または`test.describe.skip()`でスキップ
- 実装が完了したら該当テストを有効化する

### テストの粒度
- ユーザーの実際の操作フローに基づく
- 各機能の基本的な動作を確認
- エラー状態やエッジケースも考慮

## 2. data-testid命名規則

### 基本ルール
- ケバブケース（kebab-case）を使用
- 機能を表す明確な名前を付ける
- 階層構造を表現する場合は`parent-child`形式

### 命名パターン
```typescript
// ゲーミフィケーション関連
'gamification-header'     // ゲーミフィケーション全体のヘッダー
'profile-avatar'          // ユーザーアバター
'user-level'             // ユーザーレベル表示
'level-indicator'        // レベル進捗インジケーター
'xp-counter'             // XPカウンター
'streak-counter'         // ストリークカウンター

// ルーティン関連
'routine-item'           // ルーティンアイテム
'progress-routine-item'  // 進捗ルーティンアイテム

// 提案・通知関連
'catchup-suggestions'    // キャッチアップ提案セクション
'suggestion-item'        // 個別の提案アイテム

// チャレンジ・ミッション関連
'challenge-card'         // チャレンジカード
'mission-card'          // ミッションカード
'badge-item'            // バッジアイテム
```

## 3. テストファイル構成

### ファイル命名
- `[page-name].spec.ts` 形式
- 機能ごとにファイルを分割
- 共通のテストユーティリティは`e2e/utils/`に配置

### テスト構造
```typescript
test.describe('Page Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path');
    await page.waitForLoadState('networkidle');
  });

  test('should display basic elements', async ({ page }) => {
    // 基本要素の表示確認
  });

  test.skip('should handle future feature', async ({ page }) => {
    // 未実装機能はスキップ
    // TODO: 機能実装後に有効化
  });
});
```

## 4. スキップ管理ルール

### スキップの種類と使い分け

#### 個別テストのスキップ
```typescript
test.skip('test name', async ({ page }) => {
  // 個別の機能が未実装の場合
  // TODO: 機能実装後に有効化
});
```

#### 全体スキップ
```typescript
test.describe.skip('Page Name - SKIPPED (Feature Not Implemented)', () => {
  // ページ全体が未実装の場合
  // TODO: ページ実装後に有効化
});
```

### スキップ理由の記載
- スキップ理由を必ずコメントで記載
- TODOコメントで有効化タイミングを明記
- 実装状況が変わったら即座に更新

## 5. 実装確認パターン

### 要素の存在確認
```typescript
// 必須要素の確認
await expect(page.locator('[data-testid="element"]')).toBeVisible();

// オプション要素の確認
const optionalElement = page.locator('[data-testid="optional"]');
if (await optionalElement.isVisible()) {
  // 存在する場合のテスト
}
```

### 動的コンテンツの確認
```typescript
// 動的なカウント数の確認
const items = page.locator('[data-testid="item"]');
const itemCount = await items.count();
expect(itemCount).toBeGreaterThanOrEqual(0);
```

### インタラクションテスト
```typescript
// ボタンクリックとその結果
const button = page.locator('button:has-text("完了")');
if (await button.isVisible()) {
  await button.click();
  await expect(page.locator('text=完了')).toBeVisible();
}
```

## 6. MSWとの連携

### モックデータの活用
- MSWで提供されるモックデータと整合性を保つ
- テストで期待する値はモックデータに基づく
- `src/mocks/data/`のデータと同期を保つ

### 環境設定
- E2E実行時はMSWを有効化
- `e2e/global-setup.ts`でMSW初期化
- テスト環境でのAPI interceptを確実に行う

## 7. エラーハンドリングテスト

### ネットワークエラー
```typescript
test.skip('should handle network errors', async ({ page }) => {
  // 現在はエラーハンドリングが未完成のためスキップ
  // TODO: エラーハンドリング強化後に有効化
  await page.route('**/api/endpoint*', route => route.abort());
  await page.reload();
  
  // 適切なエラー表示の確認
});
```

## 8. レスポンシブテスト

### モバイル対応確認
```typescript
test('should be responsive on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  
  // モバイルでの表示確認
  await expect(page.locator('[data-testid="key-element"]')).toBeVisible();
});
```

## 9. CI/CD連携

### GitHub Actions
- プッシュ時にE2Eテスト自動実行
- 品質チェック後にE2E実行
- 失敗時のPlaywrightレポート保存

### 実行コマンド
```bash
# ローカルでのE2E実行
npm run test:e2e

# UIモードでの実行
npm run test:e2e:ui

# デバッグモードでの実行
npm run test:e2e:debug
```

## 10. メンテナンスルール

### 定期的な確認事項
1. 実装状況の変化に応じたスキップ解除
2. data-testid属性の存在確認
3. モックデータとの整合性チェック
4. テスト実行時間の最適化

### 新機能追加時の手順
1. 該当するdata-testid属性をコンポーネントに追加
2. テストケースを作成（必要に応じてスキップ状態）
3. 実装完了後にテストを有効化
4. CIで実行確認

## 11. 品質確保

### 実装完了時の必須チェック
1. `npm run test:e2e` の成功実行
2. スキップされたテストの見直し
3. 新しく追加した要素のdata-testid確認
4. CIでの実行成功確認

### デバッグとトラブルシューティング
- UI モードでの詳細確認：`npm run test:e2e:ui`
- デバッグモード：`npm run test:e2e:debug`
- Playwright Inspector の活用
- スクリーンショット・動画での確認