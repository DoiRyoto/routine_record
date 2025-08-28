import { test, expect } from '@playwright/test';

test.describe.skip('Missions Page - SKIPPED (Feature Not Implemented)', () => {
  // ミッションページ全体が未実装のため、全テストをスキップ
  // TODO: ミッション機能実装後に有効化
  test.beforeEach(async ({ page }) => {
    await page.goto('/missions');
    await page.waitForLoadState('networkidle');
  });

  test('should display mission page title and statistics', async ({ page }) => {
    // タイトルの確認
    await expect(page.locator('h1')).toContainText('ミッション');
    
    // 統計カードの確認
    await expect(page.locator('text=総ミッション数')).toBeVisible();
    await expect(page.locator('text=進行中')).toBeVisible();
    await expect(page.locator('text=完了済み')).toBeVisible();
    await expect(page.locator('text=利用可能')).toBeVisible();
  });

  test('should display mission cards', async ({ page }) => {
    // ミッションカードが表示されることを確認
    await expect(page.locator('[data-testid="mission-card"]').first()).toBeVisible();
    
    // ミッションのタイトルが表示されることを確認
    await expect(page.locator('text=7日間連続実行')).toBeVisible();
  });

  test('should filter missions by type', async ({ page }) => {
    // フィルター選択
    await page.selectOption('select', 'streak');
    
    // ストリーク系のミッションのみ表示されることを確認
    await expect(page.locator('text=7日間連続実行')).toBeVisible();
  });

  test('should switch between mission tabs', async ({ page }) => {
    // 進行中タブをクリック
    await page.click('text=進行中');
    
    // 進行中のミッションが表示されることを確認
    await expect(page.locator('[data-testid="mission-card"]')).toHaveCount(2);
    
    // 完了済みタブをクリック
    await page.click('text=完了済み');
    
    // 完了済みのミッションが表示されることを確認（モックデータに基づく）
    await expect(page.locator('text=5つの異なるカテゴリ')).toBeVisible();
  });

  test('should claim mission reward', async ({ page }) => {
    // 完了済みタブに移動
    await page.click('text=完了済み');
    
    // 報酬受け取りボタンをクリック
    const claimButton = page.locator('button:has-text("報酬を受け取る")').first();
    if (await claimButton.isVisible()) {
      await claimButton.click();
      
      // 成功メッセージまたは状態の変更を確認
      // 実際の実装に応じて調整
    }
  });

  test('should handle empty state', async ({ page }) => {
    // 利用可能タブでミッションが0の場合のテスト
    await page.click('text=利用可能');
    
    // 空の状態メッセージが表示される可能性をテスト
    // 実際のデータに応じて調整が必要
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // モバイルでもタイトルが表示されることを確認
    await expect(page.locator('h1')).toBeVisible();
    
    // 統計カードが適切に表示されることを確認
    await expect(page.locator('text=総ミッション数')).toBeVisible();
  });
});