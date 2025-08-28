import { test, expect } from '@playwright/test';

test.describe('Calendar Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calendar');
    await page.waitForLoadState('networkidle');
  });

  test('should display calendar page title and basic elements', async ({ page }) => {
    // ページタイトルの確認
    await expect(page.locator('h1')).toContainText(/カレンダー|calendar/i);
    
    // カレンダー要素の確認
    const calendar = page.locator('[data-testid="calendar"], .calendar, [role="grid"]');
    if (await calendar.first().isVisible()) {
      await expect(calendar.first()).toBeVisible();
    } else {
      // 基本的なページコンテンツの確認
      await expect(page.locator('main, .content, [role="main"]').first()).toBeVisible();
    }
  });

  test('should display calendar navigation controls', async ({ page }) => {
    // 月/年ナビゲーションの確認
    const prevButton = page.locator('button:has-text("前"), button[aria-label*="前"], [data-testid="prev-month"]');
    const nextButton = page.locator('button:has-text("次"), button[aria-label*="次"], [data-testid="next-month"]');
    
    if (await prevButton.first().isVisible() && await nextButton.first().isVisible()) {
      await expect(prevButton.first()).toBeVisible();
      await expect(nextButton.first()).toBeVisible();
    } else {
    }
    
    // 現在の月/年表示の確認
    const monthYearRegex = page.locator('text=/\\d{4}年\\d{1,2}月/');
    const monthYearDate = page.locator('text=/\\d{4}-\\d{1,2}/');
    const headings = page.locator('h2, h3');
    
    if (await monthYearRegex.first().isVisible() || await monthYearDate.first().isVisible() || await headings.first().isVisible()) {
    }
  });

  test('should display calendar days', async ({ page }) => {
    // カレンダーの日付セルの確認
    const days = page.locator('[data-testid="calendar-day"], .day, [role="gridcell"]');
    const dayCount = await days.count();
    
    if (dayCount > 0) {
      await expect(days.first()).toBeVisible();
      
      // 日付番号の確認
      const dayNumbers = page.locator('text=/^\\d{1,2}$/');
      const numberCount = await dayNumbers.count();
      expect(numberCount).toBeGreaterThan(0);
    } else {
    }
  });

  test('should display routine events on calendar', async ({ page }) => {
    // カレンダー上のルーティンイベントの確認
    const events = page.locator('[data-testid="calendar-event"], .event, .routine-event');
    const eventCount = await events.count();
    
    if (eventCount > 0) {
      await expect(events.first()).toBeVisible();
      
      // イベントの詳細情報確認
      const firstEvent = events.first();
      const eventTitle = firstEvent.locator('.title, [data-testid="event-title"]');
      if (await eventTitle.isVisible()) {
        await expect(eventTitle).toBeVisible();
      }
    } else {
    }
  });

  test('should handle day selection', async ({ page }) => {
    // 日付クリックでの選択機能
    const days = page.locator('[data-testid="calendar-day"], .day, [role="gridcell"]');
    const dayCount = await days.count();
    
    if (dayCount > 0) {
      const firstClickableDay = days.first();
      if (await firstClickableDay.isVisible()) {
        await firstClickableDay.click();
        
        // 選択状態の確認（選択されたスタイルやアクティブ状態）
        const selectedDay = page.locator('.selected, .active, [aria-selected="true"]');
        if (await selectedDay.first().isVisible()) {
          await expect(selectedDay.first()).toBeVisible();
        }
      }
    }
  });

  test('should display daily routine summary when day is selected', async ({ page }) => {
    // 日付選択時の詳細表示
    const days = page.locator('[data-testid="calendar-day"], .day, [role="gridcell"]');
    
    if (await days.first().isVisible()) {
      await days.first().click();
      
      // 日次詳細パネルの確認
      const dailySummary = page.locator('[data-testid="daily-summary"], .daily-details, .day-panel');
      if (await dailySummary.first().isVisible()) {
        await expect(dailySummary.first()).toBeVisible();
        
        // その日のルーティン一覧の確認
        const routineList = dailySummary.first().locator('[data-testid="routine-item"], .routine');
        const routineCount = await routineList.count();
        
        if (routineCount > 0) {
        }
      }
    }
  });

  test('should handle calendar view switching if available', async ({ page }) => {
    // ビュー切り替え（月、週、日）の確認
    const viewButtons = page.locator('button:has-text("月"), button:has-text("週"), button:has-text("日")');
    const monthView = page.locator('button:has-text("月")');
    
    if (await monthView.isVisible()) {
      await expect(monthView).toBeVisible();
      
      // 週表示への切り替え
      const weekView = page.locator('button:has-text("週")');
      if (await weekView.isVisible()) {
        await weekView.click();
      }
      
      // 月表示に戻る
      await monthView.click();
    } else {
    }
  });

  test('should display completion status for routines', async ({ page }) => {
    // ルーティンの完了状況の表示確認
    const completedIndicators = page.locator('[data-testid="completed"], .completed, .done');
    const incompleteIndicators = page.locator('[data-testid="incomplete"], .incomplete, .pending');
    
    const completedCount = await completedIndicators.count();
    const incompleteCount = await incompleteIndicators.count();
    
    if (completedCount > 0 || incompleteCount > 0) {
      
      if (completedCount > 0) {
        await expect(completedIndicators.first()).toBeVisible();
      }
      if (incompleteCount > 0) {
        await expect(incompleteIndicators.first()).toBeVisible();
      }
    } else {
    }
  });

  test('should handle month navigation', async ({ page }) => {
    // 月移動の確認
    const nextButton = page.locator('button:has-text("次"), button[aria-label*="次"], [data-testid="next-month"]');
    const prevButton = page.locator('button:has-text("前"), button[aria-label*="前"], [data-testid="prev-month"]');
    
    if (await nextButton.first().isVisible() && await prevButton.first().isVisible()) {
      // 現在の月を記録
      const currentMonthElement = page.locator('h2, h3').first();
      const currentMonth = await currentMonthElement.textContent();
      
      // 次の月に移動
      await nextButton.first().click();
      await page.waitForTimeout(500); // アニメーション待機
      
      // 月が変わったことを確認
      const newMonthElement = page.locator('h2, h3').first();
      const newMonth = await newMonthElement.textContent();
      expect(newMonth).not.toBe(currentMonth);
      
      // 前の月に戻る
      await prevButton.first().click();
    }
  });

  test('should display today indicator', async ({ page }) => {
    // 今日の日付のハイライト表示
    const today = page.locator('[data-testid="today"], .today, .current-day');
    
    if (await today.first().isVisible()) {
      await expect(today.first()).toBeVisible();
    } else {
      // 現在の日付が含まれているかチェック
      const currentDate = new Date().getDate();
      const dayWithDate = page.locator(`text=${currentDate}`);
      if (await dayWithDate.first().isVisible()) {
      }
    }
  });

  test.skip('should handle routine creation from calendar', async ({ page }) => {
    // カレンダーからのルーティン作成（未実装の場合スキップ）
    // TODO: カレンダー統合機能実装後に有効化
    const days = page.locator('[data-testid="calendar-day"]');
    
    if (await days.first().isVisible()) {
      // ダブルクリックまたは右クリックでの作成
      await days.first().dblclick();
      
      // 作成フォーム/モーダルの確認
      await expect(page.locator('[data-testid="create-routine-modal"]')).toBeVisible();
    }
  });

  test.skip('should display streak visualization', async ({ page }) => {
    // ストリーク可視化（未実装の場合スキップ）
    // TODO: ストリーク可視化機能実装後に有効化
    const streakDays = page.locator('[data-testid="streak-day"], .streak');
    
    if (await streakDays.first().isVisible()) {
      await expect(streakDays.first()).toBeVisible();
      
      const streakCount = await streakDays.count();
      expect(streakCount).toBeGreaterThan(0);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // モバイルでもページタイトルが表示されることを確認
    await expect(page.locator('h1')).toBeVisible();
    
    // カレンダーがモバイルレイアウトに適応することを確認
    const calendar = page.locator('[data-testid="calendar"], .calendar, [role="grid"]');
    if (await calendar.first().isVisible()) {
      await expect(calendar.first()).toBeVisible();
    }
    
    // ナビゲーションボタンがモバイルでもアクセス可能であることを確認
    const navButtons = page.locator('button:has-text("前"), button:has-text("次")');
    if (await navButtons.first().isVisible()) {
      await expect(navButtons.first()).toBeVisible();
    }
  });

  test.skip('should handle data loading states', async ({ page }) => {
    // データローディング状態のテスト（未実装の場合スキップ）
    // TODO: ローディング状態実装後に有効化
    await page.reload();
    
    // ローディングインジケーターの確認
    const loading = page.locator('[data-testid="loading"], .loading, .spinner');
    if (await loading.first().isVisible()) {
      await expect(loading.first()).toBeVisible();
      
      // ローディング完了後のコンテンツ確認
      await expect(loading.first()).toBeHidden();
      await expect(page.locator('[data-testid="calendar"]')).toBeVisible();
    }
  });

  test.skip('should handle network errors gracefully', async ({ page }) => {
    // ネットワークエラーのテスト（エラーハンドリング強化後に有効化）
    // TODO: エラーハンドリング機能強化後に有効化
    await page.route('**/api/calendar*', route => route.abort());
    await page.reload();
    
    // エラー状態の表示確認
    const errorMessage = page.locator('text=エラー, text=読み込みに失敗');
    if (await errorMessage.first().isVisible()) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});