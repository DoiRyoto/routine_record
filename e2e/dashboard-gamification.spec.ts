import { test, expect } from '@playwright/test';

test.describe('Dashboard with Gamification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display gamification header with user profile', async ({ page }) => {
    // ゲーミフィケーションヘッダーの確認
    const gamificationHeader = page.locator('[data-testid="gamification-header"]');
    await expect(gamificationHeader).toBeVisible();
    
    // プロフィールアバターの確認
    await expect(gamificationHeader.locator('[data-testid="profile-avatar"]')).toBeVisible();
    
    // ユーザーレベルの確認
    await expect(gamificationHeader.locator('[data-testid="user-level"]')).toBeVisible();
    await expect(gamificationHeader.locator('text=/Lv\.\d+/')).toBeVisible();
  });

  test('should display level indicator with XP progress', async ({ page }) => {
    // レベルインジケーターの確認
    const levelIndicator = page.locator('[data-testid="level-indicator"]');
    await expect(levelIndicator).toBeVisible();
    
    // プログレスバーの確認
    await expect(levelIndicator.locator('[role="progressbar"]')).toBeVisible();
    
    // 現在XPと次レベルまでのXPの確認
    await expect(levelIndicator.locator('text=/\d+.*\/.*\d+.*XP/')).toBeVisible();
  });

  test('should display XP counter with total XP', async ({ page }) => {
    // XPカウンターの確認
    const xpCounter = page.locator('[data-testid="xp-counter"]');
    await expect(xpCounter).toBeVisible();
    
    // 総XP表示の確認
    await expect(xpCounter.locator('text=/\d+.*XP/')).toBeVisible();
    
    // XPアイコンの確認
    await expect(xpCounter.locator('svg')).toBeVisible();
  });

  test('should display current streak information', async ({ page }) => {
    // ストリークカウンターの確認
    const streakCounter = page.locator('[data-testid="streak-counter"]');
    await expect(streakCounter).toBeVisible();
    
    // ストリーク数の確認
    await expect(streakCounter.locator('text=/\d+日連続/')).toBeVisible();
    
    // フレームアイコンの確認
    await expect(streakCounter.locator('svg')).toBeVisible();
  });

  test('should display today routines with gamification elements', async ({ page }) => {
    // 今日のルーティンセクションの確認
    await expect(page.locator('text=今日のルーティン')).toBeVisible();
    
    // ルーティンアイテムにXP表示があることを確認
    const routineItems = page.locator('[data-testid="routine-item"]');
    await expect(routineItems.first().locator('text=/\d+.*XP/')).toBeVisible();
    
    // 完了時のXP獲得表示の確認
    const firstRoutine = routineItems.first();
    if (await firstRoutine.locator('input[type="checkbox"]').isVisible()) {
      // チェックボックスをクリック
      await firstRoutine.locator('input[type="checkbox"]').click();
      
      // XP獲得アニメーションまたはメッセージの確認
      await expect(page.locator('text=XPを獲得しました')).toBeVisible();
    }
  });

  test('should display progress routines with completion rewards', async ({ page }) => {
    // 進行中ルーティンセクションの確認
    await expect(page.locator('text=進行中のルーティン')).toBeVisible();
    
    // プログレスバーの確認
    const progressRoutines = page.locator('[data-testid="progress-routine-item"]');
    await expect(progressRoutines.first().locator('[role="progressbar"]')).toBeVisible();
    
    // 完了時の報酬情報の確認
    await expect(progressRoutines.first().locator('text=/報酬.*\d+.*XP/')).toBeVisible();
  });

  test('should display catchup suggestions with XP incentives', async ({ page }) => {
    // キャッチアップ提案セクションの確認
    const catchupSection = page.locator('[data-testid="catchup-suggestions"]');
    
    if (await catchupSection.isVisible()) {
      // 提案にXPボーナス情報があることを確認
      await expect(catchupSection.locator('text=/ボーナス.*XP/')).toBeVisible();
      
      // 提案アイテムの確認
      const suggestionItems = catchupSection.locator('[data-testid="suggestion-item"]');
      await expect(suggestionItems).toHaveCount(2); // キャッチアップ提案が表示されることを確認
    }
  });

  test('should display recent achievements and notifications', async ({ page }) => {
    // 通知エリアの確認（存在する場合）
    const notificationArea = page.locator('[data-testid="notifications"]');
    
    if (await notificationArea.isVisible()) {
      // バッジ獲得通知の確認
      await expect(notificationArea.locator('text=バッジ獲得')).toBeVisible();
      
      // レベルアップ通知の確認
      await expect(notificationArea.locator('text=レベルアップ')).toBeVisible();
    }
  });

  test('should navigate to profile page from header', async ({ page }) => {
    // プロフィールアバターをクリック
    await page.click('[data-testid="profile-avatar"]');
    
    // プロフィールページに遷移することを確認
    await expect(page).toHaveURL(/.*\/profile/);
    
    // プロフィールページの要素が表示されることを確認
    await expect(page.locator('h1:has-text("プロフィール")')).toBeVisible();
  });

  test('should navigate to missions page from quick access', async ({ page }) => {
    // ミッションへのクイックアクセスリンクをクリック
    const missionsLink = page.locator('a:has-text("ミッション")').first();
    
    if (await missionsLink.isVisible()) {
      await missionsLink.click();
      
      // ミッションページに遷移することを確認
      await expect(page).toHaveURL(/.*\/missions/);
    }
  });

  test('should show level up animation when gaining XP', async ({ page }) => {
    // ルーティンを完了してXPを獲得
    const routineCheckbox = page.locator('input[type="checkbox"]').first();
    await routineCheckbox.click();
    
    // レベルアップの場合のアニメーション確認
    // 実際のレベルアップ条件に応じて調整が必要
    if (await page.locator('text=レベルアップ').isVisible()) {
      await expect(page.locator('[data-testid="level-up-animation"]')).toBeVisible();
    }
  });

  test('should display contextual gamification tips', async ({ page }) => {
    // ゲーミフィケーション関連のヒントやTipsの確認
    const tipsSection = page.locator('[data-testid="gamification-tips"]');
    
    if (await tipsSection.isVisible()) {
      await expect(tipsSection.locator('text=/ヒント|コツ|アドバイス/')).toBeVisible();
    }
  });

  test('should handle XP animation and feedback', async ({ page }) => {
    // ルーティン完了によるXP獲得のテスト
    const routineItem = page.locator('[data-testid="routine-item"]').first();
    const initialXP = await page.locator('[data-testid="xp-counter"]').textContent();
    
    // ルーティンを完了
    await routineItem.locator('input[type="checkbox"]').click();
    
    // XP獲得フィードバックの確認
    await expect(page.locator('text=/\+\d+.*XP/')).toBeVisible();
    
    // XPカウンターの更新確認
    await expect(page.locator('[data-testid="xp-counter"]')).not.toHaveText(initialXP || '');
  });

  test('should be responsive on mobile with gamification elements', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // モバイルでもゲーミフィケーション要素が表示されることを確認
    await expect(page.locator('[data-testid="profile-avatar"]')).toBeVisible();
    await expect(page.locator('[data-testid="level-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="xp-counter"]')).toBeVisible();
    
    // ストリークカウンターがモバイルで適切に表示されることを確認
    await expect(page.locator('[data-testid="streak-counter"]')).toBeVisible();
  });

  test('should maintain gamification state across page interactions', async ({ page }) => {
    // 初期状態の記録
    const initialLevel = await page.locator('[data-testid="user-level"]').textContent();
    const initialXP = await page.locator('[data-testid="xp-counter"]').textContent();
    
    // 他のページに遷移
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');
    
    // ダッシュボードに戻る
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 状態が保持されていることを確認
    await expect(page.locator('[data-testid="user-level"]')).toHaveText(initialLevel || '');
    await expect(page.locator('[data-testid="xp-counter"]')).toHaveText(initialXP || '');
  });

  test('should handle network errors gracefully in gamification features', async ({ page }) => {
    // プロフィール関連APIのエラーをシミュレート
    await page.route('**/api/profile*', route => route.abort());
    await page.reload();
    
    // エラー状態でも基本機能が動作することを確認
    await expect(page.locator('text=今日のルーティン')).toBeVisible();
    
    // エラー状態の表示確認（実装に応じて調整）
  });
});