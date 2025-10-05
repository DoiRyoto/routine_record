# E2Eテスト実装ルール

## 1. 基本方針

### テストの目的
- ユーザーの実際の操作フローを検証する
- 主要な機能が正しく動作することを確認する
- リグレッション（機能の劣化）を防ぐ

### テストの粒度
- ユーザーの実際の操作フローに基づく
- 各機能の基本的な動作を確認
- エッジケースやエラー状態も考慮

## 2. テスト対象要素の識別

### data-testid命名規則
- **ケバブケース（kebab-case）を使用**
- 機能を表す明確な名前を付ける
- 階層構造を表現する場合は`parent-child`形式

### 命名パターンの例
```typescript
// 一般的な要素
'submit-button'          // 送信ボタン
'cancel-button'          // キャンセルボタン
'form-input'             // フォーム入力
'error-message'          // エラーメッセージ

// 階層構造
'header-navigation'      // ヘッダーのナビゲーション
'profile-avatar'         // プロフィールのアバター
'settings-menu'          // 設定メニュー

// リスト項目
'item-list'              // アイテムリスト全体
'item-card'              // 個別アイテムカード
```

### data-testid属性の追加
```tsx
// ✅ 推奨: 明確なdata-testid
<button data-testid="submit-button">送信</button>
<div data-testid="user-profile">
  <img data-testid="profile-avatar" src="..." />
  <span data-testid="user-name">Username</span>
</div>

// ❌ 非推奨: 曖昧な命名
<button data-testid="btn1">送信</button>
<div data-testid="userProfileDiv">...</div>
```

## 3. テストファイル構成

### ファイル命名
- `[page-name].spec.ts` 形式
- 機能ごとにファイルを分割
- 共通のテストユーティリティは`e2e/utils/`に配置

### テスト基本構造
```typescript
import { test, expect } from '@playwright/test';

test.describe('Page Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/path');
    await page.waitForLoadState('networkidle');
  });

  test('should display basic elements', async ({ page }) => {
    // 基本要素の表示確認
    await expect(page.locator('[data-testid="element"]')).toBeVisible();
  });

  test('should handle user interaction', async ({ page }) => {
    // ユーザー操作のテスト
    await page.click('[data-testid="button"]');
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });
});
```

## 4. テスト実装パターン

### 要素の存在確認
```typescript
// 必須要素の確認
await expect(page.locator('[data-testid="element"]')).toBeVisible();

// テキスト内容の確認
await expect(page.locator('[data-testid="title"]')).toHaveText('Expected Title');

// 複数要素のカウント
const items = page.locator('[data-testid="item"]');
const itemCount = await items.count();
expect(itemCount).toBeGreaterThan(0);
```

### インタラクションテスト
```typescript
// ボタンクリック
await page.click('[data-testid="submit-button"]');

// フォーム入力
await page.fill('[data-testid="email-input"]', 'test@example.com');
await page.fill('[data-testid="password-input"]', 'password123');

// セレクト選択
await page.selectOption('[data-testid="category-select"]', 'option-value');

// チェックボックス
await page.check('[data-testid="agree-checkbox"]');
```

### 待機処理
```typescript
// 要素が表示されるまで待機
await page.waitForSelector('[data-testid="element"]');

// ネットワークが安定するまで待機
await page.waitForLoadState('networkidle');

// 特定の条件まで待機
await page.waitForFunction(() => document.querySelector('[data-testid="element"]') !== null);
```

## 5. エラーハンドリングテスト

### バリデーションエラー
```typescript
test('should show validation error', async ({ page }) => {
  // 不正な入力
  await page.fill('[data-testid="email-input"]', 'invalid-email');
  await page.click('[data-testid="submit-button"]');

  // エラーメッセージの確認
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email');
});
```

### ネットワークエラー
```typescript
test('should handle network errors', async ({ page }) => {
  // ネットワークリクエストをインターセプト
  await page.route('**/api/endpoint*', route => route.abort());

  await page.goto('/page');

  // エラー表示の確認
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

## 6. レスポンシブテスト

### モバイル対応確認
```typescript
test('should be responsive on mobile', async ({ page }) => {
  // ビューポートをモバイルサイズに設定
  await page.setViewportSize({ width: 375, height: 667 });

  // モバイルでの表示確認
  await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
});

test('should be responsive on tablet', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });

  // タブレットでの表示確認
  await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
});
```

## 7. 認証テスト

### ログインフロー
```typescript
test('should login successfully', async ({ page }) => {
  await page.goto('/login');

  // ログイン情報入力
  await page.fill('[data-testid="email-input"]', 'user@example.com');
  await page.fill('[data-testid="password-input"]', 'password');
  await page.click('[data-testid="login-button"]');

  // ダッシュボードへのリダイレクト確認
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

### 未認証アクセス
```typescript
test('should redirect to login when not authenticated', async ({ page }) => {
  await page.goto('/protected-page');

  // ログインページへのリダイレクト確認
  await expect(page).toHaveURL('/login');
});
```

## 8. CI/CD連携

### テスト実行コマンド
```bash
# ローカルでのE2E実行
npm run test:e2e

# UIモードでの実行
npm run test:e2e:ui

# デバッグモードでの実行
npm run test:e2e:debug

# 特定のテストのみ実行
npm run test:e2e -- tests/login.spec.ts
```

### GitHub Actionsでの実行
```yaml
- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 9. テストデータ管理

### モックデータの使用
- 開発環境ではモックデータを使用可能
- テストで期待する値はモックデータに基づく
- データの一貫性を保つ

### テストデータのクリーンアップ
```typescript
test.afterEach(async ({ page }) => {
  // テスト後のクリーンアップ処理
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(() => sessionStorage.clear());
});
```

## 10. パフォーマンステスト

### ページロード時間
```typescript
test('should load page quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/page');
  await page.waitForLoadState('load');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000); // 3秒以内
});
```

## 11. スクリーンショット・動画

### スクリーンショット撮影
```typescript
test('visual regression test', async ({ page }) => {
  await page.goto('/page');

  // スクリーンショット撮影
  await page.screenshot({ path: 'screenshots/page.png' });

  // 特定要素のスクリーンショット
  await page.locator('[data-testid="component"]').screenshot({
    path: 'screenshots/component.png'
  });
});
```

### 動画記録
```typescript
// playwright.config.ts
export default {
  use: {
    video: 'on-first-retry', // 初回リトライ時に動画記録
  },
};
```

## 12. デバッグとトラブルシューティング

### デバッグ手法
```bash
# UIモードでのデバッグ
npm run test:e2e:ui

# ヘッドありモードでの実行
npm run test:e2e -- --headed

# 特定のブラウザでのテスト
npm run test:e2e -- --project=chromium
```

### Playwright Inspector
```typescript
// テストコード内でブレークポイント
await page.pause();
```

## 13. 品質確保

### 実装完了時の必須チェック
1. `npm run test:e2e` の成功実行
2. 全ての主要フローがカバーされている
3. data-testid属性が適切に設定されている
4. CIでの実行成功確認

### テストのメンテナンス
- UIの変更時にテストも更新する
- 不安定なテストは修正する
- テスト実行時間の最適化を図る
- 定期的にテストの有効性を確認する
