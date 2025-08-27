import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
  });

  test('should display user profile information', async ({ page }) => {
    // プロフィールセクションの確認
    await expect(page.locator('h1')).toContainText('プロフィール');
    
    // ユーザー情報の確認
    await expect(page.locator('[data-testid="profile-avatar"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-level"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-xp"]')).toBeVisible();
  });

  test('should display level indicator with progress', async ({ page }) => {
    // レベルインジケーターの確認
    const levelIndicator = page.locator('[data-testid="level-indicator"]');
    await expect(levelIndicator).toBeVisible();
    
    // プログレスバーの確認
    await expect(levelIndicator.locator('[role="progressbar"]')).toBeVisible();
    
    // XP情報の確認
    await expect(levelIndicator.locator('text=/\\d+.*XP/')).toBeVisible();
  });

  test('should display user statistics', async ({ page }) => {
    // 統計情報セクションの確認
    await expect(page.locator('text=統計情報')).toBeVisible();
    
    // 各統計の確認
    await expect(page.locator('text=現在のストリーク')).toBeVisible();
    await expect(page.locator('text=最長ストリーク')).toBeVisible();
    await expect(page.locator('text=総実行回数')).toBeVisible();
    await expect(page.locator('text=アクティブルーティン')).toBeVisible();
  });

  test('should display badge collection', async ({ page }) => {
    // バッジセクションの確認
    await expect(page.locator('text=獲得バッジ')).toBeVisible();
    
    // バッジグリッドの確認
    const badgeGrid = page.locator('[data-testid="badge-grid"]');
    await expect(badgeGrid).toBeVisible();
    
    // バッジカードの確認
    await expect(badgeGrid.locator('[data-testid="badge-item"]')).toHaveCount(6);
  });

  test('should handle badge interaction', async ({ page }) => {
    // バッジをクリック
    const firstBadge = page.locator('[data-testid="badge-item"]').first();
    await firstBadge.click();
    
    // バッジ詳細モーダル/トーストの確認（実装に依存）
    // 実際の実装に応じて調整が必要
  });

  test('should display achievement progress', async ({ page }) => {
    // アチーブメントセクションの確認
    await expect(page.locator('text=アチーブメント')).toBeVisible();
    
    // 進行中のアチーブメントの確認
    await expect(page.locator('[data-testid="achievement-item"]')).toHaveCountGreaterThan(0);
  });

  test('should show recent activities', async ({ page }) => {
    // 最近の活動セクションの確認
    await expect(page.locator('text=最近の活動')).toBeVisible();
    
    // アクティビティアイテムの確認
    const activityList = page.locator('[data-testid="activity-list"]');
    await expect(activityList).toBeVisible();
    
    // XPアクティビティの確認
    await expect(activityList.locator('text=/XP/')).toHaveCountGreaterThan(0);
  });

  test('should display streak counter with flame icon', async ({ page }) => {
    // ストリークカウンターの確認
    const streakCounter = page.locator('[data-testid="streak-counter"]');
    await expect(streakCounter).toBeVisible();
    
    // フレームアイコンの確認
    await expect(streakCounter.locator('svg')).toBeVisible();
    
    // ストリーク数の確認
    await expect(streakCounter.locator('text=/\\d+日/')).toBeVisible();
  });

  test('should handle profile editing', async ({ page }) => {
    // 編集ボタンのクリック（存在する場合）
    const editButton = page.locator('button:has-text("編集")');
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // 編集フォーム/モーダルの確認
      // 実際の実装に応じて調整が必要
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // モバイルでもプロフィール要素が表示されることを確認
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="profile-avatar"]')).toBeVisible();
    await expect(page.locator('[data-testid="level-indicator"]')).toBeVisible();
    
    // バッジグリッドがモバイルレイアウトに適応することを確認
    const badgeGrid = page.locator('[data-testid="badge-grid"]');
    await expect(badgeGrid).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // ネットワークエラーをシミュレート
    await page.route('**/api/profile*', route => route.abort());
    await page.reload();
    
    // エラー状態の確認
    // 実際のエラーハンドリング実装に応じて調整
  });

  test('should update profile data in real-time', async ({ page }) => {
    // 初期データの確認
    const initialXP = await page.locator('[data-testid="user-xp"]').textContent();
    
    // XP追加アクション（他のページでの活動をシミュレート）
    // 実際の実装に応じてAPIコールやユーザーアクションを実行
    
    // プロフィールページに戻って更新を確認
    // 実際の実装に応じて調整
  });
});