import { test, expect } from '@playwright/test';

test.describe('Habits Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display habits dashboard with title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('習慣記録');
  });

  test('should display new habit button', async ({ page }) => {
    const newHabitButton = page.locator('button', { hasText: '新しい習慣' });
    await expect(newHabitButton).toBeVisible();
  });

  test('should display habit cards when habits exist', async ({ page }) => {
    const habitCards = page.locator('[data-testid="habit-card"]');
    const cardCount = await habitCards.count();
    
    if (cardCount > 0) {
      // 習慣カードが存在する場合
      await expect(habitCards.first()).toBeVisible();
      
      // 習慣名の表示確認
      const habitName = habitCards.first().locator('h2, h3, [data-testid="habit-title"]');
      await expect(habitName.first()).toBeVisible();
      
      // +ボタンの確認
      const executeButton = habitCards.first().locator('button', { hasText: '+' });
      await expect(executeButton).toBeVisible();
      
      // 進捗表示の確認
      const progressText = habitCards.first().locator('text=/\\d+\\/\\d+回/');
      await expect(progressText.first()).toBeVisible();
      
      // プログレスバーの確認
      const progressBar = habitCards.first().locator('[class*="bg-"], .progress-bar');
      await expect(progressBar.first()).toBeVisible();
    }
  });

  test('should handle habit execution (+ボタン)', async ({ page }) => {
    const habitCards = page.locator('[data-testid="habit-card"]');
    const cardCount = await habitCards.count();

    if (cardCount > 0) {
      const firstCard = habitCards.first();
      const executeButton = firstCard.locator('button', { hasText: '+' });

      if (await executeButton.isVisible()) {
        const progressTextBefore = await firstCard.locator('text=/\\d+\\/\\d+回/').first().textContent();

        await executeButton.click();

        await page.waitForTimeout(500);

        const progressTextAfter = await firstCard.locator('text=/\\d+\\/\\d+回/').first().textContent();

        expect(progressTextBefore).not.toBe(progressTextAfter);
      }
    }
  });

  test('should display empty state when no habits exist', async ({ page }) => {
    const habitCards = page.locator('[data-testid="habit-card"]');
    const cardCount = await habitCards.count();
    
    if (cardCount === 0) {
      // 空状態メッセージの確認
      const emptyMessage = page.locator('text=まだ習慣が登録されていません');
      await expect(emptyMessage).toBeVisible();
      
      // 初回作成ボタンの確認
      const firstHabitButton = page.locator('button', { hasText: '最初の習慣を追加' });
      await expect(firstHabitButton).toBeVisible();
    }
  });

  test('should display progress correctly', async ({ page }) => {
    const habitCards = page.locator('[data-testid="habit-card"]');
    const cardCount = await habitCards.count();
    
    if (cardCount > 0) {
      const firstCard = habitCards.first();
      
      // 進捗テキストの確認（例: "2/3回"）
      const progressText = firstCard.locator('text=/\\d+\\/\\d+回/');
      await expect(progressText.first()).toBeVisible();
      
      // 期間表示の確認（"今週" or "今月"）
      const periodText = firstCard.locator('text=今週, text=今月');
      await expect(periodText.first()).toBeVisible();
      
      // 目標表示の確認
      const targetText = firstCard.locator('text=/目標.*\\d+回/');
      await expect(targetText.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // タイトルが表示されることを確認
    await expect(page.locator('h1')).toBeVisible();
    
    // 新しい習慣ボタンがモバイルでも表示されることを確認
    const newHabitButton = page.locator('button', { hasText: '新しい習慣' });
    await expect(newHabitButton).toBeVisible();
    
    // 習慣カードがモバイルレイアウトで表示されることを確認
    const habitCards = page.locator('[data-testid="habit-card"]');
    const cardCount = await habitCards.count();
    
    if (cardCount > 0) {
      await expect(habitCards.first()).toBeVisible();
    }
  });
});